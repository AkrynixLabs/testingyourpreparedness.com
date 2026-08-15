"use client"

import { useState, useTransition } from "react"
import { User, Bell, Shield, Eye, EyeOff, Key, Store, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updatePassword, updateProfile, updatePlatformFeePercent, updatePlatformInfo } from "./actions"
import type { User as UserModel } from "@/lib/generated/prisma/client"

type SafeUser = Omit<UserModel, "passwordHash">

export function SettingsView({
  user,
  platformFeePercent,
  platformName,
  supportEmail,
}: {
  user: SafeUser
  platformFeePercent: number
  platformName: string
  supportEmail: string
}) {
  const [isPending, startTransition] = useTransition()

  const [profile, setProfile] = useState({ name: user.name, email: user.email })
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [feeValue, setFeeValue] = useState(String(platformFeePercent))
  const [feeMessage, setFeeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [platformInfo, setPlatformInfo] = useState({ platformName, supportEmail })
  const [platformInfoMessage, setPlatformInfoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Not backed by any schema/system yet (no notification delivery or per-user
  // preferences table exists) - local UI state only, intentionally not persisted.
  const [notifications, setNotifications] = useState({
    newSchoolRegistration: true,
    subscriptionChanges: true,
    paymentAlerts: true,
    contentSubmissions: true,
    systemAlerts: true,
    reviewQueueUpdates: true,
    dailySummary: false,
  })

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const handleSaveProfile = () => {
    setProfileMessage(null)
    startTransition(async () => {
      try {
        await updateProfile(profile)
        setProfileMessage({ type: "success", text: "Profile updated." })
      } catch (err) {
        setProfileMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile." })
      }
    })
  }

  const handleSaveFee = () => {
    setFeeMessage(null)
    const parsed = Number(feeValue)
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      setFeeMessage({ type: "error", text: "Enter a whole number between 0 and 100." })
      return
    }
    startTransition(async () => {
      try {
        await updatePlatformFeePercent(parsed)
        setFeeMessage({ type: "success", text: "Platform fee updated." })
      } catch (err) {
        setFeeMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update platform fee." })
      }
    })
  }

  const handleSavePlatformInfo = () => {
    setPlatformInfoMessage(null)
    startTransition(async () => {
      try {
        await updatePlatformInfo(platformInfo)
        setPlatformInfoMessage({ type: "success", text: "Platform info updated." })
      } catch (err) {
        setPlatformInfoMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to update platform info.",
        })
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
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="gap-2">
            <Store className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="platform" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Platform
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar ?? ""} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Photo upload isn&apos;t wired up yet.</p>
              </div>

              {profileMessage && (
                <p className={`text-sm ${profileMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {profileMessage.text}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Notification delivery isn&apos;t built yet - no emails are sent from anywhere in the app. These toggles
              aren&apos;t saved.
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure which emails you would receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "newSchoolRegistration" as const, title: "New School Registration", description: "When a new school signs up" },
                { key: "subscriptionChanges" as const, title: "Subscription Changes", description: "Plan upgrades, downgrades, or cancellations" },
                { key: "paymentAlerts" as const, title: "Payment Alerts", description: "Failed payments and overdue invoices" },
                { key: "contentSubmissions" as const, title: "Content Submissions", description: "New questions or assessments pending review" },
                { key: "systemAlerts" as const, title: "System Alerts", description: "Security issues and platform updates" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>Configure how you would receive notifications within the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "reviewQueueUpdates" as const, title: "Review Queue Updates", description: "New content pending approval" },
                { key: "dailySummary" as const, title: "Daily Summary", description: "Daily platform activity summary" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
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
                    placeholder="Enter current password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
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
                    placeholder="Enter new password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
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
                  placeholder="Confirm new password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={isPending}>
                <Key className="h-4 w-4 mr-2" />
                {isPending ? "Updating..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication isn&apos;t built yet. This section is illustrative only.
                </AlertDescription>
              </Alert>
              <Button variant="outline" disabled>
                Enable Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your active sessions across devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Session tracking isn&apos;t built yet - Auth.js JWT sessions aren&apos;t persisted server-side, so
                  there&apos;s nothing to list or revoke here.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Marketplace</CardTitle>
              <CardDescription>
                Platform fee applied to every course purchase - read live at checkout time, no redeploy needed to change it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feeMessage && (
                <p className={`text-sm ${feeMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {feeMessage.text}
                </p>
              )}
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="platformFee">Platform Fee (%)</Label>
                <div className="relative">
                  <Input
                    id="platformFee"
                    type="number"
                    min={0}
                    max={100}
                    value={feeValue}
                    onChange={(e) => setFeeValue(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Applies platform-wide to every tutor and course - no per-tutor override exists yet.
                </p>
              </div>
              <Button onClick={handleSaveFee} disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Tab */}
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Info</CardTitle>
              <CardDescription>
                Platform-wide display name and support contact, read live wherever the app shows them - no
                redeploy needed to change either.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Settings2 className="h-4 w-4" />
                <AlertDescription>
                  Not yet wired into the public contact page or email templates, which still show their own
                  hardcoded values - this is the config store only, for now.
                </AlertDescription>
              </Alert>
              {platformInfoMessage && (
                <p
                  className={`text-sm ${
                    platformInfoMessage.type === "success" ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {platformInfoMessage.text}
                </p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={platformInfo.platformName}
                    onChange={(e) => setPlatformInfo({ ...platformInfo, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={platformInfo.supportEmail}
                    onChange={(e) => setPlatformInfo({ ...platformInfo, supportEmail: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleSavePlatformInfo} disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
