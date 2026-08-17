// Internal video-calling interface, same pattern as lib/video/mux.ts /
// lib/payments/paystack.ts. Daily.co chosen 2026-08-17 (confirmed with the
// user) for native in-app virtual sessions - a prebuilt embeddable call UI
// (iframe on web, SDK on Flutter) rather than building a custom WebRTC UI
// on top of a lower-level SDK.

const DAILY_API_BASE = "https://api.daily.co/v1"

function getApiKey(): string {
  const key = process.env.DAILY_API_KEY
  if (!key) {
    throw new Error("Daily.co isn't configured yet - set DAILY_API_KEY in .env (see .env.example).")
  }
  return key
}

export type CreateRoomInput = {
  name: string // unique room name, stored as VirtualSession.dailyRoomName
  expiresAt: Date // Daily auto-deletes the room after this - set comfortably past scheduledAt + durationMinutes
}

export type CreateRoomResult = {
  roomUrl: string
}

export async function createRoom(input: CreateRoomInput): Promise<CreateRoomResult> {
  const response = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getApiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      properties: {
        exp: Math.floor(input.expiresAt.getTime() / 1000),
        enable_chat: true,
      },
    }),
  })
  if (!response.ok) {
    throw new Error(`Daily.co room creation failed: ${response.status} ${await response.text()}`)
  }
  const data = await response.json()
  return { roomUrl: data.url }
}

export async function deleteRoom(name: string): Promise<void> {
  const response = await fetch(`${DAILY_API_BASE}/rooms/${name}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getApiKey()}` },
  })
  if (!response.ok && response.status !== 404) {
    throw new Error(`Daily.co room deletion failed: ${response.status} ${await response.text()}`)
  }
}
