"use client"

import { useState, useTransition } from "react"
import { User, Bell, Shield, Palette, Eye, EyeOff, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updatePassword, updateProfile } from "./actions"
import type { User as UserModel } from "@/lib/generated/prisma/client"

type SafeUser = Omit<UserModel, "passwordHash">

export function ContentSettingsView({ user }: { user: SafeUser }) {
  const [isPending, startTransition] = useTransition()

  const [profile, setProfile] = useState({ name: user.name, email: user.email })
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Not backed by any schema/system yet (no notification delivery or per-user
  // preferences table exists) - local UI state only, intentionally not persisted.
  const [notifications, setNotifications] = useState({
    emailNewSubmissions: true,
    emailReviewReminders: true,
    emailWeeklyDigest: true,
    browserNotifications: false,
    reviewAssignments: true,
    questionFlags: true,
  })
  const [preferences, setPreferences] = useState({
    defaultSubject: "Mathematics",
    questionsPerPage: "25",
    autoSaveDrafts: true,
    showPreviewPanel: true,
    keyboardShortcuts: true,
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
        <p className="text-muted-foreground">Manage your account and preferences</p>
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
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
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
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground">Photo upload isn&apos;t wired up yet.</p>
              </div>

              {profileMessage && (
                <p
                  className={`text-sm ${
                    profileMessage.type === "success" ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {profileMessage.text}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
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
              Notification delivery isn&apos;t built yet - these toggles aren&apos;t saved.
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what email notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Question Submissions</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new questions are submitted for review
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNewSubmissions}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewSubmissions: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Review Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive reminders about pending reviews</p>
                </div>
                <Switch
                  checked={notifications.emailReviewReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailReviewReminders: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Weekly summary of content statistics and updates</p>
                </div>
                <Switch
                  checked={notifications.emailWeeklyDigest}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailWeeklyDigest: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications within the app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                </div>
                <Switch
                  checked={notifications.browserNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, browserNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Review Assignments</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when questions are assigned to you for review
                  </p>
                </div>
                <Switch
                  checked={notifications.reviewAssignments}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, reviewAssignments: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Question Flags</Label>
                  <p className="text-sm text-muted-foreground">Notify when your questions are flagged for issues</p>
                </div>
                <Switch
                  checked={notifications.questionFlags}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, questionFlags: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Alert>
            <Palette className="h-4 w-4" />
            <AlertDescription>
              There&apos;s no per-user preferences store yet - these selections aren&apos;t saved.
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>Content Preferences</CardTitle>
              <CardDescription>Customize your content creation experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Subject</Label>
                  <Select
                    value={preferences.defaultSubject}
                    onValueChange={(value) => setPreferences({ ...preferences, defaultSubject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="English Language">English Language</SelectItem>
                      <SelectItem value="Integrated Science">Integrated Science</SelectItem>
                      <SelectItem value="Social Studies">Social Studies</SelectItem>
                      <SelectItem value="RME">RME</SelectItem>
                      <SelectItem value="ICT">ICT</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Pre-select this subject when creating questions</p>
                </div>
                <div className="space-y-2">
                  <Label>Questions Per Page</Label>
                  <Select
                    value={preferences.questionsPerPage}
                    onValueChange={(value) => setPreferences({ ...preferences, questionsPerPage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Number of questions shown in the question bank</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Save Drafts</Label>
                    <p className="text-sm text-muted-foreground">Automatically save questions as you type</p>
                  </div>
                  <Switch
                    checked={preferences.autoSaveDrafts}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, autoSaveDrafts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Preview Panel</Label>
                    <p className="text-sm text-muted-foreground">Display live preview when creating questions</p>
                  </div>
                  <Switch
                    checked={preferences.showPreviewPanel}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, showPreviewPanel: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Keyboard Shortcuts</Label>
                    <p className="text-sm text-muted-foreground">Enable keyboard shortcuts for faster navigation</p>
                  </div>
                  <Switch
                    checked={preferences.keyboardShortcuts}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, keyboardShortcuts: checked })}
                  />
                </div>
              </div>
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
                <p
                  className={`text-sm ${
                    passwordMessage.type === "success" ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {passwordMessage.text}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password *</Label>
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
                <Label htmlFor="newPassword">New Password *</Label>
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
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
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
                  there's nothing to list or revoke here.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
