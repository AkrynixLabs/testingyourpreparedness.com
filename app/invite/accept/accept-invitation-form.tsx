"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { acceptInvitation } from "./actions"

type InvitationState =
  | { status: "valid"; email: string; schoolName: string }
  | { status: "invalid" | "expired" | "used" }

const STATE_COPY: Record<"invalid" | "expired" | "used", { title: string; description: string }> = {
  invalid: {
    title: "Invalid Invitation",
    description: "This invitation link isn't valid. Ask your school administrator to check the link they sent.",
  },
  expired: {
    title: "Invitation Expired",
    description: "This invitation link has expired. Ask your school administrator to send a new one.",
  },
  used: {
    title: "Already Accepted",
    description: "This invitation has already been used. If this was you, log in with your existing account.",
  },
}

export function AcceptInvitationForm({ token, invitation }: { token: string; invitation: InvitationState }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (invitation.status !== "valid") {
    const copy = STATE_COPY[invitation.status]
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
          <CardContent className="text-center">
            <Link href="/login" className="text-primary font-medium hover:underline text-sm">
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    setIsSubmitting(true)
    try {
      const { email } = await acceptInvitation({ token, name, password })
      const signInResult = await signIn("credentials", { email, password, redirect: false })
      if (signInResult?.error) {
        router.push("/login")
        return
      }
      router.push("/school-admin")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl">Join {invitation.schoolName}</CardTitle>
          <CardDescription>You've been invited as a school administrator. Create your account below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={invitation.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Accept & Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
