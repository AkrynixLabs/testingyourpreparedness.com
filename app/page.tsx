import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Reveal } from "@/components/reveal"
import { AnimatedStat } from "@/components/animated-stat"
import { CustomCursor } from "@/components/custom-cursor"
import { HeroImageSlider } from "@/components/hero-image-slider"
import { ExamDemoDashboard } from "@/components/exam-demo-dashboard"
import { prisma } from "@/lib/prisma"
import { planPriceAndPeriod } from "@/lib/pricing"
import {
  BookOpen,
  Users,
  GraduationCap,
  ArrowRight,
  School,
  Target,
  TrendingUp,
  Stethoscope,
  Landmark,
  Laptop2,
  Clock,
  ClipboardCheck,
  BarChart3,
  Brain,
  Trophy,
  ShieldCheck,
  Smartphone,
  Check,
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
  tag?: string
  image?: string
  imageAlt?: string
}[] = [
  {
    name: "BECE",
    description: "Junior High School exit exam prep across all core subjects, with the deepest question bank on the platform.",
    icon: GraduationCap,
    color: "chart-1",
    featured: true,
    tag: "Flagship track",
    image: "/images/homepage/zach-wear-wjCYyd_KppE.jpg",
    imageAlt: "A classroom of students seated at their desks during an exam",
  },
  {
    name: "WASSCE",
    description: "Senior High School exit exam prep for the West African syllabus.",
    icon: BookOpen,
    color: "chart-2",
    image: "/images/homepage/michael-ali-BUb4bw9dHgU.jpg",
    imageAlt: "A group of students smiling together outside their classroom",
  },
  {
    name: "Nursing Exams",
    description: "Entrance and licensing exam prep for aspiring nurses.",
    icon: Stethoscope,
    color: "chart-3",
    image: "/images/homepage/annie-spratt-OIuCXxx08yg.jpg",
    imageAlt: "Students seated attentively in a classroom",
  },
  {
    name: "University Entrance",
    description: "Practice tests for tertiary admission exams.",
    icon: Landmark,
    color: "chart-4",
    image: "/images/homepage/dom-fou-YRMWVcdyhmI-unsplash.jpg",
    imageAlt: "A university lecture hall filled with students",
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

const heroSliderImages = [
  { src: "/images/homepage/zach-wear-wjCYyd_KppE.jpg", alt: "A classroom of students seated at their desks during an exam" },
  { src: "/images/homepage/annie-spratt-OIuCXxx08yg.jpg", alt: "Students seated attentively in a classroom" },
  { src: "/images/homepage/emmanuel-ikwuegbu-VC6MGt9ZoBA.jpg", alt: "A student reading through her workbook during a lesson" },
  { src: "/images/homepage/topsphere-media-ojBd8yB5KDM.jpg", alt: "A student in class alongside classmates writing in their notebooks" },
  { src: "/images/homepage/storyzangu-hub-2JFGBQhdHu0.jpg", alt: "A student concentrating while writing in her notebook during class" },
  { src: "/images/homepage/michael-ali-BUb4bw9dHgU.jpg", alt: "A group of students smiling together outside their classroom" },
  { src: "/images/homepage/bill-wegener-hs98_9hzTcU.jpg", alt: "A student smiling and making a peace sign in class" },
]

const classroomPhotos = [
  {
    src: "/images/homepage/zach-wear-wjCYyd_KppE.jpg",
    alt: "A classroom of students seated at their desks during an exam",
    className: "row-span-2",
  },
  {
    src: "/images/homepage/michael-ali-BUb4bw9dHgU.jpg",
    alt: "A group of students smiling together outside their classroom",
  },
  {
    src: "/images/homepage/topsphere-media-ojBd8yB5KDM.jpg",
    alt: "A student in class alongside classmates writing in their notebooks",
  },
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
    title: "Question Bank",
    description: "Thousands of vetted, exam-standard questions across every track.",
  },
  {
    icon: Target,
    color: "chart-4",
    title: "Timed Practice Exams",
    description: "Real exam conditions, with a full review after every submission.",
  },
  {
    icon: BarChart3,
    color: "chart-2",
    title: "Detailed Analytics",
    description: "Per-topic breakdowns, rank, and percentile on every attempt.",
  },
  {
    icon: Brain,
    color: "chart-3",
    title: "Smart Recommendations",
    description: "Study time pointed at what will move your score most.",
  },
  {
    icon: Users,
    color: "chart-5",
    title: "School Management",
    description: "Manage students, classes, and assignments in one place.",
  },
  {
    icon: Trophy,
    color: "chart-1",
    title: "Leaderboards & Progress",
    description: "Class rankings and visual progress tracking, built in.",
  },
  {
    icon: ShieldCheck,
    color: "chart-4",
    title: "Vetted Content",
    description: "Every question reviewed and approved before it reaches a student.",
  },
  {
    icon: Smartphone,
    color: "chart-2",
    title: "Built for Ghana",
    description: "GHS pricing, mobile money support, and low-bandwidth friendly.",
  },
]

const faqs = [
  {
    question: "How do I register my school?",
    answer: "Click on 'Get Started' and select 'School Registration'. Fill in your school details and choose a subscription plan.",
  },
  {
    question: "Can students register independently?",
    answer: "Yes! Students can sign up without a school affiliation. They will need guardian approval and can choose from individual subscription plans.",
  },
  {
    question: "What subjects are covered?",
    answer: "We cover all 8 BECE subjects: Mathematics, English, Integrated Science, Social Studies, ICT, French, RME, and Ghanaian Languages.",
  },
  {
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page, enter your email, and follow the reset instructions sent to your inbox.",
  },
]

const steps: {
  number: string
  icon: typeof Target
  color: ChartColor
  title: string
  description: string
  image: string
  imageAlt: string
}[] = [
  {
    number: "01",
    icon: Target,
    color: "chart-1",
    title: "Choose Your Track",
    description: "Pick BECE, WASSCE, nursing, university entrance, or digital skills — or study more than one at once.",
    image: "/images/homepage/emmanuel-ikwuegbu-VC6MGt9ZoBA.jpg",
    imageAlt: "A student reading through her workbook during a lesson",
  },
  {
    number: "02",
    icon: Clock,
    color: "chart-4",
    title: "Practice Under Real Conditions",
    description: "Take timed, topic-based assessments built from a vetted, examiner-reviewed question bank.",
    image: "/images/homepage/storyzangu-hub-2JFGBQhdHu0.jpg",
    imageAlt: "A student concentrating while writing in her notebook during class",
  },
  {
    number: "03",
    icon: TrendingUp,
    color: "chart-2",
    title: "Track & Improve",
    description: "See exactly where you're strong and weak, then get pointed at what to study next.",
    image: "/images/homepage/topsphere-media-ojBd8yB5KDM.jpg",
    imageAlt: "A student in class alongside classmates writing in their notebooks",
  },
]

export default async function LandingPage() {
  const [schoolPlans, studentPlans] = await Promise.all([
    prisma.subscriptionPlan.findMany({ where: { audience: "school" }, orderBy: { monthlyPrice: "asc" } }),
    prisma.subscriptionPlan.findMany({ where: { audience: "independent" }, orderBy: { monthlyPrice: { sort: "asc", nulls: "first" } } }),
  ])

  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <CustomCursor />
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden pt-4 pb-24 md:pt-6 md:pb-32">
          <HeroImageSlider images={heroSliderImages} maxOpacity={0.9} />
          <div className="absolute inset-0 bg-background/20" />
          <div className="absolute inset-0 bg-grain" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
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
            {/* Centered copy */}
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 text-muted-foreground text-xs font-semibold tracking-[0.15em] uppercase mb-4">
                <span className="h-px w-6 bg-border" />
                Trusted by 127+ schools across Ghana
                <span className="h-px w-6 bg-border" />
              </div>
              <h5 className="font-sans text-2xl md:text-4xl font-semibold tracking-tight mb-6 text-balance drop-shadow-[0_2px_16px_rgba(0,0,0,0.25)]">
                From BECE to University,Prepare with{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Confidence
                </span>
              </h5>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="group text-base px-8">
                  <Link href="/signup" data-cursor="small">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8">
                  <Link href="/#pricing" data-cursor="small">View Pricing</Link>
                </Button>
              </div>
            </div>

            {/* Full-width demo dashboard */}
            <div className="mt-6 md:mt-8" data-cursor="big">
              <ExamDemoDashboard />
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
                  <p className="text-2xl md:text-3xl font-semibold tabular-nums">
                    <AnimatedStat value={stat.value} />
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative overflow-hidden py-12 md:py-16">
          <div className="container mx-auto px-4 relative">
            <Reveal className="text-center mb-8">
              <span className="text-sm font-semibold tracking-wide uppercase text-primary">The Process</span>
              <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight mt-2 mb-3">How TYP Works</h2>
              <p className="font-sans text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
                Three steps between you and exam-day confidence.
              </p>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
              {steps.map((step, i) => (
                <div key={step.title} className="flex items-stretch gap-4">
                  <Reveal delay={i * 120} className="flex-1">
                    <Card
                      data-cursor="big"
                      className="group relative flex h-full min-h-[16rem] flex-col justify-end overflow-hidden border-border p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <img
                        src={step.image}
                        alt={step.imageAlt}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/25" />
                      <div className="absolute inset-0 bg-grain opacity-30" />
                      <CardContent className="relative p-5">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 ${colorClasses[step.color].bg}`}
                        >
                          <step.icon className={`h-5 w-5 ${colorClasses[step.color].text}`} />
                        </div>
                        <h3 className="font-sans text-base font-semibold mb-1.5 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">{step.title}</h3>
                        <p className="font-sans text-sm text-white text-pretty drop-shadow-[0_1px_5px_rgba(0,0,0,0.7)]">{step.description}</p>
                      </CardContent>
                    </Card>
                  </Reveal>

                  {/* Flow connector between steps (desktop only) */}
                  {i < steps.length - 1 && (
                    <div aria-hidden className="hidden md:flex items-center">
                      <ArrowRight className="h-7 w-7 text-primary" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative overflow-hidden py-12 md:py-16 scroll-mt-20">
          <div className="container mx-auto px-4 relative">
            <Reveal className="text-center mb-8">
              <span className="text-sm font-semibold tracking-wide uppercase text-primary">Features</span>
              <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight mt-2 mb-3">Everything you need, in one platform</h2>
              <p className="font-sans text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
                A vetted question bank and timed, scored practice experience, built to help students prepare under real exam conditions and see exactly where they stand, whether through a school or on their own.
              </p>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <Reveal key={feature.title} delay={(i % 4) * 80}>
                  <Card className="h-full border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="p-5">
                      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[feature.color].bg}`}>
                        <feature.icon className={`h-5 w-5 ${colorClasses[feature.color].text}`} />
                      </div>
                      <h3 className="font-sans text-base font-semibold mb-1.5">{feature.title}</h3>
                      <p className="font-sans text-sm text-muted-foreground text-pretty">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="relative py-12 md:py-16 bg-muted/40 border-y border-border overflow-hidden">
          <div className="absolute inset-0 bg-scantron opacity-70" />
          <div className="container mx-auto px-4 relative">
            <Reveal className="text-center mb-8">
              <span className="text-sm font-semibold tracking-wide uppercase text-primary">Programs</span>
              <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight mt-2 mb-3">Every Stage, One Platform</h2>
              <p className="font-sans text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
                From BECE to job-ready digital skills, TYP has a track built for you.
              </p>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {programs.map((program, i) => (
                <Reveal key={program.name} delay={i * 80}>
                  <Card
                    data-cursor="big"
                    className={`group relative flex h-full min-h-[12rem] flex-col justify-end overflow-hidden border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${colorClasses[program.color].bg}`}
                  >
                    <program.icon
                      aria-hidden
                      strokeWidth={0.75}
                      className={`pointer-events-none absolute -right-4 -bottom-4 h-28 w-28 opacity-[0.14] transition-transform duration-300 group-hover:scale-110 ${colorClasses[program.color].text}`}
                    />
                    <CardContent className="relative p-5">
                      {program.tag && (
                        <span className="mb-2 inline-flex items-center rounded-full bg-card px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary ring-1 ring-border">
                          {program.tag}
                        </span>
                      )}
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-card transition-transform duration-300 group-hover:scale-110">
                        <program.icon className={`h-5 w-5 ${colorClasses[program.color].text}`} />
                      </div>
                      <h3 className="font-sans text-base font-semibold mb-1.5">{program.name}</h3>
                      <p className="font-sans text-sm text-muted-foreground text-pretty">{program.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative overflow-hidden py-12 md:py-16 scroll-mt-20">
          <div className="container mx-auto px-4 relative">
            <Reveal className="text-center mb-8">
              <span className="text-sm font-semibold tracking-wide uppercase text-primary">Pricing</span>
              <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight mt-2 mb-3">Simple, transparent pricing</h2>
              <p className="font-sans text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
                Choose the plan that fits — whether you&apos;re a school or an independent student.
              </p>
            </Reveal>

            {/* School Plans */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <School className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-sans text-lg font-semibold">School Plans</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {schoolPlans.map((plan, i) => {
                  const { price, period } = planPriceAndPeriod(plan)
                  const planFeatures = plan.features as string[]
                  return (
                    <Reveal key={plan.id} delay={i * 80}>
                      <Card className={`relative h-full border-border shadow-sm ${plan.popular ? "border-primary ring-1 ring-primary" : ""}`}>
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-[11px] font-medium rounded-full">
                            Most Popular
                          </div>
                        )}
                        <CardHeader className="p-5 pb-0">
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {plan.studentLimit ? `Up to ${plan.studentLimit} students` : "Unlimited students"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                          <div className="mb-4">
                            <span className="text-2xl font-semibold">
                              {plan.currency} {price}
                            </span>
                            {period && <span className="text-sm text-muted-foreground">/{period}</span>}
                          </div>
                          <ul className="space-y-2 mb-4">
                            {planFeatures.map((feature, j) => (
                              <li key={j} className="flex items-start gap-2 text-xs">
                                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button size="sm" className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                            <Link href="/signup/school">Get Started</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </Reveal>
                  )
                })}
              </div>
            </div>

            {/* Student Plans */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-sans text-lg font-semibold">Student Plans</h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {studentPlans.map((plan, i) => {
                  const { price, period } = planPriceAndPeriod(plan)
                  const planFeatures = plan.features as string[]
                  return (
                    <Reveal key={plan.id} delay={i * 80}>
                      <Card className={`relative h-full border-border shadow-sm ${plan.popular ? "border-primary ring-1 ring-primary" : ""}`}>
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-[11px] font-medium rounded-full">
                            Best Value
                          </div>
                        )}
                        <CardHeader className="p-5 pb-0">
                          <CardTitle className="text-base">{plan.name}</CardTitle>
                          {period && (
                            <CardDescription className="text-xs">
                              Billed {period === "month" ? "monthly" : period === "term" ? "per term" : "annually"}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-5">
                          <div className="mb-4">
                            {price === 0 ? (
                              <span className="text-2xl font-semibold">Free</span>
                            ) : (
                              <>
                                <span className="text-2xl font-semibold">
                                  {plan.currency} {price}
                                </span>
                                <span className="text-sm text-muted-foreground">/{period}</span>
                              </>
                            )}
                          </div>
                          <ul className="space-y-2 mb-4">
                            {planFeatures.map((feature, j) => (
                              <li key={j} className="flex items-start gap-2 text-xs">
                                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button size="sm" className="w-full" variant={price === 0 ? "outline" : "default"} asChild>
                            <Link href="/signup/student">{price === 0 ? "Sign Up Free" : "Subscribe"}</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </Reveal>
                  )
                })}
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Need a custom plan for your institution?{" "}
              <Link href="/contact" className="text-primary font-medium hover:underline">
                Contact our sales team
              </Link>
            </p>
          </div>
        </section>

        {/* Classroom Photography Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
              <Reveal>
                <span className="text-sm font-semibold tracking-wide uppercase text-primary">In The Classroom</span>
                <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight mt-2 mb-3">Built for how Ghanaian classrooms actually work</h2>
                <p className="font-sans text-base md:text-lg text-foreground/80 text-pretty">
                  We built TYP around how classrooms actually run, not how a boardroom imagines them ; timed papers, textbooks passed hand to hand, and a teacher who just needs to see results at a glance.
                </p>
              </Reveal>

              <Reveal delay={120} className="grid grid-cols-2 gap-3 auto-rows-[7rem] sm:auto-rows-[8rem]">
                {classroomPhotos.map((photo) => (
                  <div
                    key={photo.src}
                    data-cursor="big"
                    className={`group relative overflow-hidden rounded-xl border border-border shadow-sm ${photo.className ?? "row-span-1"}`}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </Reveal>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="relative overflow-hidden py-8 md:py-10 bg-muted/40 border-y border-border scroll-mt-20">
          <div className="container mx-auto px-4 relative">
            <Reveal className="text-center mb-4">
              <span className="text-sm font-semibold tracking-wide uppercase text-primary">FAQ</span>
              <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight mt-1 mb-2">Frequently Asked Questions</h2>
              <p className="font-sans text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
                Quick answers to what people ask before getting started.
              </p>
            </Reveal>

            <Reveal delay={80} className="max-w-3xl mx-auto">
              <Card className="border-border shadow-sm">
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible>
                    {faqs.map((faq) => (
                      <AccordionItem key={faq.question} value={faq.question}>
                        <AccordionTrigger className="font-sans text-sm font-medium">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground text-pretty">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <Link href="/help">
                    <Button variant="outline" className="w-full mt-4">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View All FAQs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-20 md:py-28 border-y border-border text-foreground">
          <img
            src="/images/homepage/bill-wegener-hs98_9hzTcU.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/15" />
          <div className="absolute inset-0 bg-scantron opacity-20" />
          <div className="absolute inset-0 bg-grain opacity-30" />
          <div className="container mx-auto px-4 text-center relative">
            <Reveal>
              <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight mb-3">Ready to ace your next exam?</h2>
              <p className="font-sans text-base md:text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
                Thousands of students and schools already trust TYP to get better results, from BECE all the way to university entrance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="group text-base px-8">
                  <Link href="/signup" data-cursor="small">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8">
                  <Link href="/contact" data-cursor="small">Contact Sales</Link>
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
