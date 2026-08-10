import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Reveal } from "@/components/reveal"
import {
  Target,
  Heart,
  ShieldCheck,
  Users,
  School,
  BookOpen,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react"

const stats = [
  { icon: Users, value: "45,000+", label: "Students" },
  { icon: School, value: "127", label: "Partner Schools" },
  { icon: BookOpen, value: "8,750+", label: "Questions" },
  { icon: ClipboardCheck, value: "284K+", label: "Assessments Taken" },
]

const values = [
  {
    icon: Target,
    title: "Exam-standard, always",
    description: "Every question is written and reviewed against real exam syllabuses, not guessed at — so practice actually transfers to exam day.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing goes live unreviewed",
    description: "Content admins submit, a super admin approves. That review gate is core to the platform, not an afterthought bolted on later.",
  },
  {
    icon: Heart,
    title: "Built for Ghana, not adapted to it",
    description: "GHS pricing, mobile money support, and a syllabus that starts with BECE and WASSCE — this wasn't a global product with Ghana added on.",
  },
]

export default function AboutPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Helping Ghana&apos;s students prepare with confidence
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              TYP — Testing Your Preparedness — is an all-in-one exam prep and digital skills platform built for BECE, WASSCE, nursing, and university entrance candidates, and the schools that support them.
            </p>
          </div>
        </section>

        {/* Stats */}
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

        {/* Our Story */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-3xl">
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-center">Our story</h2>
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  TYP started with a simple observation: students preparing for BECE, WASSCE, nursing, and university entrance exams had plenty of past questions to read, but very few ways to practice under real exam conditions and actually see where they were falling short.
                </p>
                <p>
                  So we built a platform that does both — a vetted, examiner-reviewed question bank, and the timed, scored practice experience to go with it. Schools get the tools to manage students and track performance at scale; independent students get the same rigor without needing a school account.
                </p>
                <p>
                  Today TYP supports five tracks — BECE, WASSCE, nursing, university entrance, and digital skills — with more content being added as new programs come online.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 md:py-28 bg-muted/40 border-y border-border">
          <div className="container mx-auto px-4">
            <Reveal className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">What we care about</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value, i) => (
                <Reveal key={value.title} delay={i * 100}>
                  <Card className="h-full border-border shadow-sm">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Want to know more?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Reach out to our team, or see the platform in action with a free trial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
