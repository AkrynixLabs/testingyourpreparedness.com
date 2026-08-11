"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomCursor } from "@/components/custom-cursor"
import { GraduationCap, Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react"
import { requestPasswordReset } from "./actions"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetUrl, setResetUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await requestPasswordReset(email)
      setResetUrl(result.resetUrl)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request password reset.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground bg-gradient-to-br from-background via-background to-primary/5">
      <CustomCursor />
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">TYP</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {!submitted ? (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                <CardDescription>
                  No worries! Enter your email and we will send you reset instructions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <div className="text-center">
                    <Link href="/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl">Reset Link Generated</CardTitle>
                <CardDescription>
                  A password reset link was generated for <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
                  <p className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400 mb-2">
                    <KeyRound className="h-4 w-4" />
                    No email service is set up yet
                  </p>
                  <p className="text-muted-foreground mb-2">
                    Normally this link would be emailed to you. For now, use it directly:
                  </p>
                  {resetUrl && (
                    <Link href={resetUrl} className="text-primary font-medium hover:underline break-all">
                      {resetUrl}
                    </Link>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSubmitted(false)}
                >
                  Try Another Email
                </Button>
                <div className="text-center">
                  <Link href="/login" className="text-sm text-primary hover:underline">
                    Back to Login
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
