"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Bell, Shield, Palette, Save, Eye, EyeOff, Mail, Clock } from "lucide-react"
import { updateProfile, updateGuardian, updatePassword } from "./actions"
import type { Guardian, GuardianRelation, User as UserModel } from "@/lib/generated/prisma/client"

type SafeUser = Omit<UserModel, "passwordHash">

export function StudentSettingsView({
  user,
  schoolName,
  className,
  guardian,
}: {
  user: SafeUser
  schoolName: string | null
  className: string | null
  guardian: Guardian | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [profile, setProfile] = useState({ name: user.name, email: user.email })
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [guardianForm, setGuardianForm] = useState({
    name: guardian?.name ?? "",
    phone: guardian?.phone ?? "",
    email: guardian?.email ?? "",
    relation: (guardian?.relation ?? "guardian") as GuardianRelation,
  })
  const [guardianMessage, setGuardianMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  const handleSaveProfile = () => {
    setProfileMessage(null)
    startTransition(async () => {
      try {
        await updateProfile(profile)
        setProfileMessage({ type: "success", text: "Profile updated." })
        router.refresh()
      } catch (err) {
        setProfileMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile." })
      }
    })
  }

  const handleSaveGuardian = () => {
    setGuardianMessage(null)
    startTransition(async () => {
      try {
        await updateGuardian(guardianForm)
        setGuardianMessage({ type: "success", text: "Guardian information updated." })
        router.refresh()
      } catch (err) {
        setGuardianMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update guardian." })
      }
    })
  }

  const handleUpdatePassword = () => {
    setPasswordMessage(null)
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage({ type: "error", text: "New password and confirmation don't match." })
      return
    }
    startTransition(async () => {
      try {
        await updatePassword({ currentPassword: passwordForm.current, newPassword: passwordForm.next })
        setPasswordForm({ current: "", next: "", confirm: "" })
        setPasswordMessage({ type: "success", text: "Password updated." })
      } catch (err) {
        setPasswordMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update password." })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Photo upload isn&apos;t wired up yet.</p>
              </div>

              {profileMessage && (
                <p className={`text-sm ${profileMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {profileMessage.text}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input id="school" value={schoolName ?? "Independent student"} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form">Form/Class</Label>
                  <Input id="form" value={className ?? "No class assigned"} disabled className="bg-muted" />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isPending}>
                <Save className="h-4 w-4 mr-2" />
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guardian Information</CardTitle>
              <CardDescription>Contact details for your parent or guardian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guardianMessage && (
                <p className={`text-sm ${guardianMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {guardianMessage.text}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Guardian Name</Label>
                  <Input id="guardianName" value={guardianForm.name} onChange={(e) => setGuardianForm({ ...guardianForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Guardian Phone</Label>
                  <Input id="guardianPhone" value={guardianForm.phone} onChange={(e) => setGuardianForm({ ...guardianForm, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Guardian Email</Label>
                  <Input id="guardianEmail" type="email" value={guardianForm.email} onChange={(e) => setGuardianForm({ ...guardianForm, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianRelation">Relationship</Label>
                  <Select value={guardianForm.relation} onValueChange={(v) => setGuardianForm({ ...guardianForm, relation: v as GuardianRelation })}>
                    <SelectTrigger id="guardianRelation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveGuardian} disabled={isPending}>
                <Save className="h-4 w-4 mr-2" />
                {isPending ? "Saving..." : "Save Guardian Info"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>There&apos;s no notification delivery system built yet - these toggles aren&apos;t saved.</AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Exam Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified about upcoming exams</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Results Available</p>
                    <p className="text-sm text-muted-foreground">Notify when exam results are ready</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Weekly Progress Report</p>
                    <p className="text-sm text-muted-foreground">Receive weekly summary of your progress</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Alert>
            <Palette className="h-4 w-4" />
            <AlertDescription>There&apos;s no per-user preferences store yet - these selections aren&apos;t saved.</AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exam Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Show Timer</p>
                    <p className="text-sm text-muted-foreground">Display countdown during exams</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Confirm Before Submit</p>
                  <p className="text-sm text-muted-foreground">Show confirmation dialog when submitting</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <p className={`text-sm ${passwordMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {passwordMessage.text}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={isPending}>
                {isPending ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Session tracking isn&apos;t built yet - Auth.js JWT sessions aren&apos;t persisted server-side, so there&apos;s
                  nothing to list or revoke here.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
