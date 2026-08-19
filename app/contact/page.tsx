"use client"

import { useState } from "react"
import Link from "next/link"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { CustomCursor } from "@/components/custom-cursor"
import { Reveal } from "@/components/reveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { submitContactMessage, subscribeNewsletter } from "./actions"

const colorClasses = {
  "chart-1": { bg: "bg-chart-1/15", text: "text-chart-1" },
  "chart-2": { bg: "bg-chart-2/15", text: "text-chart-2" },
  "chart-3": { bg: "bg-chart-3/15", text: "text-chart-3" },
} as const

const OFFICE_ADDRESS = "14 Independence Ave, Accra, Ghana"
const OFFICE_MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS)}&output=embed`
const OFFICE_MAP_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(OFFICE_ADDRESS)}`

const contactOptions = [
  {
    icon: Mail,
    color: "chart-1",
    title: "Email Us",
    description: "For general inquiries",
    value: "support@typ.edu.gh",
    href: "mailto:support@typ.edu.gh",
    external: false,
  },
  {
    icon: Phone,
    color: "chart-2",
    title: "Call Us",
    description: "Mon-Fri, 8am-6pm GMT",
    value: "+233 30 240 1234",
    href: "tel:+233302401234",
    external: false,
  },
  {
    icon: MapPin,
    color: "chart-3",
    title: "Visit Us",
    description: "Our office location",
    value: "14 Independence Ave, Accra",
    href: OFFICE_MAP_DIRECTIONS_URL,
    external: true,
  },
] as const

const initialContactForm = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  subject: "",
  message: "",
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(initialContactForm)

  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterError, setNewsletterError] = useState<string | null>(null)
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await submitContactMessage(form)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.")
    } finally {
      setLoading(false)
    }
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterError(null)
    setNewsletterLoading(true)
    try {
      await subscribeNewsletter({ email: newsletterEmail })
      setNewsletterSubscribed(true)
    } catch (err) {
      setNewsletterError(err instanceof Error ? err.message : "Failed to subscribe.")
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <CustomCursor />
      <PublicHeader />

      <main className="flex-1">
        {/* Contact Options */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="sr-only">Contact TYP - Testing Your Preparedness</h1>
            <div className="grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
              {contactOptions.map((option, i) => (
                <Reveal key={option.title} delay={i * 80}>
                  <Card
                    data-cursor="big"
                    className="h-full border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <CardContent className="p-5">
                      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[option.color].bg}`}>
                        <option.icon className={`h-5 w-5 ${colorClasses[option.color].text}`} />
                      </div>
                      <h3 className="font-sans text-base font-semibold mb-1.5">{option.title}</h3>
                      <p className="font-sans text-sm text-muted-foreground mb-2">{option.description}</p>
                      <a
                        href={option.href}
                        target={option.external ? "_blank" : undefined}
                        rel={option.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
                      >
                        {option.value}
                      </a>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form + Map/Support */}
        <section id="contact-form" className="relative overflow-hidden py-12 md:py-16 bg-muted/40 border-y border-border scroll-mt-20">
          <div className="absolute inset-0 bg-scantron opacity-70" />
          <div className="container mx-auto px-4 relative">
            <Reveal className="text-center mb-8">
              <span className="text-sm font-semibold tracking-wide uppercase text-primary">Get In Touch</span>
              <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight mt-2 mb-3">Send us a message</h2>
              <p className="font-sans text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
                Fill out the form and a real person on our team will get back to you within 24 hours.
              </p>
            </Reveal>

            <div className="grid gap-6 lg:grid-cols-5 max-w-6xl mx-auto lg:items-start">
              {/* Contact Form */}
              <Reveal delay={80} className="lg:col-span-3">
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-sans text-base flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Send Us a Message
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Fill out the form below and we will get back to you within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!submitted ? (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                          <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                          </p>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                              id="firstName"
                              placeholder="Your first name"
                              value={form.firstName}
                              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                              id="lastName"
                              placeholder="Your last name"
                              value={form.lastName}
                              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="role">I am a... *</Label>
                            <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Learner</SelectItem>
                                <SelectItem value="parent">Parent/Guardian</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="school-admin">School Administrator</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject *</Label>
                            <Select value={form.subject} onValueChange={(value) => setForm({ ...form, subject: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="What is this about?" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General Inquiry</SelectItem>
                                <SelectItem value="technical">Technical Support</SelectItem>
                                <SelectItem value="billing">Billing Question</SelectItem>
                                <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                                <SelectItem value="feedback">Feedback</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message *</Label>
                          <Textarea
                            id="message"
                            placeholder="How can we help you?"
                            rows={5}
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit" size="lg" className="w-full text-base" disabled={loading}>
                          {loading ? (
                            "Sending..."
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-8">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground mb-4">
                          Thank you for reaching out. We will get back to you within 24 hours.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setForm(initialContactForm)
                            setSubmitted(false)
                          }}
                        >
                          Send Another Message
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Reveal>

              {/* Map + Support Hours */}
              <Reveal delay={160} className="lg:col-span-2 flex flex-col gap-6">
                <Card className="overflow-hidden border-border shadow-sm p-0">
                  <div className="relative h-48 w-full">
                    <iframe
                      title="TYP office location"
                      src={OFFICE_MAP_EMBED_SRC}
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-3/15">
                        <MapPin className="h-5 w-5 text-chart-3" />
                      </div>
                      <div>
                        <h3 className="font-sans text-sm font-semibold mb-0.5">Our Office</h3>
                        <p className="text-sm text-muted-foreground">{OFFICE_ADDRESS}</p>
                        <a
                          href={OFFICE_MAP_DIRECTIONS_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          Get directions
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-sans text-base flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Support Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monday - Friday</span>
                        <span className="font-medium">8:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Saturday</span>
                        <span className="font-medium">9:00 AM - 2:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sunday</span>
                        <span className="font-medium">Closed</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      All times are in Ghana Standard Time (GMT)
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Reveal className="max-w-xl mx-auto">
              <Card className="border-border shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight mb-2">Stay in the loop</h2>
                  <p className="font-sans text-sm md:text-base text-muted-foreground mb-6">
                    Exam prep tips, new subject launches, and platform updates, straight to your inbox. No spam, unsubscribe anytime.
                  </p>

                  {newsletterSubscribed ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium py-2">
                      <CheckCircle2 className="h-5 w-5" />
                      You&apos;re subscribed. Thanks for joining!
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-start gap-3 max-w-md mx-auto">
                      <div className="w-full flex-1">
                        <Label htmlFor="newsletter-email" className="sr-only">Email</Label>
                        <Input
                          id="newsletter-email"
                          type="email"
                          placeholder="you@example.com"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={newsletterLoading} className="w-full sm:w-auto shrink-0">
                        {newsletterLoading ? "Subscribing..." : "Subscribe"}
                      </Button>
                    </form>
                  )}
                  {newsletterError && (
                    <p className="mt-3 text-sm text-destructive">{newsletterError}</p>
                  )}
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* Call CTA */}
        <section className="relative overflow-hidden py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="absolute inset-0 bg-black/20" />
          <div className="container mx-auto px-4 text-center relative">
            <Reveal>
              <h2 className="font-sans text-xl md:text-2xl font-semibold tracking-tight mb-3">
                Prefer to talk to a real person?
              </h2>
              <p className="font-sans text-base md:text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Give us a call and we&apos;ll walk you through everything TYP offers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="group text-base px-8 bg-background text-foreground hover:bg-background/90">
                  <a href="tel:+233302401234" data-cursor="small">
                    <Phone className="mr-2 h-4 w-4" />
                    +233 30 240 1234
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-base px-8 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Link href="/help" data-cursor="small">Visit Help Center</Link>
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
