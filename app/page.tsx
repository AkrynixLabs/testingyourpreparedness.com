import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Reveal } from "@/components/reveal"
import { AnimatedStat } from "@/components/animated-stat"
import { CustomCursor } from "@/components/custom-cursor"
import { HeroImageSlider } from "@/components/hero-image-slider"
import { ExamDemoDashboard } from "@/components/exam-demo-dashboard"
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
  Award,
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
    className: "lg:row-span-2",
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

export default function LandingPage() {
  const [heroProgram, ...otherPrograms] = programs

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
              <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight mb-4 text-balance drop-shadow-[0_2px_16px_rgba(0,0,0,0.25)]">
                From BECE to University, Prepare with{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Confidence
                </span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/90 mb-6 max-w-xl mx-auto text-pretty drop-shadow-[0_1px_10px_rgba(0,0,0,0.2)]">
                TYP is Ghana&apos;s all-in-one exam prep and digital skills platform — covering BECE, WASSCE, nursing, and university entrance exams, plus job-ready digital skills training, through practice tests, detailed analytics, and personalized learning paths.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="group text-base px-8">
                  <Link href="/signup" data-cursor="small">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8">
                  <Link href="/pricing" data-cursor="small">View Pricing</Link>
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
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="container mx-auto px-4 relative">
            <Reveal className="text-center mb-16">
              <span className="text-sm font-semibold tracking-wide uppercase text-primary">The Process</span>
              <h2 className="text-3xl md:text-4xl font-semibold mt-2 mb-4">How TYP Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Three steps between you and exam-day confidence.
              </p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
              {steps.map((step, i) => (
                <div key={step.title} className="flex items-stretch gap-6">
                  <Reveal delay={i * 120} className="flex-1">
                    <Card
                      data-cursor="big"
                      className="group relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden border-border p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <img
                        src={step.image}
                        alt={step.imageAlt}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10" />
                      <div className="absolute inset-0 bg-grain opacity-30" />
                      <span
                        className="font-display pointer-events-none absolute -top-3 right-2 text-7xl font-semibold text-white opacity-[0.15]"
                      >
                        {step.number}
                      </span>
                      <CardContent className="relative p-7">
                        <div
                          className={`h-12 w-12 rounded-xl flex items-center justify-center mb-5 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 ${colorClasses[step.color].bg}`}
                        >
                          <step.icon className={`h-6 w-6 ${colorClasses[step.color].text}`} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">{step.title}</h3>
                        <p className="text-white/85 text-pretty">{step.description}</p>
                      </CardContent>
                    </Card>
                  </Reveal>

                  {/* Flow connector between steps (desktop only) */}
                  {i < steps.length - 1 && (
                    <div aria-hidden className="hidden md:flex items-center">
                      <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="relative py-20 md:py-28 bg-muted/40 border-y border-border overflow-hidden">
          <div className="absolute inset-0 bg-scantron opacity-70" />
          <div className="container mx-auto px-4 relative">
            <Reveal className="text-center mb-12">
              <span className="text-sm font-semibold tracking-wide uppercase text-primary">Programs</span>
              <h2 className="text-3xl md:text-4xl font-semibold mt-2 mb-4">Every Stage, One Platform</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you&apos;re sitting your BECE this year or building the digital skills employers look for, TYP has a track built for you.
              </p>
            </Reveal>

            <div className="space-y-4">
              {/* Flagship program */}
              <Reveal>
                <Card
                  data-cursor="big"
                  className="group relative flex h-full min-h-[20rem] flex-col justify-end overflow-hidden border-border p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg md:min-h-[22rem]"
                >
                  <img
                    src={heroProgram.image}
                    alt={heroProgram.imageAlt ?? ""}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                  <div className="absolute inset-0 bg-grain opacity-30" />
                  <CardContent className="relative max-w-xl p-8 md:p-10">
                    {heroProgram.tag && (
                      <span className="mb-4 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-white/25 backdrop-blur-sm">
                        {heroProgram.tag}
                      </span>
                    )}
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 ${colorClasses[heroProgram.color].bg}`}
                    >
                      <heroProgram.icon className={`h-6 w-6 ${colorClasses[heroProgram.color].text}`} />
                    </div>
                    <h3 className="mb-2 text-2xl font-semibold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)] md:text-3xl">
                      {heroProgram.name}
                    </h3>
                    <p className="text-pretty text-white/85">{heroProgram.description}</p>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Remaining tracks */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {otherPrograms.map((program, i) => (
                  <Reveal key={program.name} delay={(i + 1) * 80}>
                    {program.image ? (
                      <Card
                        data-cursor="big"
                        className="group relative flex h-full min-h-[14rem] flex-col justify-end overflow-hidden border-border p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <img
                          src={program.image}
                          alt={program.imageAlt ?? ""}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
                        <CardContent className="relative p-5">
                          <div
                            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 ${colorClasses[program.color].bg}`}
                          >
                            <program.icon className={`h-5 w-5 ${colorClasses[program.color].text}`} />
                          </div>
                          <h3 className="mb-1 font-semibold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">{program.name}</h3>
                          <p className="text-xs text-white/80 text-pretty">{program.description}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card
                        data-cursor="big"
                        className={`group relative flex h-full min-h-[14rem] flex-col justify-end overflow-hidden border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${colorClasses[program.color].bg}`}
                      >
                        <program.icon
                          aria-hidden
                          strokeWidth={0.75}
                          className={`pointer-events-none absolute -right-4 -bottom-4 h-28 w-28 opacity-[0.14] transition-transform duration-300 group-hover:scale-110 ${colorClasses[program.color].text}`}
                        />
                        <CardContent className="relative p-5">
                          <div
                            className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-card transition-transform duration-300 group-hover:scale-110`}
                          >
                            <program.icon className={`h-5 w-5 ${colorClasses[program.color].text}`} />
                          </div>
                          <h3 className="mb-1 font-semibold">{program.name}</h3>
                          <p className="text-xs text-muted-foreground text-pretty">{program.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Classroom Photography Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal>
                <span className="text-sm font-semibold tracking-wide uppercase text-primary">In The Classroom</span>
                <h2 className="text-3xl md:text-4xl font-semibold mt-2 mb-4">Built for how Ghanaian classrooms actually work</h2>
                <p className="text-lg text-muted-foreground text-pretty">
                  Every feature on TYP is designed around the reality of the classroom, not a boardroom — timed papers, shared textbooks, and a teacher who needs results at a glance.
                </p>
              </Reveal>

              <Reveal delay={120} className="grid grid-cols-2 gap-4 lg:auto-rows-[9.5rem]">
                {classroomPhotos.map((photo) => (
                  <div
                    key={photo.src}
                    data-cursor="big"
                    className={`group relative overflow-hidden rounded-2xl border border-border shadow-sm ${photo.className ?? ""}`}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      className="h-full w-full min-h-40 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-20 md:py-28 bg-primary text-primary-foreground">
          <img
            src="/images/homepage/bill-wegener-hs98_9hzTcU.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-[0.15] mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-primary/85" />
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
                <Button size="lg" variant="secondary" asChild className="group text-base px-8">
                  <Link href="/signup" data-cursor="small">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
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
