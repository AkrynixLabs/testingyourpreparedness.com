"use client"

import { useState } from "react"
import Link from "next/link"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
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
  HelpCircle,
  BookOpen,
  Send,
  CheckCircle2,
} from "lucide-react"
import { submitContactMessage } from "./actions"

const faqs = [
  {
    question: "How do I register my school?",
    answer: "Click on 'Get Started' and select 'School Registration'. Fill in your school details and choose a subscription plan."
  },
  {
    question: "Can students register independently?",
    answer: "Yes! Students can sign up without a school affiliation. They will need guardian approval and can choose from individual subscription plans."
  },
  {
    question: "What subjects are covered?",
    answer: "We cover all 8 BECE subjects: Mathematics, English, Integrated Science, Social Studies, ICT, French, RME, and Ghanaian Languages."
  },
  {
    question: "How do I reset my password?",
    answer: "Click 'Forgot Password' on the login page, enter your email, and follow the reset instructions sent to your inbox."
  },
]

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

  return (
    <div className="marketing min-h-screen flex flex-col bg-background text-foreground">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4 text-balance">How Can We Help?</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Have questions or need support? We are here to help you succeed in your BECE preparation journey.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto mb-16">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <p className="text-sm text-muted-foreground mb-3">For general inquiries</p>
                  <a href="mailto:support@typ.edu.gh" className="text-primary hover:underline">
                    support@typ.edu.gh
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <p className="text-sm text-muted-foreground mb-3">Mon-Fri, 8am-6pm GMT</p>
                  <a href="tel:+233302401234" className="text-primary hover:underline">
                    +233 30 240 1234
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Visit Us</h3>
                  <p className="text-sm text-muted-foreground mb-3">Our office location</p>
                  <p className="text-sm">14 Independence Ave, Accra</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Send Us a Message
                  </CardTitle>
                  <CardDescription>
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
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="Your first name"
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
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
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">I am a...</Label>
                        <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="parent">Parent/Guardian</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="school-admin">School Administrator</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
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
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="How can we help you?"
                          rows={5}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
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

              {/* FAQ & Support Hours */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="pb-4 border-b last:border-0 last:pb-0">
                        <h4 className="font-medium mb-1">{faq.question}</h4>
                        <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                    <Link href="/help">
                      <Button variant="outline" className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View All FAQs
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
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
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
