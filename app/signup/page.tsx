"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, School, GraduationCap, ArrowRight, Presentation } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <header className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                T
              </div>
              <span className="font-bold text-2xl tracking-tight">TYP</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">Choose how you want to get started</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <Link href="/signup/school">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <School className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl flex items-center justify-between">
                    Register a School
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription>
                    For school administrators looking to onboard their institution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>Manage students and classes</li>
                    <li>Assign assessments school-wide</li>
                    <li>Access detailed analytics</li>
                    <li>Flexible subscription plans</li>
                  </ul>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <Link href="/signup/independent">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl flex items-center justify-between">
                    Student Account
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription>
                    For independent students preparing for BECE on their own
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>Start with free plan</li>
                    <li>Access practice tests</li>
                    <li>Track your progress</li>
                    <li>Get study recommendations</li>
                  </ul>
                </CardContent>
              </Link>
            </Card>

            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <Link href="/signup/tutor">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <Presentation className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl flex items-center justify-between">
                    Become a Tutor
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription>
                    Create and sell your own courses to students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>Publish courses instantly</li>
                    <li>Set your own pricing</li>
                    <li>Earn from every enrollment</li>
                    <li>Track student engagement</li>
                  </ul>
                </CardContent>
              </Link>
            </Card>
          </div>

          <div className="mt-8 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Are you part of a school?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Ask your administrator for an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
