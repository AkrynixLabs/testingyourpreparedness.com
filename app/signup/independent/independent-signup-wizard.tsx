"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CustomCursor } from "@/components/custom-cursor"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, Check, ChevronRight, User, Mail, Lock, MapPin, CreditCard } from "lucide-react"
import { registerIndependentStudent, initializeStudentCheckout } from "./actions"
import type { BillingCycle, SubscriptionPlan } from "@/lib/generated/prisma/client"

const steps = [
  { number: 1, label: "Personal Info" },
  { number: 2, label: "Location" },
  { number: 3, label: "Plan" },
]

const regions = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Volta",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Western North",
  "Oti",
  "North East",
  "Savannah",
]

function planPriceAndCycle(plan: SubscriptionPlan): { price: number; cycle: BillingCycle | null } {
  if (plan.monthlyPrice !== null) return { price: plan.monthlyPrice, cycle: "monthly" }
  if (plan.termPrice !== null) return { price: plan.termPrice, cycle: "term" }
  if (plan.yearlyPrice !== null) return { price: plan.yearlyPrice, cycle: "yearly" }
  return { price: 0, cycle: null }
}

const cycleLabel: Record<string, string> = { monthly: "month", term: "term", yearly: "year" }

export function IndependentSignupWizard({ plans }: { plans: SubscriptionPlan[] }) {
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [accountCreated, setAccountCreated] = useState<{ email: string } | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    region: "",
    town: "",
    referralCode: "",
    selectedPlan: plans.find((p) => (p.monthlyPrice ?? 0) > 0)?.id ?? plans[0]?.id ?? "",
    agreeTerms: false,
    subscribeNewsletter: false,
  })

  const totalSteps = 3
  const [attemptedNext, setAttemptedNext] = useState(false)

  // Required fields per step, checked before advancing - previously `handleNext`
  // just incremented the step with no validation, so a user could click through
  // with every field blank and only find out something was wrong at final submit.
  const requiredFields: Record<number, { field: keyof typeof formData; label: string }[]> = {
    1: [
      { field: "firstName", label: "First Name" },
      { field: "lastName", label: "Last Name" },
      { field: "email", label: "Email Address" },
      { field: "password", label: "Password" },
      { field: "confirmPassword", label: "Confirm Password" },
    ],
    2: [
      { field: "region", label: "Region" },
      { field: "town", label: "Town/City" },
    ],
  }

  const isFieldMissing = (field: keyof typeof formData) => {
    const value = formData[field]
    return typeof value === "string" && !value.trim()
  }

  const handleNext = () => {
    const missing = (requiredFields[step] ?? []).filter(({ field }) => isFieldMissing(field))
    if (missing.length > 0) {
      setAttemptedNext(true)
      setError(`Please fill in: ${missing.map((m) => m.label).join(", ")}.`)
      return
    }
    if (step === 1) {
      if (formData.password.length < 8) {
        setAttemptedNext(true)
        setError("Password must be at least 8 characters.")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setAttemptedNext(true)
        setError("Password and confirmation don't match.")
        return
      }
    }
    setAttemptedNext(false)
    setError(null)
    if (step < totalSteps) setStep(step + 1)
  }

  const handleBack = () => {
    setAttemptedNext(false)
    setError(null)
    if (step > 1) setStep(step - 1)
  }

  const invalidClass = (field: keyof typeof formData) =>
    cn(attemptedNext && isFieldMissing(field) && "border-destructive focus-visible:ring-destructive")

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Password and confirmation don't match.")
      return
    }
    setError(null)

    startTransition(async () => {
      let studentId: string
      let email: string
      let password: string
      try {
        const result = await registerIndependentStudent({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          region: formData.region,
          town: formData.town,
          referralCode: formData.referralCode,
          subscribeNewsletter: formData.subscribeNewsletter,
        })
        studentId = result.studentId
        email = result.email
        password = result.password
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create account.")
        return
      }

      // No auto-sign-in - the account now needs a verified email before
      // login works at all (see prisma/schema.prisma's User model), so
      // signing in immediately here would just fail.
      const selectedPlan = plans.find((p) => p.id === formData.selectedPlan)
      const { price, cycle } = selectedPlan ? planPriceAndCycle(selectedPlan) : { price: 0, cycle: null }

      if (!selectedPlan || price === 0 || !cycle) {
        // Free plan (or nothing selectable) - no checkout needed, show the
        // "check your email" confirmation instead of navigating into
        // /student (which would just bounce back to /login unauthenticated).
        setAccountCreated({ email })
        return
      }

      try {
        // initializeStudentCheckout now works unauthenticated for a
        // genuinely new student (see its own doc comment) - Paystack's
        // redirect happens regardless of the verification-email gate, since
        // checkout and login are independent concerns.
        const { authorizationUrl } = await initializeStudentCheckout({
          studentId,
          planId: selectedPlan.id,
          billingCycle: cycle,
        })
        window.location.href = authorizationUrl
      } catch (err) {
        console.error("Checkout could not be started:", err)
        setAccountCreated({ email })
      }
    })
  }

  if (accountCreated) {
    return (
      <div className="marketing relative isolate min-h-screen flex flex-col overflow-hidden bg-background text-foreground bg-gradient-to-br from-background via-background to-primary/5">
        <CustomCursor />
        <div className="absolute inset-0 bg-grain" />
        <main className="flex-1 flex items-center justify-center p-4 relative">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-muted-foreground mb-1">
              Your account is created. We&apos;ve sent a verification link to <strong>{accountCreated.email}</strong>.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Click the link to verify your address, then log in - the link expires in 48 hours.
            </p>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="marketing relative isolate min-h-screen bg-background text-foreground bg-gradient-to-br from-background via-background to-primary/5">
      <CustomCursor />
      <div className="absolute inset-0 bg-grain" />
      <div
        aria-hidden
        className="animate-glow-pulse absolute left-1/2 top-0 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-[120px]"
      />

      <header className="relative border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center" data-cursor="small">
            <img src="/logo.png" alt="TYP - Testing Your Preparedness" className="h-9 w-auto" />
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/25">
              Already have an account?
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-10 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-1.5">Create Your Account</h1>
            <p className="text-base text-muted-foreground">Set up your independent learner account in a few quick steps</p>
          </div>

          {/* Step navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-center gap-y-2">
              {steps.map((s, idx) => (
                <div key={s.number} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => s.number < step && setStep(s.number)}
                    disabled={s.number >= step}
                    aria-current={s.number === step ? "step" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all",
                      s.number < step
                        ? "cursor-pointer border-primary/30 bg-primary/10 text-primary hover:border-primary hover:bg-primary/15"
                        : s.number === step
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "cursor-default border-border text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                        s.number < step
                          ? "bg-primary text-primary-foreground"
                          : s.number === step
                          ? "bg-primary-foreground text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {s.number < step ? <Check className="h-3 w-3" /> : s.number}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <ChevronRight
                      className={cn("mx-1 h-4 w-4 shrink-0", s.number < step ? "text-primary" : "text-border")}
                    />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground sm:hidden">
              Step {step} of {totalSteps} &middot; {steps[step - 1].label}
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {step === 1 && (
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Tell us about yourself</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      className={invalidClass("firstName")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      className={invalidClass("lastName")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={cn("pl-10", invalidClass("email"))}
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create password"
                        className={cn("pl-10", invalidClass("password"))}
                        value={formData.password}
                        onChange={(e) => updateFormData("password", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      className={invalidClass("confirmPassword")}
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <Input
                    id="referralCode"
                    placeholder="Got a code from a friend? Enter it here"
                    value={formData.referralCode}
                    onChange={(e) => updateFormData("referralCode", e.target.value.toUpperCase())}
                  />
                  <p className="text-xs text-muted-foreground">
                    You and your friend each get 7 free days once you subscribe.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Your Location</CardTitle>
                    <CardDescription>Help us personalize your experience</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select value={formData.region} onValueChange={(v) => updateFormData("region", v)}>
                    <SelectTrigger className={invalidClass("region")}>
                      <SelectValue placeholder="Select your region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="town">Town/City *</Label>
                  <Input
                    id="town"
                    placeholder="Enter your town or city"
                    value={formData.town}
                    onChange={(e) => updateFormData("town", e.target.value)}
                    className={invalidClass("town")}
                  />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Your location helps us show you relevant content and connect you with students in your area.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Choose Your Plan</CardTitle>
                    <CardDescription>Select a subscription that works for you</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {plans.map((plan) => {
                    const { price, cycle } = planPriceAndCycle(plan)
                    const features = plan.features as string[]
                    return (
                      <div
                        key={plan.id}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => updateFormData("selectedPlan", plan.id)}
                      >
                        {plan.popular && (
                          <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            Most Popular
                          </span>
                        )}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-1">
                              {price === 0 ? (
                                <span className="text-2xl font-bold">Free</span>
                              ) : (
                                <>
                                  <span className="text-2xl font-bold">
                                    {plan.currency} {price}
                                  </span>
                                  <span className="text-muted-foreground">/{cycle && cycleLabel[cycle]}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              formData.selectedPlan === plan.id ? "border-primary bg-primary" : "border-muted-foreground"
                            }`}
                          >
                            {formData.selectedPlan === plan.id && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                        </div>
                        <ul className="mt-3 space-y-1">
                          {features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="h-3 w-3 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Paid plans will take you to a secure Paystack checkout after your account is created. The Free
                  plan needs no payment.
                </p>

                <div className="flex items-start gap-2 pt-4">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => updateFormData("agreeTerms", checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onCheckedChange={(checked) => updateFormData("subscribeNewsletter", checked as boolean)}
                  />
                  <label htmlFor="subscribeNewsletter" className="text-sm text-muted-foreground">
                    Send me marketing emails and feature updates (optional)
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <Button size="lg" variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <Link href="/signup">
                <Button size="lg" variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Options
                </Button>
              </Link>
            )}

            {step < totalSteps ? (
              <Button size="lg" onClick={handleNext} className="group">
                Continue
                <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            ) : (
              <Button size="lg" onClick={handleSubmit} disabled={!formData.agreeTerms || isPending}>
                {isPending ? "Creating Account..." : "Complete Registration"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
