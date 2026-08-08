"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { GraduationCap, ArrowLeft, ArrowRight, Check, User, Mail, Lock, MapPin, CreditCard } from "lucide-react"
import { registerIndependentStudent, initializeStudentCheckout } from "./actions"
import type { BillingCycle, SubscriptionPlan } from "@/lib/generated/prisma/client"

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
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    region: "",
    town: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    selectedPlan: plans.find((p) => (p.monthlyPrice ?? 0) > 0)?.id ?? plans[0]?.id ?? "",
    agreeTerms: false,
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

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
          guardianName: formData.guardianName,
          guardianPhone: formData.guardianPhone,
          guardianEmail: formData.guardianEmail,
          guardianApproved: formData.agreeTerms,
        })
        studentId = result.studentId
        email = result.email
        password = result.password
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create account.")
        return
      }

      const signInResult = await signIn("credentials", { email, password, redirect: false })
      if (signInResult?.error) {
        setError("Account created, but automatic sign-in failed. Please log in manually.")
        router.push("/login")
        return
      }

      const selectedPlan = plans.find((p) => p.id === formData.selectedPlan)
      const { price, cycle } = selectedPlan ? planPriceAndCycle(selectedPlan) : { price: 0, cycle: null }

      if (!selectedPlan || price === 0 || !cycle) {
        // Free plan (or nothing selectable) - no checkout needed.
        router.push("/student")
        return
      }

      try {
        const { authorizationUrl } = await initializeStudentCheckout({
          studentId,
          planId: selectedPlan.id,
          billingCycle: cycle,
        })
        window.location.href = authorizationUrl
      } catch (err) {
        console.error("Checkout could not be started:", err)
        router.push("/student")
      }
    })
  }

  return (
    <div className="marketing min-h-screen bg-background text-foreground bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">TYP</span>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Already have an account?</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">Create Your Account</h1>
              <span className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className={step >= 1 ? "text-primary font-medium" : ""}>Personal Info</span>
              <span className={step >= 2 ? "text-primary font-medium" : ""}>Location</span>
              <span className={step >= 3 ? "text-primary font-medium" : ""}>Guardian</span>
              <span className={step >= 4 ? "text-primary font-medium" : ""}>Plan</span>
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {step === 1 && (
            <Card>
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
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
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
                      placeholder="you@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create password"
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
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
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
                  <Label htmlFor="region">Region</Label>
                  <Select value={formData.region} onValueChange={(v) => updateFormData("region", v)}>
                    <SelectTrigger>
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
                  <Label htmlFor="town">Town/City</Label>
                  <Input
                    id="town"
                    placeholder="Enter your town or city"
                    value={formData.town}
                    onChange={(e) => updateFormData("town", e.target.value)}
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
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Guardian Information</CardTitle>
                    <CardDescription>Parent or guardian contact details</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Guardian Full Name</Label>
                  <Input
                    id="guardianName"
                    placeholder="Enter guardian's full name"
                    value={formData.guardianName}
                    onChange={(e) => updateFormData("guardianName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Guardian Phone Number</Label>
                  <Input
                    id="guardianPhone"
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={formData.guardianPhone}
                    onChange={(e) => updateFormData("guardianPhone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Guardian Email (Optional)</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    placeholder="guardian@example.com"
                    value={formData.guardianEmail}
                    onChange={(e) => updateFormData("guardianEmail", e.target.value)}
                  />
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Your guardian will receive updates about your progress and will be required to approve your
                    subscription.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
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
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    . I confirm that my guardian has approved this registration.
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <Link href="/signup">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Options
                </Button>
              </Link>
            )}

            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!formData.agreeTerms || isPending}>
                {isPending ? "Creating Account..." : "Complete Registration"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
