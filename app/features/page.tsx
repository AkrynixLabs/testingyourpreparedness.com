import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Reveal } from "@/components/reveal"
import {
  BookOpen,
  BarChart3,
  Brain,
  Target,
  Users,
  TrendingUp,
  ClipboardCheck,
  Trophy,
  ShieldCheck,
  Smartphone,
  ArrowRight,
} from "lucide-react"

const colorClasses = {
  "chart-1": { bg: "bg-chart-1/15", text: "text-chart-1" },
  "chart-2": { bg: "bg-chart-2/15", text: "text-chart-2" },
  "chart-3": { bg: "bg-chart-3/15", text: "text-chart-3" },
  "chart-4": { bg: "bg-chart-4/15", text: "text-chart-4" },
  "chart-5": { bg: "bg-chart-5/15", text: "text-chart-5" },
} as const

type ChartColor = keyof typeof colorClasses

const featureGroups: {
  icon: typeof BookOpen
  color: ChartColor
  title: string
  description: string
  points: string[]
}[] = [
  {
    icon: BookOpen,
    color: "chart-1",
    title: "Comprehensive Question Bank",
    description: "Thousands of exam-standard questions, vetted before they ever reach a student.",
    points: [
      "Organized by subject, topic, and difficulty",
      "Covers BECE, WASSCE, nursing, university entrance, and digital skills",
      "Every question reviewed and approved before going live",
    ],
  },
  {
    icon: Target,
    color: "chart-4",
    title: "Timed Practice Exams",
    description: "Real exam conditions, so exam day itself feels familiar.",
    points: [
      "Question-by-question navigator with flagging",
      "Auto-submit on timeout, confirmation before manual submit",
      "Full review of answers, explanations, and correct options after submission",
    ],
  },
  {
    icon: BarChart3,
    color: "chart-2",
    title: "Detailed Analytics",
    description: "Know exactly where you stand, down to the topic.",
    points: [
      "Per-topic score breakdown on every attempt",
      "Rank and percentile against your class or cohort",
      "Progress tracked across every exam, not just the latest one",
    ],
  },
  {
    icon: Brain,
    color: "chart-3",
    title: "Smart Recommendations",
    description: "Study time pointed at what will move your score most.",
    points: [
      "Weak-topic identification from your own attempt history",
      "Personalized study suggestions after every result",
    ],
  },
  {
    icon: Users,
    color: "chart-5",
    title: "School Management",
    description: "Everything a school admin needs to run assessments at scale.",
    points: [
      "Manage students and classes in one place",
      "Assign assessments to a whole class or specific students",
      "School-wide performance dashboards and leaderboards",
    ],
  },
  {
    icon: Trophy,
    color: "chart-1",
    title: "Leaderboards & Progress",
    description: "Motivation built into the platform, not bolted on.",
    points: [
      "Class and school leaderboards",
      "Visual progress tracking over time",
      "Achievement badges for milestones reached",
    ],
  },
  {
    icon: ShieldCheck,
    color: "chart-4",
    title: "Vetted Content Pipeline",
    description: "Nothing reaches a student without review.",
    points: [
      "Content admins submit questions and assessments for approval",
      "A super admin reviews and approves or rejects, with reasons",
      "Full audit trail of every review decision",
    ],
  },
  {
    icon: Smartphone,
    color: "chart-2",
    title: "Built for Ghana",
    description: "Priced and built around how students and schools actually pay and study here.",
    points: [
      "Pricing in GHS with mobile money support",
      "Works well on lower-bandwidth connections",
      "Independent-student signup for those without a school plan",
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to prepare, in one platform
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From question bank to results dashboard, TYP covers the full loop of practicing, tracking, and improving — for individual students and whole schools alike.
            </p>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="pb-20 md:pb-28">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featureGroups.map((feature, i) => (
                <Reveal key={feature.title} delay={(i % 3) * 100}>
                  <Card className="h-full border-border shadow-sm hover:shadow-lg hover:border-primary/40 transition-all">
                    <CardContent className="p-6">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[feature.color].bg}`}>
                        <feature.icon className={`h-6 w-6 ${colorClasses[feature.color].text}`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-1.5">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.points.map((point) => (
                          <li key={point} className="flex items-start gap-2 text-sm">
                            <ClipboardCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden py-20 md:py-28 bg-primary text-primary-foreground">
          <div className="absolute inset-0 bg-scantron opacity-20" />
          <div className="container mx-auto px-4 text-center relative">
            <TrendingUp aria-hidden className="mx-auto h-10 w-10 mb-4 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">See it for yourself</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Start a free trial and take a practice exam in the next five minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="text-base px-8">
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
