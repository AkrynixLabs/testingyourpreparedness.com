"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, MailCheck } from "lucide-react"
import { confirmEmailVerification } from "./actions"

const ERROR_COPY: Record<"invalid" | "expired", { title: string; description: string }> = {
  invalid: {
    title: "Invalid Link",
    description: "This verification link isn't valid. It may have already been used, or the link was copied incorrectly.",
  },
  expired: {
    title: "Link Expired",
    description: "This verification link has expired. Log in and use \"Resend verification email\" to get a new one.",
  },
}

export function VerifyEmailAction({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "verifying" | "success" | "invalid" | "expired">(token ? "idle" : "invalid")

  const handleVerify = async () => {
    setState("verifying")
    const result = await confirmEmailVerification(token)
    setState(result.ok ? "success" : result.reason)
  }

  if (state === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl">Email Verified</CardTitle>
          <CardDescription>Your account is ready. You can log in now.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (state === "invalid" || state === "expired") {
    const copy = ERROR_COPY[state]
    return (
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
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <MailCheck className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>Confirm this is really your email address to finish setting up your TYP account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={handleVerify} disabled={state === "verifying"}>
          {state === "verifying" ? "Verifying..." : "Verify My Email"}
        </Button>
      </CardContent>
    </Card>
  )
}
