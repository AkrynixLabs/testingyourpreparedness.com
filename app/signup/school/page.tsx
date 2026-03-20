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
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  School,
  ArrowLeft,
  ArrowRight,
  Check,
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

const schoolTypes = [
  { value: "public", label: "Public School" },
  { value: "private", label: "Private School" },
  { value: "international", label: "International School" },
  { value: "religious", label: "Religious/Mission School" },
]

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 299,
    period: "month",
    students: "Up to 100 students",
    features: [
      "100 student accounts",
      "All 8 BECE subjects",
      "Basic analytics",
      "Email support",
      "Standard question bank",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 599,
    period: "month",
    students: "Up to 300 students",
    popular: true,
    features: [
      "300 student accounts",
      "All 8 BECE subjects",
      "Advanced analytics",
      "Priority support",
      "Full question bank",
      "Custom assessments",
      "Parent portal",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    period: "month",
    students: "Unlimited students",
    features: [
      "Unlimited student accounts",
      "All 8 BECE subjects",
      "Full analytics suite",
      "Dedicated support",
      "Premium question bank",
      "Custom assessments",
      "Parent portal",
      "API access",
      "Custom branding",
    ],
  },
]

export default function SchoolRegistrationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // School Information
    schoolName: "",
    schoolType: "",
    registrationNumber: "",
    yearEstablished: "",
    website: "",
    
    // Location
    region: "",
    district: "",
    town: "",
    address: "",
    postalCode: "",
    
    // Administrator
    adminTitle: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
    adminPosition: "",
    adminPassword: "",
    adminConfirmPassword: "",
    
    // School Size
    totalStudents: "",
    jhsStudents: "",
    numberOfClasses: "",
    
    // Plan
    selectedPlan: "professional",
    billingCycle: "monthly",
    
    // Agreement
    agreeTerms: false,
    agreePrivacy: false,
    authorizedSignup: false,
  })

  const totalSteps = 5
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
      router.push("/signup/school/success")
    }, 2000)
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculatePrice = () => {
    const plan = plans.find(p => p.id === formData.selectedPlan)
    if (!plan) return 0
    if (formData.billingCycle === "yearly") {
      return plan.price * 12 * 0.8 // 20% discount
    }
    return plan.price
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <School className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">TYP</span>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Already registered?</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">Register Your School</h1>
              <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className={step >= 1 ? "text-primary font-medium" : ""}>School Info</span>
              <span className={step >= 2 ? "text-primary font-medium" : ""}>Location</span>
              <span className={step >= 3 ? "text-primary font-medium" : ""}>Administrator</span>
              <span className={step >= 4 ? "text-primary font-medium" : ""}>School Size</span>
              <span className={step >= 5 ? "text-primary font-medium" : ""}>Plan</span>
            </div>
          </div>

          {/* Step 1: School Information */}
          {step === 1 && (
            <Card>
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
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schoolType">School Type *</Label>
                    <Select value={formData.schoolType} onValueChange={(v) => updateFormData("schoolType", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select school type" />
                      </SelectTrigger>
                      <SelectContent>
                        {schoolTypes.map((type) => (
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
                        After registration, our team will verify your school details. 
                        You may be asked to provide additional documentation.
                      </p>
                    </div>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
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
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      placeholder="Enter district"
                      value={formData.district}
                      onChange={(e) => updateFormData("district", e.target.value)}
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
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Administrator Account */}
          {step === 3 && (
            <Card>
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
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="adminTitle">Title</Label>
                    <Select value={formData.adminTitle} onValueChange={(v) => updateFormData("adminTitle", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mr">Mr.</SelectItem>
                        <SelectItem value="mrs">Mrs.</SelectItem>
                        <SelectItem value="ms">Ms.</SelectItem>
                        <SelectItem value="dr">Dr.</SelectItem>
                        <SelectItem value="prof">Prof.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminFirstName">First Name *</Label>
                    <Input
                      id="adminFirstName"
                      placeholder="First name"
                      value={formData.adminFirstName}
                      onChange={(e) => updateFormData("adminFirstName", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminLastName">Last Name *</Label>
                    <Input
                      id="adminLastName"
                      placeholder="Last name"
                      value={formData.adminLastName}
                      onChange={(e) => updateFormData("adminLastName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPosition">Position/Role *</Label>
                  <Select value={formData.adminPosition} onValueChange={(v) => updateFormData("adminPosition", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="headmaster">Headmaster/Headmistress</SelectItem>
                      <SelectItem value="assistant-head">Assistant Headmaster</SelectItem>
                      <SelectItem value="academic-head">Academic Head</SelectItem>
                      <SelectItem value="ict-coordinator">ICT Coordinator</SelectItem>
                      <SelectItem value="administrator">School Administrator</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Official Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@school.edu.gh"
                      className="pl-10"
                      value={formData.adminEmail}
                      onChange={(e) => updateFormData("adminEmail", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use your official school email if available
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPhone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminPhone"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      className="pl-10"
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
                        className="pl-10"
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
                        This account will have full administrative access including managing students, 
                        teachers, billing, and school settings.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: School Size */}
          {step === 4 && (
            <Card>
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
                    <Label htmlFor="jhsStudents">JHS Students (Forms 1-3) *</Label>
                    <Input
                      id="jhsStudents"
                      type="number"
                      placeholder="e.g., 200"
                      value={formData.jhsStudents}
                      onChange={(e) => updateFormData("jhsStudents", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Only JHS students will use the TYP platform
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numberOfClasses">Number of JHS Classes</Label>
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
                      Based on {formData.jhsStudents} JHS students, we recommend the{" "}
                      <span className="font-medium text-primary">
                        {parseInt(formData.jhsStudents) <= 100 
                          ? "Starter" 
                          : parseInt(formData.jhsStudents) <= 300 
                            ? "Professional" 
                            : "Enterprise"
                        }
                      </span>{" "}
                      plan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Choose Plan */}
          {step === 5 && (
            <Card>
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
                {/* Billing Cycle */}
                <div className="space-y-3">
                  <Label>Billing Cycle</Label>
                  <RadioGroup
                    value={formData.billingCycle}
                    onValueChange={(v) => updateFormData("billingCycle", v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yearly" id="yearly" />
                      <Label htmlFor="yearly" className="cursor-pointer">
                        Yearly <span className="text-emerald-600 text-xs ml-1">(Save 20%)</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Plans */}
                <div className="grid gap-4">
                  {plans.map((plan) => {
                    const monthlyPrice = formData.billingCycle === "yearly" 
                      ? Math.round(plan.price * 0.8) 
                      : plan.price
                    const totalPrice = formData.billingCycle === "yearly"
                      ? monthlyPrice * 12
                      : monthlyPrice

                    return (
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
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground">{plan.students}</p>
                            <div className="flex items-baseline gap-1 mt-2">
                              <span className="text-3xl font-bold">GHS {monthlyPrice}</span>
                              <span className="text-muted-foreground">/month</span>
                            </div>
                            {formData.billingCycle === "yearly" && (
                              <p className="text-sm text-emerald-600">
                                GHS {totalPrice}/year (Save GHS {plan.price * 12 - totalPrice})
                              </p>
                            )}
                          </div>
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                            formData.selectedPlan === plan.id ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}>
                            {formData.selectedPlan === plan.id && (
                              <Check className="h-4 w-4 text-primary-foreground" />
                            )}
                          </div>
                        </div>
                        <ul className="mt-4 space-y-2">
                          {plan.features.map((feature, idx) => (
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

                {/* Agreements */}
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
                      <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                      {" "}and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Registration Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">School:</span>
                      <span className="font-medium">{formData.schoolName || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium">{plans.find(p => p.id === formData.selectedPlan)?.name}</span>
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
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.agreeTerms || !formData.authorizedSignup || loading}
              >
                {loading ? "Registering School..." : "Complete Registration"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
