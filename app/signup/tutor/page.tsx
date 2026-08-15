"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomCursor } from "@/components/custom-cursor"
import { ArrowLeft } from "lucide-react"
import { registerTutor } from "./actions"

export default function TutorSignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    headline: "",
    bio: "",
    expertiseAreas: "",
    agreeTerms: false,
    subscribeNewsletter: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: "agreeTerms" | "subscribeNewsletter", value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const { email } = await registerTutor({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        headline: formData.headline,
        bio: formData.bio,
        expertiseAreas: formData.expertiseAreas.split(",").map((a) => a.trim()).filter(Boolean),
        agreeTerms: formData.agreeTerms,
        subscribeNewsletter: formData.subscribeNewsletter,
      })

      const signInResult = await signIn("credentials", { email, password: formData.password, redirect: false })
      if (signInResult?.error) {
        setError("Account created, but automatic sign-in failed. Please log in manually.")
        router.push("/login")
        return
      }
      router.push("/tutor")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="marketing relative isolate min-h-screen flex flex-col overflow-hidden bg-background text-foreground bg-gradient-to-br from-background via-background to-primary/5">
      <CustomCursor />
      <div className="absolute inset-0 bg-grain" />
      <div
        aria-hidden
        className="animate-glow-pulse absolute left-1/2 top-1/4 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]"
      />

      <header className="p-4 md:p-6 relative">
        <Link
          href="/signup"
          data-cursor="small"
          className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-border hover:bg-background hover:text-foreground hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Options
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative">
        <Card className="w-full max-w-lg border-border/60 shadow-xl">
          <CardHeader className="text-center pb-4">
            <Link href="/" className="inline-flex items-center justify-center mb-5">
              <img src="/logo.png" alt="TYP - Testing Your Preparedness" className="h-12 w-auto" />
            </Link>
            <CardTitle className="text-2xl">Become a Tutor</CardTitle>
            <CardDescription>Create courses and start earning from student enrollments.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">At least 8 characters.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  placeholder="e.g. Senior Web Developer & Educator"
                  value={formData.headline}
                  onChange={(e) => handleChange("headline", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Tell students about your background and experience"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expertise">Areas of Expertise</Label>
                <Input
                  id="expertise"
                  placeholder="Web Development, Digital Marketing (comma separated)"
                  value={formData.expertiseAreas}
                  onChange={(e) => handleChange("expertiseAreas", e.target.value)}
                />
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => handleCheckboxChange("agreeTerms", checked as boolean)}
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onCheckedChange={(checked) => handleCheckboxChange("subscribeNewsletter", checked as boolean)}
                  />
                  <label htmlFor="subscribeNewsletter" className="text-sm text-muted-foreground">
                    Send me marketing emails and feature updates (optional)
                  </label>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full text-base" disabled={isSubmitting || !formData.agreeTerms}>
                {isSubmitting ? "Creating account..." : "Create Tutor Account"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
