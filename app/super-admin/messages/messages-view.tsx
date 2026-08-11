"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Mail, MailOpen } from "lucide-react"
import { markMessageRead } from "./actions"

type Message = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  subject: string
  message: string
  status: string
  createdAt: string
}

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  parent: "Parent/Guardian",
  teacher: "Teacher",
  "school-admin": "School Administrator",
  other: "Other",
}

const SUBJECT_LABELS: Record<string, string> = {
  general: "General Inquiry",
  technical: "Technical Support",
  billing: "Billing Question",
  partnership: "Partnership Opportunity",
  feedback: "Feedback",
}

export function MessagesView({ messages }: { messages: Message[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | "new" | "read">("all")
  const [selected, setSelected] = useState<Message | null>(null)
  const [, startTransition] = useTransition()

  const filtered = messages.filter((m) => filter === "all" || m.status === filter)
  const newCount = messages.filter((m) => m.status === "new").length

  const openMessage = (message: Message) => {
    setSelected(message)
    if (message.status === "new") {
      startTransition(async () => {
        await markMessageRead(message.id)
        router.refresh()
      })
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "new" | "read")}>
        <TabsList>
          <TabsTrigger value="all">All ({messages.length})</TabsTrigger>
          <TabsTrigger value="new">New ({newCount})</TabsTrigger>
          <TabsTrigger value="read">Read ({messages.length - newCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">No messages.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <Card
              key={m.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => openMessage(m)}
            >
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {m.status === "new" ? (
                    <Mail className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <MailOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${m.status === "new" ? "font-semibold" : "font-medium"}`}>
                      {m.firstName} {m.lastName} <span className="text-muted-foreground font-normal">- {m.email}</span>
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{m.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary">{SUBJECT_LABELS[m.subject] ?? m.subject}</Badge>
                  {m.status === "new" && <Badge>New</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selected.firstName} {selected.lastName}
                </DialogTitle>
                <DialogDescription>
                  {selected.email} · {ROLE_LABELS[selected.role] ?? selected.role} ·{" "}
                  {new Date(selected.createdAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Badge variant="secondary">{SUBJECT_LABELS[selected.subject] ?? selected.subject}</Badge>
                <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
              </div>
              <Button asChild variant="outline">
                <a href={`mailto:${selected.email}`}>Reply via Email</a>
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
