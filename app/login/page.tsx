"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomCursor } from "@/components/custom-cursor"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

const ROLE_HOME: Record<string, string> = {
  super_admin: "/super-admin",
  content_admin: "/content-admin",
  school_admin: "/school-admin",
  student: "/student",
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const result = await signIn("credentials", { email, password, redirect: false })

    if (!result || result.error) {
      setIsLoading(false)
      setError(
        result?.code === "rate_limited"
          ? "Too many login attempts. Please wait a few minutes and try again."
          : "Invalid email or password."
      )
      return
    }

    const sessionResponse = await fetch("/api/auth/session")
    const session = await sessionResponse.json()
    const role = session?.user?.role as string | undefined
    router.push((role && ROLE_HOME[role]) || "/")
  }

  return (
    <div className="marketing relative isolate min-h-screen flex flex-col overflow-hidden bg-background text-foreground bg-gradient-to-br from-background via-background to-primary/5">
      <CustomCursor />
      <div className="absolute inset-0 bg-grain" />
      <div
        aria-hidden
        className="animate-glow-pulse absolute left-1/2 top-1/3 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]"
      />

      <header className="p-4 md:p-6 relative">
        <Link
          href="/"
          data-cursor="small"
          className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-border hover:bg-background hover:text-foreground hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative">
        <Card className="w-full max-w-md border-border/60 shadow-xl">
          <CardHeader className="text-center pb-4">
            <Link href="/" className="inline-flex items-center justify-center mb-5">
              <img src="/logo.png" alt="TYP - Testing Your Preparedness" className="h-12 w-auto" />
            </Link>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive text-center" role="alert">
                  {error}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full text-base" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
