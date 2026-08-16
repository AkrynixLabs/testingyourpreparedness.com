"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Check, X } from "lucide-react"
import { approveStudentJoinRequest, rejectStudentJoinRequest } from "./actions"
import type { StudentRow } from "./students-table"

// A real approval queue for school-code self-join requests (added
// 2026-08-16) - previously joining via code created an instantly-active
// account with zero notice to the school. Same "actionable queue" pattern
// already used elsewhere in this app (Review Queue, Payments, Messages),
// scoped to one school rather than platform-wide.
export function PendingJoinRequests({ requests }: { requests: StudentRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actingOn, setActingOn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = (studentId: string) => {
    setError(null)
    setActingOn(studentId)
    startTransition(async () => {
      try {
        await approveStudentJoinRequest(studentId)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to approve request.")
      } finally {
        setActingOn(null)
      }
    })
  }

  const handleReject = (studentId: string) => {
    setError(null)
    setActingOn(studentId)
    startTransition(async () => {
      try {
        await rejectStudentJoinRequest(studentId)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reject request.")
      } finally {
        setActingOn(null)
      }
    })
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Pending Join Requests
          <Badge>{requests.length}</Badge>
        </CardTitle>
        <CardDescription>
          These people used your school code to request an account. Approve only students you actually recognize.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{req.user.name}</p>
              <p className="text-sm text-muted-foreground">{req.user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(req.id)}
                disabled={isPending && actingOn === req.id}
              >
                <X className="mr-1 h-4 w-4" />
                Reject
              </Button>
              <Button size="sm" onClick={() => handleApprove(req.id)} disabled={isPending && actingOn === req.id}>
                <Check className="mr-1 h-4 w-4" />
                {isPending && actingOn === req.id ? "Working..." : "Approve"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
