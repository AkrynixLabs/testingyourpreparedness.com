import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyWebhookSignature } from "@/lib/video/mux"

// Mux's asset processing is asynchronous - this is the source of truth for
// "is the uploaded video actually ready to play." Matches the finished
// asset back to a Lesson row via muxUploadId (known since upload-URL
// creation, before the asset exists) - same "webhook is authoritative, not
// a client-side poll" pattern as app/api/webhooks/paystack/route.ts.
export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get("mux-signature")

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.type === "video.asset.ready") {
    const uploadId: string | undefined = event.data?.upload_id
    const assetId: string | undefined = event.data?.id
    const playbackId: string | undefined = event.data?.playback_ids?.[0]?.id
    if (uploadId && assetId && playbackId) {
      await prisma.lesson.updateMany({
        where: { muxUploadId: uploadId },
        data: { muxAssetId: assetId, muxPlaybackId: playbackId, muxStatus: "ready" },
      })
    }
  } else if (event.type === "video.asset.errored") {
    const uploadId: string | undefined = event.data?.upload_id
    if (uploadId) {
      await prisma.lesson.updateMany({ where: { muxUploadId: uploadId }, data: { muxStatus: "errored" } })
    }
  }

  return NextResponse.json({ received: true })
}
