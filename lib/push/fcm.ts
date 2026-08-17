import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"
import { prisma } from "@/lib/prisma"

// Internal push-notification interface (same "route third-party integrations
// through an internal layer, never call the SDK directly from business
// logic" pattern as lib/payments/paystack.ts / lib/email/resend.ts) -
// Firebase Cloud Messaging chosen 2026-08-16 (confirmed with the user first,
// standard/free, one API for Android+iOS). Mobile v1 is student-only, so
// this only ever targets Student device tokens - no admin/tutor push exists.

function getMessagingClient() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!serviceAccountJson) {
    throw new Error(
      "Push notifications aren't configured yet - set FIREBASE_SERVICE_ACCOUNT_JSON in .env (see .env.example)."
    )
  }

  if (getApps().length === 0) {
    const serviceAccount = JSON.parse(serviceAccountJson)
    initializeApp({ credential: cert(serviceAccount) })
  }
  return getMessaging()
}

export type PushNotificationInput = {
  title: string
  body: string
  // Arbitrary string data the Flutter client can read on tap (e.g. which
  // screen to open) - FCM requires string values only, not typed JSON.
  data?: Record<string, string>
}

// Sends to every device a student is currently signed into (DeviceToken can
// have more than one row per student - see prisma/schema.prisma's comment).
// A token FCM reports as invalid/unregistered (app uninstalled, token
// rotated without re-registering) is pruned from the DB right here, so the
// table doesn't accumulate dead rows forever.
async function sendToStudent(studentId: string, notification: PushNotificationInput): Promise<void> {
  const tokens = await prisma.deviceToken.findMany({ where: { studentId }, select: { id: true, token: true } })
  if (tokens.length === 0) return

  const messaging = getMessagingClient()
  const response = await messaging.sendEachForMulticast({
    tokens: tokens.map((t) => t.token),
    notification: { title: notification.title, body: notification.body },
    data: notification.data,
  })

  const deadTokenIds: string[] = []
  response.responses.forEach((result, i) => {
    const code = result.error?.code
    if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
      deadTokenIds.push(tokens[i].id)
    }
  })
  if (deadTokenIds.length > 0) {
    await prisma.deviceToken.deleteMany({ where: { id: { in: deadTokenIds } } })
  }
}

// Best-effort send: logs and swallows any error (unconfigured, FCM API
// failure) instead of throwing - push is always a nice-to-have layered on
// top of an already-real in-app experience (the exam/result is there
// whether or not the push arrives), so a misconfigured/down provider must
// never block the underlying action. Matches sendEmailBestEffort's contract
// exactly.
export async function sendPushToStudentBestEffort(studentId: string, notification: PushNotificationInput): Promise<void> {
  try {
    await sendToStudent(studentId, notification)
  } catch (err) {
    console.error("[push] best-effort send failed:", err instanceof Error ? err.message : err)
  }
}
