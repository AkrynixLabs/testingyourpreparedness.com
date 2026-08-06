import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Check, School, GraduationCap } from "lucide-react"
import { subscriptionPlans } from "@/lib/demo-data"

export default function PricingPage() {
  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Whether you&apos;re a school or an independent student, we have options for everyone.
            </p>
          </div>
        </section>

        {/* School Plans */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <School className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold">School Plans</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {subscriptionPlans.school.map((plan, index) => (
                <Card 
                  key={plan.id} 
                  className={`relative border-border/50 shadow-sm ${index === 2 ? 'border-primary shadow-lg ring-1 ring-primary' : ''}`}
                >
                  {index === 2 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>
                      Up to {plan.students} students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">GHS {plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={index === 2 ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/signup/school">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Need a custom plan for your institution?{" "}
                <Link href="/contact" className="text-primary font-medium hover:underline">
                  Contact our sales team
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Student Plans */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Student Plans</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscriptionPlans.student.map((plan, index) => (
                <Card 
                  key={plan.id} 
                  className={`border-border/50 shadow-sm ${index === 2 ? 'border-primary shadow-lg ring-1 ring-primary' : ''}`}
                >
                  {index === 2 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      Best Value
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.period && (
                      <CardDescription>
                        Billed {plan.period === "month" ? "monthly" : plan.period === "term" ? "per term" : "annually"}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      {plan.price === 0 ? (
                        <span className="text-4xl font-bold">Free</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold">GHS {plan.price}</span>
                          <span className="text-muted-foreground">/{plan.period}</span>
                        </>
                      )}
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={index === 0 ? "outline" : "default"}
                      asChild
                    >
                      <Link href="/signup/student">
                        {plan.price === 0 ? "Sign Up Free" : "Subscribe"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our team is here to help you choose the right plan for your needs.
            </p>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
