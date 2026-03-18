import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
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
  TrendingUp
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Trusted by 127+ schools across Ghana
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
                Prepare for BECE Success with{" "}
                <span className="text-primary">Confidence</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                TYP is Ghana&apos;s premier assessment platform designed to help students excel in their BECE examinations through comprehensive practice tests, detailed analytics, and personalized learning paths.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">45,000+</p>
                <p className="text-sm text-muted-foreground mt-1">Students</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">127</p>
                <p className="text-sm text-muted-foreground mt-1">Partner Schools</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">8,750</p>
                <p className="text-sm text-muted-foreground mt-1">Questions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">284K+</p>
                <p className="text-sm text-muted-foreground mt-1">Assessments Taken</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for BECE success</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive platform provides all the tools students and schools need to achieve excellent results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Comprehensive Question Bank</h3>
                  <p className="text-muted-foreground">
                    Access thousands of BECE-standard questions across all core subjects, organized by topic and difficulty level.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Detailed Analytics</h3>
                  <p className="text-muted-foreground">
                    Track performance with insightful reports, identify weak areas, and monitor improvement over time.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Smart Recommendations</h3>
                  <p className="text-muted-foreground">
                    Get personalized study suggestions based on your performance to focus on what matters most.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Timed Practice Exams</h3>
                  <p className="text-muted-foreground">
                    Experience real exam conditions with timed assessments that prepare students for the actual BECE.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">School Management</h3>
                  <p className="text-muted-foreground">
                    Easily manage students, classes, and assessments with our intuitive school administration tools.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
                  <p className="text-muted-foreground">
                    Monitor student progress over time with visual charts and comprehensive performance reports.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* For Schools & Students Section */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              {/* For Schools */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <School className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold">For Schools</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Empower your institution with tools to monitor and improve student performance at scale.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Centralized student management",
                    "Class-wise performance tracking",
                    "Custom assessment assignments",
                    "Detailed school-wide analytics",
                    "Subscription management"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild>
                  <Link href="/signup/school">Register Your School</Link>
                </Button>
              </div>

              {/* For Students */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold">For Students</h3>
                </div>
                <p className="text-muted-foreground mb-6">
                  Take control of your learning with personalized practice and feedback.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    "Unlimited practice tests",
                    "Instant feedback & explanations",
                    "Performance trend analysis",
                    "Weak topic identification",
                    "Study recommendations"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild>
                  <Link href="/signup/student">Start Learning Free</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">All BECE Subjects Covered</h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive coverage of all core BECE examination subjects
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "English Language", questions: "450+", icon: "ENG", color: "bg-blue-500" },
                { name: "Mathematics", questions: "520+", icon: "MAT", color: "bg-emerald-500" },
                { name: "Integrated Science", questions: "380+", icon: "SCI", color: "bg-amber-500" },
                { name: "Social Studies", questions: "410+", icon: "SOC", color: "bg-rose-500" },
              ].map((subject) => (
                <Card key={subject.name} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`h-14 w-14 ${subject.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-white font-bold text-lg">{subject.icon}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground">{subject.questions} questions</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to excel in your BECE?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of students and schools already using TYP to achieve better results.
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
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
