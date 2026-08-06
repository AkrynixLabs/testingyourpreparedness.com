"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, GraduationCap, School, UserPlus } from "lucide-react"

export default function StudentSignupPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <header className="p-4">
        <Link href="/signup" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to signup options
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                T
              </div>
              <span className="font-bold text-2xl tracking-tight">TYP</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2">Student Registration</h1>
            <p className="text-muted-foreground">Choose how you want to create your student account</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Independent Student */}
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <Link href="/signup/independent">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl flex items-center justify-between">
                    Independent Student
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription>
                    Study on your own with a personal subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Create your own account
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Choose your subscription plan
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Study at your own pace
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Parent/guardian approval required
                    </li>
                  </ul>
                </CardContent>
              </Link>
            </Card>

            {/* School Student */}
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-2">
                  <School className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl text-muted-foreground">
                  School Student
                </CardTitle>
                <CardDescription>
                  Your school provides access to TYP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    Account created by your school
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    No personal subscription needed
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    School monitors your progress
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    Access to school assessments
                  </li>
                </ul>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> If your school uses TYP, ask your teacher or administrator 
                    for your login credentials. You don&apos;t need to create an account yourself.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Join School Code */}
          <Card className="mt-6 border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Have a school invite code?</p>
                    <p className="text-xs text-muted-foreground">Join your school&apos;s TYP account</p>
                  </div>
                </div>
                <Link href="/join">
                  <Button variant="outline" size="sm">
                    Enter Code
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

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
