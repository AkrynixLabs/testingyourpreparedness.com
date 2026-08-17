"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Video, Calendar, X, Copy, Check } from "lucide-react"
import { scheduleVirtualSession, cancelVirtualSession } from "../actions"
import type { VirtualSessionMode } from "@/lib/generated/prisma/client"

export type VirtualSessionRow = {
  id: string
  title: string
  description: string | null
  scheduledAt: string
  durationMinutes: number
  mode: VirtualSessionMode
  dailyRoomUrl: string | null
  externalMeetingUrl: string | null
  status: string
}

export function VirtualSessionsSection({ courseId, sessions }: { courseId: string; sessions: VirtualSessionRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    durationMinutes: "60",
    mode: "daily" as VirtualSessionMode,
    externalMeetingUrl: "",
  })

  const resetForm = () =>
    setForm({ title: "", description: "", scheduledAt: "", durationMinutes: "60", mode: "daily", externalMeetingUrl: "" })

  const handleSchedule = () => {
    setError(null)
    startTransition(async () => {
      try {
        await scheduleVirtualSession({
          courseId,
          title: form.title,
          description: form.description,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          durationMinutes: Number(form.durationMinutes),
          mode: form.mode,
          externalMeetingUrl: form.externalMeetingUrl,
        })
        setDialogOpen(false)
        resetForm()
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to schedule session.")
      }
    })
  }

  const handleCancel = (sessionId: string) => {
    startTransition(async () => {
      await cancelVirtualSession(sessionId)
      router.refresh()
    })
  }

  const handleCopyLink = (sessionId: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(sessionId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Virtual Sessions</CardTitle>
          <CardDescription>Live sessions for everyone enrolled in this course</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule a Virtual Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes) *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>How will this session run?</Label>
                <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v as VirtualSessionMode })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">In-app video call (native)</SelectItem>
                    <SelectItem value="external_link">External link (Zoom, Google Meet, etc.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.mode === "external_link" && (
                <div className="space-y-2">
                  <Label>Meeting Link *</Label>
                  <Input
                    placeholder="https://zoom.us/j/..."
                    value={form.externalMeetingUrl}
                    onChange={(e) => setForm({ ...form, externalMeetingUrl: e.target.value })}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSchedule} disabled={isPending}>
                {isPending ? "Scheduling..." : "Schedule Session"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No virtual sessions scheduled yet.</p>
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Video className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{s.title}</p>
                    <Badge variant={s.status === "cancelled" ? "secondary" : "outline"} className="text-xs">
                      {s.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {s.mode === "daily" ? "In-app call" : "External link"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(s.scheduledAt).toLocaleString()} - {s.durationMinutes} min
                  </p>
                </div>
              </div>
              {s.status !== "cancelled" && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyLink(s.id, s.dailyRoomUrl ?? s.externalMeetingUrl ?? "")}
                    title="Copy join link"
                  >
                    {copiedId === s.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleCancel(s.id)} disabled={isPending} title="Cancel session">
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
