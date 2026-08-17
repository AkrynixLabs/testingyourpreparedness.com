import crypto from "node:crypto"

// Internal video-hosting interface (same "route through an internal layer,
// never call the SDK/API directly from business logic" pattern as
// lib/payments/paystack.ts / lib/email/resend.ts). Mux chosen 2026-08-17
// (confirmed with the user) for platform-hosted lesson video - purpose-built
// for upload -> transcode -> adaptive-streaming playback, versus reusing
// Vercel Blob (not built for video at scale) or continuing to require
// external URLs only. External URLs (Lesson.videoSource = "external") are
// still fully supported - this is an additional option, not a replacement.

const MUX_API_BASE = "https://api.mux.com"

function getCredentials(): { tokenId: string; tokenSecret: string } {
  const tokenId = process.env.MUX_TOKEN_ID
  const tokenSecret = process.env.MUX_TOKEN_SECRET
  if (!tokenId || !tokenSecret) {
    throw new Error("Mux isn't configured yet - set MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env (see .env.example).")
  }
  return { tokenId, tokenSecret }
}

function authHeader(): string {
  const { tokenId, tokenSecret } = getCredentials()
  return "Basic " + Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64")
}

export type CreateDirectUploadResult = {
  uploadId: string
  uploadUrl: string
}

// Called when a tutor picks "Upload Video" for a lesson - returns a URL the
// browser uploads the file bytes to directly (PUT), never routing the video
// itself through our own server. uploadId is stored on the Lesson row
// immediately (see Lesson.muxUploadId) so the later webhook can match the
// finished asset back to the right lesson - Mux's own processing is
// asynchronous (encoding takes time), so there's no playable asset yet at
// this point.
export async function createDirectUpload(): Promise<CreateDirectUploadResult> {
  const response = await fetch(`${MUX_API_BASE}/video/v1/uploads`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({
      cors_origin: "*",
      new_asset_settings: { playback_policy: ["public"] },
    }),
  })
  if (!response.ok) {
    throw new Error(`Mux direct-upload creation failed: ${response.status} ${await response.text()}`)
  }
  const { data } = await response.json()
  return { uploadId: data.id, uploadUrl: data.url }
}

export async function deleteAsset(assetId: string): Promise<void> {
  const response = await fetch(`${MUX_API_BASE}/video/v1/assets/${assetId}`, {
    method: "DELETE",
    headers: { Authorization: authHeader() },
  })
  if (!response.ok && response.status !== 404) {
    throw new Error(`Mux asset deletion failed: ${response.status} ${await response.text()}`)
  }
}

// Mux signs webhook payloads as `t=<timestamp>,v1=<hmac>` in the
// Mux-Signature header - same verify-before-trusting pattern as
// lib/payments/paystack.ts's verifyWebhookSignature.
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.MUX_WEBHOOK_SECRET
  if (!secret || !signatureHeader) return false

  const parts = Object.fromEntries(signatureHeader.split(",").map((p) => p.split("=") as [string, string]))
  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false

  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex")
  const expectedBuf = Buffer.from(expected)
  const signatureBuf = Buffer.from(signature)
  if (signatureBuf.length !== expectedBuf.length) return false
  return crypto.timingSafeEqual(signatureBuf, expectedBuf)
}
