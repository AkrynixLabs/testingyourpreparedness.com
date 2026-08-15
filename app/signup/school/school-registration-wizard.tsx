"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  User,
  Mail,
  Lock,
  MapPin,
  CreditCard,
  Building2,
  Phone,
  Users,
  FileText,
  Shield,
} from "lucide-react"
import { CustomCursor } from "@/components/custom-cursor"
import { cn } from "@/lib/utils"
import { registerSchool, initializeSchoolCheckout } from "./actions"
import type { OwnershipType, SubscriptionPlan } from "@/lib/generated/prisma/client"

const steps = [
  { number: 1, label: "School Info" },
  { number: 2, label: "Location" },
  { number: 3, label: "Administrator" },
  { number: 4, label: "School Size" },
  { number: 5, label: "Plan" },
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

const ownershipTypes: { value: OwnershipType; label: string }[] = [
  { value: "public", label: "Public School" },
  { value: "private", label: "Private School" },
  { value: "international", label: "International School" },
  { value: "religious", label: "Religious/Mission School" },
]

export function SchoolRegistrationWizard({ plans }: { plans: SubscriptionPlan[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    schoolName: "",
    ownershipType: "" as "" | OwnershipType,
    registrationNumber: "",
    yearEstablished: "",
    website: "",

    region: "",
    district: "",
    town: "",
    address: "",
    postalCode: "",

    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
    adminConfirmPassword: "",

    totalStudents: "",
    jhsStudents: "",
    numberOfClasses: "",

    selectedPlan: plans.find((p) => p.popular)?.id ?? plans[0]?.id ?? "",
    billingCycle: "monthly" as "monthly" | "yearly",

    agreeTerms: false,
    agreePrivacy: false,
    authorizedSignup: false,
    subscribeNewsletter: false,
  })

  const totalSteps = 5
  const [attemptedNext, setAttemptedNext] = useState(false)

  // Required fields per step, checked before advancing - previously `handleNext`
  // just incremented the step with no validation at all, so a user could click
  // through every step with every field blank and only find out something was
  // missing (or, worse, hit a raw server error) at the final submit.
  const requiredFields: Record<number, { field: keyof typeof formData; label: string }[]> = {
    1: [
      { field: "schoolName", label: "School Name" },
      { field: "ownershipType", label: "Ownership Type" },
    ],
    2: [
      { field: "region", label: "Region" },
      { field: "district", label: "District" },
      { field: "town", label: "Town/City" },
      { field: "address", label: "Full Address" },
    ],
    3: [
      { field: "adminFirstName", label: "First Name" },
      { field: "adminLastName", label: "Last Name" },
      { field: "adminEmail", label: "Official Email" },
      { field: "adminPhone", label: "Phone Number" },
      { field: "adminPassword", label: "Password" },
      { field: "adminConfirmPassword", label: "Confirm Password" },
    ],
    4: [{ field: "jhsStudents", label: "JHS Students (Forms 1-3)" }],
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
    if (step === 3) {
      if (formData.adminPassword.length < 8) {
        setAttemptedNext(true)
        setError("Password must be at least 8 characters.")
        return
      }
      if (formData.adminPassword !== formData.adminConfirmPassword) {
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

  const selectedPlanData = plans.find((p) => p.id === formData.selectedPlan)

  const calculatePrice = () => {
    if (!selectedPlanData) return 0
    if (formData.billingCycle === "yearly") return selectedPlanData.yearlyPrice ?? 0
    return selectedPlanData.monthlyPrice ?? 0
  }

  const handleSubmit = () => {
    if (formData.adminPassword !== formData.adminConfirmPassword) {
      setError("Password and confirmation don't match.")
      return
    }
    if (!formData.ownershipType) {
      setError("Please select an ownership type.")
      return
    }
    setError(null)

    startTransition(async () => {
      let schoolId: string
      try {
        const result = await registerSchool({
          schoolName: formData.schoolName,
          ownershipType: formData.ownershipType as OwnershipType,
          registrationNumber: formData.registrationNumber,
          yearEstablished: formData.yearEstablished,
          website: formData.website,
          region: formData.region,
          district: formData.district,
          town: formData.town,
          address: formData.address,
          postalCode: formData.postalCode,
          adminFirstName: formData.adminFirstName,
          adminLastName: formData.adminLastName,
          adminEmail: formData.adminEmail,
          adminPhone: formData.adminPhone,
          adminPassword: formData.adminPassword,
          subscribeNewsletter: formData.subscribeNewsletter,
        })
        schoolId = result.schoolId
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to register school.")
        return
      }

      // The school account is real at this point regardless of what happens
      // next - a checkout failure (e.g. Paystack not configured in this
      // environment) must not look like the whole registration failed.
      try {
        const { authorizationUrl } = await initializeSchoolCheckout({
          schoolId,
          planId: formData.selectedPlan,
          billingCycle: formData.billingCycle,
        })
        window.location.href = authorizationUrl
      } catch (err) {
        console.error("Checkout could not be started:", err)
        router.push("/signup/school/success")
      }
    })
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
              Already registered?
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-10 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-1.5">Register Your School</h1>
            <p className="text-base text-muted-foreground">Get your school set up on TYP in a few quick steps</p>
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
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>School Information</CardTitle>
                    <CardDescription>Basic details about your institution</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    placeholder="e.g., Achimota Senior High School"
                    value={formData.schoolName}
                    onChange={(e) => updateFormData("schoolName", e.target.value)}
                    className={invalidClass("schoolName")}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ownershipType">Ownership Type *</Label>
                    <Select value={formData.ownershipType} onValueChange={(v) => updateFormData("ownershipType", v)}>
                      <SelectTrigger className={invalidClass("ownershipType")}>
                        <SelectValue placeholder="Select school type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownershipTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">GES Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      placeholder="e.g., GES/123456"
                      value={formData.registrationNumber}
                      onChange={(e) => updateFormData("registrationNumber", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="yearEstablished">Year Established</Label>
                    <Input
                      id="yearEstablished"
                      type="number"
                      placeholder="e.g., 1990"
                      value={formData.yearEstablished}
                      onChange={(e) => updateFormData("yearEstablished", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">School Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.yourschool.edu.gh"
                      value={formData.website}
                      onChange={(e) => updateFormData("website", e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Verification Required</p>
                      <p className="text-muted-foreground">
                        After registration, our team will verify your school details. You may be asked to provide
                        additional documentation.
                      </p>
                    </div>
                  </div>
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
                    <CardTitle>School Location</CardTitle>
                    <CardDescription>Where is your school located?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region *</Label>
                    <Select value={formData.region} onValueChange={(v) => updateFormData("region", v)}>
                      <SelectTrigger className={invalidClass("region")}>
                        <SelectValue placeholder="Select region" />
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
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      placeholder="Enter district"
                      value={formData.district}
                      onChange={(e) => updateFormData("district", e.target.value)}
                      className={invalidClass("district")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="town">Town/City *</Label>
                    <Input
                      id="town"
                      placeholder="Enter town or city"
                      value={formData.town}
                      onChange={(e) => updateFormData("town", e.target.value)}
                      className={invalidClass("town")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal/GPS Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="e.g., GA-123-4567"
                      value={formData.postalCode}
                      onChange={(e) => updateFormData("postalCode", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter the complete school address"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    className={invalidClass("address")}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Administrator Account</CardTitle>
                    <CardDescription>Create the primary administrator account</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adminFirstName">First Name *</Label>
                    <Input
                      id="adminFirstName"
                      placeholder="First name"
                      value={formData.adminFirstName}
                      onChange={(e) => updateFormData("adminFirstName", e.target.value)}
                      className={invalidClass("adminFirstName")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminLastName">Last Name *</Label>
                    <Input
                      id="adminLastName"
                      placeholder="Last name"
                      value={formData.adminLastName}
                      onChange={(e) => updateFormData("adminLastName", e.target.value)}
                      className={invalidClass("adminLastName")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Official Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@school.edu.gh"
                      className={cn("pl-10", invalidClass("adminEmail"))}
                      value={formData.adminEmail}
                      onChange={(e) => updateFormData("adminEmail", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Use your official school email if available</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPhone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminPhone"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      className={cn("pl-10", invalidClass("adminPhone"))}
                      value={formData.adminPhone}
                      onChange={(e) => updateFormData("adminPhone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="adminPassword"
                        type="password"
                        placeholder="Create password"
                        className={cn("pl-10", invalidClass("adminPassword"))}
                        value={formData.adminPassword}
                        onChange={(e) => updateFormData("adminPassword", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminConfirmPassword">Confirm Password *</Label>
                    <Input
                      id="adminConfirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      className={invalidClass("adminConfirmPassword")}
                      value={formData.adminConfirmPassword}
                      onChange={(e) => updateFormData("adminConfirmPassword", e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-primary">Administrator Privileges</p>
                      <p className="text-muted-foreground">
                        This account will have full administrative access including managing students, teachers, and
                        school settings.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>School Size</CardTitle>
                    <CardDescription>Help us recommend the right plan for your school</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="totalStudents">Total Student Population</Label>
                    <Input
                      id="totalStudents"
                      type="number"
                      placeholder="e.g., 500"
                      value={formData.totalStudents}
                      onChange={(e) => updateFormData("totalStudents", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jhsStudents">Students (Forms 1-3) *</Label>
                    <Input
                      id="jhsStudents"
                      type="number"
                      placeholder="e.g., 200"
                      value={formData.jhsStudents}
                      onChange={(e) => updateFormData("jhsStudents", e.target.value)}
                      className={invalidClass("jhsStudents")}
                    />
                    <p className="text-xs text-muted-foreground">All students will use the TYP platform</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfClasses">Number of Classes</Label>
                  <Select value={formData.numberOfClasses} onValueChange={(v) => updateFormData("numberOfClasses", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1-3 classes</SelectItem>
                      <SelectItem value="4-6">4-6 classes</SelectItem>
                      <SelectItem value="7-9">7-9 classes</SelectItem>
                      <SelectItem value="10-15">10-15 classes</SelectItem>
                      <SelectItem value="15+">More than 15 classes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.jhsStudents && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm font-medium">Recommended Plan</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on {formData.jhsStudents} students, we recommend the{" "}
                      <span className="font-medium text-primary">
                        {parseInt(formData.jhsStudents) <= 100
                          ? "Starter"
                          : parseInt(formData.jhsStudents) <= 500
                          ? "Professional"
                          : "Enterprise"}
                      </span>{" "}
                      plan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <Card className="border-border/60 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Choose Your Plan</CardTitle>
                    <CardDescription>Select a subscription that fits your school</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Billing Cycle</Label>
                  <RadioGroup
                    value={formData.billingCycle}
                    onValueChange={(v) => updateFormData("billingCycle", v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="cursor-pointer">
                        Monthly
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yearly" id="yearly" />
                      <Label htmlFor="yearly" className="cursor-pointer">
                        Yearly <span className="text-emerald-600 text-xs ml-1">(Save 20%)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-4">
                  {plans.map((plan) => {
                    const monthlyEquivalent =
                      formData.billingCycle === "yearly" && plan.yearlyPrice
                        ? Math.round(plan.yearlyPrice / 12)
                        : plan.monthlyPrice ?? 0
                    const totalPrice = formData.billingCycle === "yearly" ? plan.yearlyPrice ?? 0 : plan.monthlyPrice ?? 0
                    const savings = (plan.monthlyPrice ?? 0) * 12 - (plan.yearlyPrice ?? 0)
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
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {plan.studentLimit ? `Up to ${plan.studentLimit} students` : "Unlimited students"}
                            </p>
                            <div className="flex items-baseline gap-1 mt-2">
                              <span className="text-3xl font-bold">GHS {monthlyEquivalent}</span>
                              <span className="text-muted-foreground">/month</span>
                            </div>
                            {formData.billingCycle === "yearly" && (
                              <p className="text-sm text-emerald-600">
                                GHS {totalPrice}/year (Save GHS {savings})
                              </p>
                            )}
                          </div>
                          <div
                            className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                              formData.selectedPlan === plan.id ? "border-primary bg-primary" : "border-muted-foreground"
                            }`}
                          >
                            {formData.selectedPlan === plan.id && <Check className="h-4 w-4 text-primary-foreground" />}
                          </div>
                        </div>
                        <ul className="mt-4 space-y-2">
                          {features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="authorizedSignup"
                      checked={formData.authorizedSignup}
                      onCheckedChange={(checked) => updateFormData("authorizedSignup", checked as boolean)}
                    />
                    <label htmlFor="authorizedSignup" className="text-sm text-muted-foreground">
                      I am authorized to register this school and agree to be the primary administrator
                    </label>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => updateFormData("agreeTerms", checked as boolean)}
                    />
                    <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
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
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Registration Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">School:</span>
                      <span className="font-medium">{formData.schoolName || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium">{selectedPlanData?.name ?? "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Billing:</span>
                      <span className="font-medium capitalize">{formData.billingCycle}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t mt-2">
                      <span className="font-medium">Total Due:</span>
                      <span className="font-bold text-primary">GHS {calculatePrice()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Payments aren&apos;t processed yet - your registration will be reviewed before billing starts.
                  </p>
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
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!formData.agreeTerms || !formData.authorizedSignup || isPending}
              >
                {isPending ? "Registering School..." : "Complete Registration"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
