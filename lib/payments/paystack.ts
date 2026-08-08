import crypto from "node:crypto"

// Internal payment interface (per CLAUDE.md's "route all payment logic
// through an internal interface, never call the SDK directly from business
// logic" decision). Paystack is the only processor today - this file is the
// single place that knows about Paystack's actual REST API, so a second
// processor could be added later without touching call sites.

const PAYSTACK_API_BASE = "https://api.paystack.co"

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) {
    throw new Error(
      "Paystack isn't configured yet - set PAYSTACK_SECRET_KEY in .env (see .env.example)."
    )
  }
  return key
}

export type InitializeTransactionInput = {
  email: string
  amountGhs: number // whole cedis - converted to pesewas (Paystack's subunit) here
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
  // Paystack Split Payments: when set, Paystack routes the tutor's share
  // directly to their subaccount at charge time, no manual payout ledger
  // needed on our side (see CLAUDE.md's course-marketplace payout decision).
  // Omitted when the tutor hasn't completed subaccount setup yet - the full
  // amount goes to the platform's main account in that case, and our own
  // CoursePurchase.platformFee/tutorPayout record is kept for manual
  // reconciliation later.
  subaccountCode?: string
  // The exact amount (whole cedis) the platform keeps, overriding whatever
  // default percentage_charge the subaccount was created with - this keeps
  // the actual Paystack split in sync with our own computed
  // CoursePurchase.platformFee even if the platform fee changes after the
  // subaccount was created. Only meaningful alongside subaccountCode.
  transactionChargeGhs?: number
  // Who bears Paystack's own processing fee - "subaccount" (tutor absorbs
  // it, the common marketplace default) or "account" (platform absorbs it).
  // Only meaningful alongside subaccountCode.
  bearer?: "subaccount" | "account"
}

export type InitializeTransactionResult = {
  authorizationUrl: string
  accessCode: string
  reference: string
}

export async function initializeTransaction(
  input: InitializeTransactionInput
): Promise<InitializeTransactionResult> {
  const secretKey = getSecretKey()

  const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountGhs * 100), // GHS -> pesewas
      reference: input.reference,
      callback_url: input.callbackUrl,
      currency: "GHS",
      metadata: input.metadata ?? {},
      ...(input.subaccountCode ? { subaccount: input.subaccountCode } : {}),
      ...(input.subaccountCode && input.transactionChargeGhs !== undefined
        ? { transaction_charge: Math.round(input.transactionChargeGhs * 100) }
        : {}),
      ...(input.subaccountCode && input.bearer ? { bearer: input.bearer } : {}),
    }),
  })

  const body = await response.json()
  if (!response.ok || !body.status) {
    throw new Error(body.message || `Paystack initialize failed with status ${response.status}.`)
  }

  return {
    authorizationUrl: body.data.authorization_url,
    accessCode: body.data.access_code,
    reference: body.data.reference,
  }
}

export type VerifyTransactionResult = {
  status: "success" | "failed" | "abandoned" | string
  reference: string
  amountGhs: number
  metadata: Record<string, unknown> | null
}

export async function verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
  const secretKey = getSecretKey()

  const response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })

  const body = await response.json()
  if (!response.ok || !body.status) {
    throw new Error(body.message || `Paystack verify failed with status ${response.status}.`)
  }

  return {
    status: body.data.status,
    reference: body.data.reference,
    amountGhs: body.data.amount / 100,
    metadata: body.data.metadata ?? null,
  }
}

export type Bank = { name: string; code: string }

// Ghana bank/mobile-money channel list, used to populate the tutor payout
// setup form's bank picker - Paystack resolves the actual account against
// whichever code is selected, so this never needs to be kept in sync by hand.
export async function listBanks(): Promise<Bank[]> {
  const secretKey = getSecretKey()

  const response = await fetch(`${PAYSTACK_API_BASE}/bank?currency=GHS&country=ghana&perPage=100`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })

  const body = await response.json()
  if (!response.ok || !body.status) {
    throw new Error(body.message || `Paystack bank list failed with status ${response.status}.`)
  }

  return (body.data as Array<{ name: string; code: string }>).map((b) => ({ name: b.name, code: b.code }))
}

export type ResolvedAccount = { accountName: string }

// Confirms an account number actually belongs to the selected bank before a
// subaccount is created against it - lets the tutor see the real account
// holder's name and catch a typo before submitting.
export async function resolveAccountNumber(accountNumber: string, bankCode: string): Promise<ResolvedAccount> {
  const secretKey = getSecretKey()

  const response = await fetch(
    `${PAYSTACK_API_BASE}/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  )

  const body = await response.json()
  if (!response.ok || !body.status) {
    throw new Error(body.message || "Couldn't verify that account number - check the bank and number are correct.")
  }

  return { accountName: body.data.account_name }
}

export type CreateSubaccountInput = {
  businessName: string
  bankCode: string
  accountNumber: string
  // The platform's cut at the time the subaccount is created - stored by
  // Paystack as the subaccount's default split, but every real transaction
  // in this app overrides it explicitly via transaction_charge (see
  // initializeTransaction above) so a later platform-fee change doesn't
  // silently drift from what this subaccount was configured with.
  percentageCharge: number
}

export type CreateSubaccountResult = { subaccountCode: string }

export async function createSubaccount(input: CreateSubaccountInput): Promise<CreateSubaccountResult> {
  const secretKey = getSecretKey()

  const response = await fetch(`${PAYSTACK_API_BASE}/subaccount`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      business_name: input.businessName,
      settlement_bank: input.bankCode,
      account_number: input.accountNumber,
      percentage_charge: input.percentageCharge,
    }),
  })

  const body = await response.json()
  if (!response.ok || !body.status) {
    throw new Error(body.message || `Paystack subaccount creation failed with status ${response.status}.`)
  }

  return { subaccountCode: body.data.subaccount_code }
}

// Paystack signs webhook payloads with HMAC-SHA512 of the raw request body,
// keyed by the secret key - sent back in the `x-paystack-signature` header.
// This never calls Paystack's API, so it works even without a configured key
// for testing purposes, but a real deployment must have PAYSTACK_SECRET_KEY
// set for this to mean anything (getSecretKey() enforces that).
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false
  const secretKey = getSecretKey()
  const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex")
  // Constant-time comparison to avoid timing attacks.
  const expectedBuf = Buffer.from(expected)
  const actualBuf = Buffer.from(signatureHeader)
  if (expectedBuf.length !== actualBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, actualBuf)
}
