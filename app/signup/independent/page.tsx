"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Mail,
  Lock,
  MapPin,
  CreditCard,
} from "lucide-react"

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

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 15,
    period: "month",
    features: [
      "Access to all subjects",
      "500 practice questions",
      "Basic progress tracking",
      "Email support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 35,
    period: "month",
    popular: true,
    features: [
      "Everything in Basic",
      "Unlimited practice questions",
      "Detailed analytics",
      "Video explanations",
      "Personalized study plans",
      "Priority support",
    ],
  },
  {
    id: "annual",
    name: "Annual Premium",
    price: 299,
    period: "year",
    savings: "Save GHS 121",
    features: [
      "Everything in Premium",
      "Offline access",
      "1-on-1 tutoring sessions",
      "Guaranteed BECE prep",
      "Parent dashboard access",
    ],
  },
]

export default function IndependentSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    region: "",
    town: "",
    currentForm: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    selectedPlan: "premium",
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

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => {
      router.push("/student")
    }, 2000)
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="marketing min-h-screen bg-background text-foreground bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
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
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">Create Your Account</h1>
              <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className={step >= 1 ? "text-primary font-medium" : ""}>Personal Info</span>
              <span className={step >= 2 ? "text-primary font-medium" : ""}>Location</span>
              <span className={step >= 3 ? "text-primary font-medium" : ""}>Guardian</span>
              <span className={step >= 4 ? "text-primary font-medium" : ""}>Plan</span>
            </div>
          </div>

          {/* Step 1: Personal Information */}
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

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentForm">Current Form/Class</Label>
                  <Select value={formData.currentForm} onValueChange={(v) => updateFormData("currentForm", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your current form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jhs1">JHS 1</SelectItem>
                      <SelectItem value="jhs2">JHS 2</SelectItem>
                      <SelectItem value="jhs3">JHS 3</SelectItem>
                    </SelectContent>
                  </Select>
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

          {/* Step 2: Location */}
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
                        <SelectItem key={region} value={region.toLowerCase().replace(/\s+/g, "-")}>
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

          {/* Step 3: Guardian Information */}
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
                    Your guardian will receive updates about your progress and will be required to approve your subscription.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Choose Plan */}
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
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.selectedPlan === plan.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => updateFormData("selectedPlan", plan.id)}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Most Popular
                        </span>
                      )}
                      {plan.savings && (
                        <span className="absolute -top-3 right-4 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                          {plan.savings}
                        </span>
                      )}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{plan.name}</h3>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold">GHS {plan.price}</span>
                            <span className="text-muted-foreground">/{plan.period}</span>
                          </div>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          formData.selectedPlan === plan.id ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}>
                          {formData.selectedPlan === plan.id && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                      <ul className="mt-3 space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-3 w-3 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 pt-4">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => updateFormData("agreeTerms", checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                    I confirm that my guardian has approved this registration.
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
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
              <Button onClick={handleSubmit} disabled={!formData.agreeTerms || loading}>
                {loading ? "Creating Account..." : "Complete Registration"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
