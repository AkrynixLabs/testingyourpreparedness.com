"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle2,
  Mail,
  Clock,
  ArrowRight,
  School,
  FileText,
  Phone,
} from "lucide-react"

export default function SchoolRegistrationSuccessPage() {
  return (
    <div className="marketing min-h-screen bg-background text-foreground bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <School className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">TYP</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Registration Submitted!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for registering your school with TYP
            </p>
          </div>

          {/* What's Next */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
              <CardDescription>Your registration is being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Check Your Email
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      We&apos;ve sent a confirmation email to your registered address. 
                      Please verify your email within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Verification Review
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our team will review your school registration. This typically takes 1-2 business days.
                      You may be contacted for additional documentation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Account Activation
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Once verified, your account will be activated and you can start 
                      adding students and using the platform.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estimated Time */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Estimated Verification Time</p>
                  <p className="text-sm text-muted-foreground">1-2 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Need Assistance?</p>
                    <p className="text-sm text-muted-foreground">Contact our support team</p>
                  </div>
                </div>
                <Link href="/contact">
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
            <Link href="/login">
              <Button className="w-full sm:w-auto">
                Go to Login
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
