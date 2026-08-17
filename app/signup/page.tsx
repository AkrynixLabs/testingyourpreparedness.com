"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomCursor } from "@/components/custom-cursor"
import { Reveal } from "@/components/reveal"
import { ArrowLeft, School, GraduationCap, ArrowRight, Presentation, Check } from "lucide-react"

const colorClasses = {
  "chart-1": { bg: "bg-chart-1/15", text: "text-chart-1", border: "border-chart-1/30" },
  "chart-2": { bg: "bg-chart-2/15", text: "text-chart-2", border: "border-chart-2/30" },
  "chart-5": { bg: "bg-chart-5/15", text: "text-chart-5", border: "border-chart-5/30" },
} as const

type ChartColor = keyof typeof colorClasses

const roleOptions: {
  href: string
  icon: typeof School
  color: ChartColor
  title: string
  description: string
  features: string[]
}[] = [
  {
    href: "/signup/school",
    icon: School,
    color: "chart-1",
    title: "Register a School",
    description: "For school administrators looking to onboard their institution",
    features: [
      "Manage students and classes",
      "Assign assessments school-wide",
      "Access detailed analytics",
      "Flexible subscription plans",
    ],
  },
  {
    href: "/signup/independent",
    icon: GraduationCap,
    color: "chart-2",
    title: "Student Account",
    description: "For independent students preparing for BECE on their own",
    features: [
      "Start with free plan",
      "Access practice tests",
      "Track your progress",
      "Get study recommendations",
    ],
  },
  {
    href: "/signup/tutor",
    icon: Presentation,
    color: "chart-5",
    title: "Become a Tutor",
    description: "Create and sell your own courses to students",
    features: [
      "Publish courses instantly",
      "Set your own pricing",
      "Earn from every enrollment",
      "Track student engagement",
    ],
  },
]

export default function SignupPage() {
  return (
    <div className="marketing relative isolate min-h-screen flex flex-col overflow-x-hidden bg-background text-foreground bg-gradient-to-br from-background via-background to-primary/5">
      <CustomCursor />
      <div className="absolute inset-0 bg-grain" />
      <div
        aria-hidden
        className="animate-glow-pulse absolute left-1/2 top-1/4 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]"
      />

      <header className="p-4 md:p-5 relative shrink-0">
        <Link
          href="/"
          data-cursor="small"
          className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-border hover:bg-background hover:text-foreground hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6 relative">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center justify-center mb-3">
              <img src="/logo.png" alt="TYP - Testing Your Preparedness" className="h-10 w-auto" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mb-1.5">Create your account</h1>
            <p className="text-base text-muted-foreground">Choose how you want to get started</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {roleOptions.map((option, i) => (
              <Reveal key={option.href} delay={i * 100}>
                <Card
                  data-cursor="big"
                  className="group relative h-full gap-4 overflow-hidden border-border py-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                >
                  <option.icon
                    aria-hidden
                    strokeWidth={0.75}
                    className={`pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 opacity-[0.07] transition-transform duration-300 group-hover:scale-110 ${colorClasses[option.color].text}`}
                  />
                  <Link href={option.href} className="relative flex h-full flex-col">
                    <CardHeader className="gap-2 px-6">
                      <div
                        className={`mb-1 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${colorClasses[option.color].bg}`}
                      >
                        <option.icon className={`h-6 w-6 ${colorClasses[option.color].text}`} />
                      </div>
                      <CardTitle className="text-lg flex items-center justify-between gap-3">
                        {option.title}
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${colorClasses[option.color].border} ${colorClasses[option.color].text} transition-all duration-300 group-hover:translate-x-1 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground`}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </CardTitle>
                      <CardDescription className="text-sm">{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto px-6">
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {option.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-1.5">
                            <Check className={`h-3 w-3 shrink-0 ${colorClasses[option.color].text}`} />
                            <span className="leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Link>
                </Card>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>

          <div className="mt-2 text-center">
            <p className="text-sm text-muted-foreground">
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
