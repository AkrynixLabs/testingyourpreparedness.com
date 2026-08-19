"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { approveGuardianship } from "./actions"

type ApprovalState =
  | { status: "valid"; guardianName: string; studentName: string }
  | { status: "invalid" | "expired" | "used" }

const STATE_COPY: Record<"invalid" | "expired" | "used", { title: string; description: string }> = {
  invalid: {
    title: "Invalid Link",
    description: "This approval link isn't valid. Ask the learner to check the link they shared with you.",
  },
  expired: {
    title: "Link Expired",
    description: "This approval link has expired. Ask the learner to update their contact details so a new one can be sent.",
  },
  used: {
    title: "Already Approved",
    description: "You've already approved this registration - no further action is needed.",
  },
}

export function GuardianApproveForm({ token, approval }: { token: string; approval: ApprovalState }) {
  const [error, setError] = useState<string | null>(null)
  const [approved, setApproved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (approval.status !== "valid") {
    const copy = STATE_COPY[approval.status]
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (approved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl">Approved</CardTitle>
            <CardDescription>
              Thank you - you've approved {approval.studentName}&apos;s TYP registration.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleApprove = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await approveGuardianship(token)
      setApproved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Approve Registration</CardTitle>
          <CardDescription>
            Hi {approval.guardianName}, <strong>{approval.studentName}</strong> has registered for a TYP account and
            listed you as their guardian. Do you approve this registration?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}
          <Button className="w-full" onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting ? "Approving..." : "Approve Registration"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Questions? <Link href="/contact" className="text-primary hover:underline">Contact TYP support</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
