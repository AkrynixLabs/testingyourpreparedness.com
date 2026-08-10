"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, School, CheckCircle2, AlertCircle, Lock, User, Mail } from "lucide-react"
import { verifySchoolCode, registerJoinedStudent, type VerifiedSchool } from "./actions"

export default function JoinSchoolPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [school, setSchool] = useState<VerifiedSchool | null>(null)
  const [formData, setFormData] = useState({
    inviteCode: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleVerifyCode = () => {
    setError("")
    startTransition(async () => {
      try {
        const verified = await verifySchoolCode(formData.inviteCode)
        setSchool(verified)
        setStep(2)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid invite code.")
      }
    })
  }

  const handleSubmit = () => {
    setError("")
    startTransition(async () => {
      try {
        const { email, password } = await registerJoinedStudent({
          schoolCode: formData.inviteCode,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        })

        const result = await signIn("credentials", { email, password, redirect: false })
        if (result?.error) {
          setError("Account created, but automatic sign-in failed. Please log in manually.")
          router.push("/login")
          return
        }
        router.push("/student")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create account.")
      }
    })
  }

  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <header className="p-4">
        <Link
          href="/signup/student"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to student signup
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                T
              </div>
              <span className="font-bold text-2xl tracking-tight">TYP</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2">Join Your School</h1>
            <p className="text-muted-foreground">
              {step === 1 ? "Enter the school code provided by your school" : "Complete your account setup"}
            </p>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  School Code
                </CardTitle>
                <CardDescription>Your school administrator should have given you your school&apos;s code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">School Code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="e.g., ACH-001"
                    value={formData.inviteCode}
                    onChange={(e) => updateFormData("inviteCode", e.target.value.toUpperCase())}
                    className="text-center text-lg tracking-widest font-mono"
                    maxLength={20}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button className="w-full" onClick={handleVerifyCode} disabled={formData.inviteCode.length < 3 || isPending}>
                  {isPending ? "Verifying..." : "Verify Code"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have a school code?{" "}
                    <Link href="/signup/independent" className="text-primary hover:underline">
                      Register as an independent student
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && school && (
            <>
              <Card className="mb-4 border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {school.town}, {school.region}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Create Your Account
                  </CardTitle>
                  <CardDescription>Fill in your details to complete registration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Was unconditional grid-cols-2 - the only form-field
                      grid in the whole app without a responsive prefix,
                      forcing First/Last Name side-by-side even on a narrow
                      phone screen. Every sibling signup wizard uses
                      sm:grid-cols-2 (single column below that breakpoint) -
                      found by a static mobile-audit pass 2026-08-08 (see
                      docs/build-log.md; this couldn't be visually confirmed,
                      no browser tooling available, but it's a clear outlier
                      against every other identical pattern in this codebase). */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => updateFormData("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => updateFormData("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => updateFormData("email", e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Use your personal email or one assigned by your school</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Create Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(1)
                        setSchool(null)
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={
                        !formData.firstName ||
                        !formData.lastName ||
                        !formData.email ||
                        !formData.password ||
                        formData.password !== formData.confirmPassword ||
                        isPending
                      }
                    >
                      {isPending ? "Creating Account..." : "Complete Registration"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
