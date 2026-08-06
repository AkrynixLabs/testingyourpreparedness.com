import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Reveal } from "@/components/reveal"
import {
  BookOpen,
  BarChart3,
  Users,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  School,
  Brain,
  Target,
  TrendingUp,
  Stethoscope,
  Landmark,
  Laptop2,
  Clock,
  ClipboardCheck,
  Award,
  Star,
} from "lucide-react"

const colorClasses = {
  "chart-1": { bg: "bg-chart-1/15", text: "text-chart-1", ring: "hover:shadow-chart-1/10" },
  "chart-2": { bg: "bg-chart-2/15", text: "text-chart-2", ring: "hover:shadow-chart-2/10" },
  "chart-3": { bg: "bg-chart-3/15", text: "text-chart-3", ring: "hover:shadow-chart-3/10" },
  "chart-4": { bg: "bg-chart-4/15", text: "text-chart-4", ring: "hover:shadow-chart-4/10" },
  "chart-5": { bg: "bg-chart-5/15", text: "text-chart-5", ring: "hover:shadow-chart-5/10" },
} as const

type ChartColor = keyof typeof colorClasses

const programs: {
  name: string
  description: string
  icon: typeof GraduationCap
  color: ChartColor
  featured?: boolean
}[] = [
  {
    name: "BECE",
    description: "Junior High School exit exam prep across all core subjects, with the deepest question bank on the platform.",
    icon: GraduationCap,
    color: "chart-1",
    featured: true,
  },
  {
    name: "WASSCE",
    description: "Senior High School exit exam prep for the West African syllabus.",
    icon: BookOpen,
    color: "chart-2",
    featured: true,
  },
  {
    name: "Nursing Exams",
    description: "Entrance and licensing exam prep for aspiring nurses.",
    icon: Stethoscope,
    color: "chart-3",
  },
  {
    name: "University Entrance",
    description: "Practice tests for tertiary admission exams.",
    icon: Landmark,
    color: "chart-4",
  },
  {
    name: "Digital Skills",
    description: "Practical, job-ready digital skills training.",
    icon: Laptop2,
    color: "chart-5",
  },
]

const stats = [
  { icon: Users, value: "45,000+", label: "Students" },
  { icon: School, value: "127", label: "Partner Schools" },
  { icon: BookOpen, value: "8,750+", label: "Questions" },
  { icon: ClipboardCheck, value: "284K+", label: "Assessments Taken" },
]

const features: {
  icon: typeof BookOpen
  color: ChartColor
  title: string
  description: string
}[] = [
  {
    icon: BookOpen,
    color: "chart-1",
    title: "Comprehensive Question Bank",
    description:
      "Access thousands of exam-standard questions across BECE, WASSCE, nursing, university entrance, and digital skills, organized by topic and difficulty level.",
  },
  {
    icon: BarChart3,
    color: "chart-2",
    title: "Detailed Analytics",
    description: "Track performance with insightful reports, identify weak areas, and monitor improvement over time.",
  },
  {
    icon: Brain,
    color: "chart-3",
    title: "Smart Recommendations",
    description: "Get personalized study suggestions based on your performance to focus on what matters most.",
  },
  {
    icon: Target,
    color: "chart-4",
    title: "Timed Practice Exams",
    description: "Experience real exam conditions with timed assessments that prepare you for the real thing.",
  },
  {
    icon: Users,
    color: "chart-5",
    title: "School Management",
    description: "Easily manage students, classes, and assessments with our intuitive school administration tools.",
  },
  {
    icon: TrendingUp,
    color: "chart-1",
    title: "Progress Tracking",
    description: "Monitor progress over time with visual charts, leaderboards, and comprehensive performance reports.",
  },
]

const steps = [
  {
    icon: Target,
    title: "Choose Your Track",
    description: "Pick BECE, WASSCE, nursing, university entrance, or digital skills — or study more than one at once.",
  },
  {
    icon: Clock,
    title: "Practice Under Real Conditions",
    description: "Take timed, topic-based assessments built from a vetted, examiner-reviewed question bank.",
  },
  {
    icon: TrendingUp,
    title: "Track & Improve",
    description: "See exactly where you're strong and weak, then get pointed at what to study next.",
  },
]

const mockQuestion = {
  subject: "Mathematics",
  text: "Simplify: 3x + 2y - x + 4y",
  options: ["2x + 6y", "4x + 6y", "2x + 2y", "4x + 2y"],
  correctAnswer: 0,
}

export default function LandingPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-scantron" />
          <div className="absolute inset-0 bg-grain" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background/70 to-background" />
          <div
            aria-hidden
            className="animate-glow-pulse absolute left-1/2 top-0 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-[120px]"
          />
          <GraduationCap
            aria-hidden
            className="pointer-events-none absolute -right-24 top-10 h-[28rem] w-[28rem] text-primary/[0.05] hidden lg:block"
            strokeWidth={0.5}
          />

          <div className="container mx-auto px-4 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: copy */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Trusted by 127+ schools across Ghana
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6 text-balance">
                  From BECE to University, Prepare with{" "}
                  <span className="text-primary">Confidence</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 text-pretty">
                  TYP is Ghana&apos;s all-in-one exam prep and digital skills platform — covering BECE, WASSCE, nursing, and university entrance exams, plus job-ready digital skills training, through practice tests, detailed analytics, and personalized learning paths.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button size="lg" asChild className="text-base px-8">
                    <Link href="/signup">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-base px-8">
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </div>

                {/* Program pills */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-10">
                  {programs.map((program) => (
                    <span
                      key={program.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-sm font-medium text-foreground/80"
                    >
                      <program.icon className="h-3.5 w-3.5 text-primary" />
                      {program.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: product mock */}
              <div className="relative hidden lg:block">
                <Card className="border-border shadow-xl shadow-black/10">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                          {mockQuestion.subject}
                        </span>
                        <span className="text-xs text-muted-foreground">Question 3 of 40</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-2.5 py-1 text-sm font-mono font-bold">
                        <Clock className="h-3.5 w-3.5" />
                        18:42
                      </div>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[68%] rounded-full bg-primary" />
                    </div>

                    <p className="text-lg font-semibold leading-relaxed">{mockQuestion.text}</p>

                    <div className="space-y-2">
                      {mockQuestion.options.map((option, i) => {
                        const isCorrect = i === mockQuestion.correctAnswer
                        return (
                          <div
                            key={option}
                            className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                              isCorrect ? "border-primary bg-primary/10" : "border-border"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                                isCorrect ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                              }`}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {isCorrect && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Floating score chip */}
                <Card className="animate-float absolute -top-6 -right-6 border-border shadow-lg shadow-black/10">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald/15 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none">+12%</p>
                      <p className="text-xs text-muted-foreground mt-0.5">This term</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating students chip */}
                <Card className="animate-float-delayed absolute -bottom-6 -left-6 border-border shadow-lg shadow-black/10">
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none">2,450</p>
                      <p className="text-xs text-muted-foreground mt-0.5">practicing now</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Floating "distinction" stamp */}
                <div className="animate-float absolute top-1/2 -left-14 -translate-y-1/2 hidden xl:flex h-24 w-24 rotate-[-12deg] flex-col items-center justify-center gap-0.5 rounded-full border-2 border-dashed border-primary/50 bg-card/80 backdrop-blur shadow-lg shadow-black/10">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  <span className="text-[10px] font-bold tracking-wider text-primary">DISTINCTION</span>
                  <Star className="h-4 w-4 text-primary fill-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y divide-border md:divide-y-0 md:divide-x">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center justify-center gap-2 py-4 md:py-0">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-semibold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <Reveal className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">How TYP Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three steps between you and exam-day confidence.
              </p>
            </Reveal>

            <div className="relative grid gap-10 md:grid-cols-3">
              <div
                aria-hidden
                className="hidden md:block absolute top-7 left-[16.66%] right-[16.66%] h-px bg-border"
              />
              {steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 120} className="relative text-center">
                  <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/20">
                    {i + 1}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <step.icon className="h-4 w-4 text-primary" />
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground max-w-xs mx-auto text-pretty">{step.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="relative py-20 md:py-28 bg-muted/40 border-y border-border overflow-hidden">
          <div className="absolute inset-0 bg-scantron opacity-70" />
          <div className="container mx-auto px-4 relative">
            <Reveal className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Every Stage, One Platform</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you&apos;re sitting your BECE this year or building the digital skills employers look for, TYP has a track built for you.
              </p>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {programs.map((program, i) => (
                <Reveal
                  key={program.name}
                  delay={i * 80}
                  className={program.featured ? "lg:col-span-3" : "lg:col-span-2"}
                >
                  <Card
                    className={`h-full border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all ${colorClasses[program.color].ring}`}
                  >
                    <CardContent className="p-6">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[program.color].bg}`}>
                        <program.icon className={`h-6 w-6 ${colorClasses[program.color].text}`} />
                      </div>
                      <h3 className="font-semibold text-lg mb-1.5">{program.name}</h3>
                      <p className="text-sm text-muted-foreground text-pretty">{program.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <Reveal className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Everything you need to pass, whatever you&apos;re preparing for</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                One platform, five exam and skills tracks — the same rigorous tools power every one of them.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <Reveal key={feature.title} delay={(i % 3) * 100}>
                  <Card className="h-full border-border shadow-sm hover:shadow-lg hover:border-primary/40 transition-all">
                    <CardContent className="p-6">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[feature.color].bg}`}>
                        <feature.icon className={`h-6 w-6 ${colorClasses[feature.color].text}`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* For Schools & Students Section */}
        <section className="py-20 md:py-28 bg-muted/40 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              {/* For Schools */}
              <Reveal>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <School className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold">For Schools</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Empower your institution with tools to monitor and improve student performance at scale.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Centralized student management",
                    "Class-wise performance tracking",
                    "Custom assessment assignments",
                    "Detailed school-wide analytics",
                    "Subscription management",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild>
                  <Link href="/signup/school">Register Your School</Link>
                </Button>
              </Reveal>

              {/* For Students */}
              <Reveal delay={120}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold">For Students</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Take control of your learning with personalized practice and feedback.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited practice tests",
                    "Instant feedback & explanations",
                    "Performance trend analysis",
                    "Weak topic identification",
                    "Study recommendations",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild>
                  <Link href="/signup/student">Start Learning Free</Link>
                </Button>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-20 md:py-28 bg-primary text-primary-foreground">
          <div className="absolute inset-0 bg-scantron opacity-20" />
          <div className="absolute inset-0 bg-grain opacity-40" />
          <Award
            aria-hidden
            className="pointer-events-none absolute -left-16 -bottom-16 h-72 w-72 text-primary-foreground/10 hidden md:block"
            strokeWidth={0.75}
          />
          <div className="container mx-auto px-4 text-center relative">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Ready to ace your next exam?</h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of students and schools already using TYP to achieve better results — from BECE to university entrance and beyond.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild className="text-base px-8">
                  <Link href="/signup">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
