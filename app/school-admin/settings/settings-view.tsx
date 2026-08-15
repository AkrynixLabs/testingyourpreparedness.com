"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Mail, Phone, Globe, MapPin, Bell, Shield, Users, Key, Save, X } from "lucide-react"
import { updateSchoolProfile, inviteAdmin, cancelInvitation, resendInvitation, removeAdmin, updatePassword } from "./actions"
import type { EducationLevel, Invitation, School, SchoolAdmin, User } from "@/lib/generated/prisma/client"

type SafeUser = Omit<User, "passwordHash">
type AdminRow = SchoolAdmin & { user: SafeUser }

export function SettingsView({
  school,
  admins,
  invitations,
  isPrimary,
  me,
}: {
  school: School
  admins: AdminRow[]
  invitations: Invitation[]
  isPrimary: boolean
  me: SafeUser
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [profile, setProfile] = useState({
    name: school.name,
    email: school.email,
    phone: school.phone,
    website: school.website ?? "",
    address: school.address,
    educationLevel: school.educationLevel,
  })
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Not backed by any delivery system yet (see CLAUDE.md) - local UI state only.
  const [notifications, setNotifications] = useState({
    emailResults: true,
    emailNewAssessments: true,
    emailBilling: true,
    smsResults: false,
    smsReminders: true,
  })

  const handleSaveProfile = () => {
    setProfileMessage(null)
    startTransition(async () => {
      try {
        await updateSchoolProfile(profile)
        setProfileMessage({ type: "success", text: "School profile updated." })
        router.refresh()
      } catch (err) {
        setProfileMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile." })
      }
    })
  }

  const handleInvite = () => {
    setInviteError(null)
    startTransition(async () => {
      try {
        await inviteAdmin(inviteEmail)
        setInviteEmail("")
        setInviteOpen(false)
        router.refresh()
      } catch (err) {
        setInviteError(err instanceof Error ? err.message : "Failed to send invitation.")
      }
    })
  }

  const handleCancelInvite = (id: string) => {
    startTransition(async () => {
      await cancelInvitation(id)
      router.refresh()
    })
  }

  const [resendInviteError, setResendInviteError] = useState<string | null>(null)
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null)

  const handleResendInvite = (id: string) => {
    setResendInviteError(null)
    setResendingInviteId(id)
    startTransition(async () => {
      try {
        await resendInvitation(id)
      } catch (err) {
        setResendInviteError(err instanceof Error ? err.message : "Failed to resend invitation.")
      } finally {
        setResendingInviteId(null)
      }
    })
  }

  const handleRemoveAdmin = (id: string) => {
    startTransition(async () => {
      await removeAdmin(id)
      router.refresh()
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
        <p className="text-muted-foreground">Manage your school profile, administrators, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">School Profile</TabsTrigger>
          <TabsTrigger value="admins">Administrators</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* School Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Update your school&apos;s basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">
                    {school.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h4 className="font-medium">School Logo</h4>
                  <p className="text-sm text-muted-foreground">Logo upload isn&apos;t wired up yet.</p>
                </div>
              </div>

              <Separator />

              {profileMessage && (
                <p className={`text-sm ${profileMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {profileMessage.text}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="schoolName"
                      className="pl-9"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolCode">School Code</Label>
                  <Input id="schoolCode" value={school.code} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">This is your unique school identifier</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-9"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      className="pl-9"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level</Label>
                  <Select
                    value={profile.educationLevel}
                    onValueChange={(value) => setProfile({ ...profile, educationLevel: value as EducationLevel })}
                  >
                    <SelectTrigger id="educationLevel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior_high">Junior High School</SelectItem>
                      <SelectItem value="senior_high">Senior High School</SelectItem>
                      <SelectItem value="basic">Basic School (Primary + JHS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      className="pl-9 min-h-[80px]"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Administrators Tab */}
        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>School Administrators</CardTitle>
                  <CardDescription>Manage who has access to this school&apos;s dashboard</CardDescription>
                </div>
                <AlertDialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <AlertDialogTrigger asChild>
                    <Button>Invite Admin</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Invite Administrator</AlertDialogTitle>
                      <AlertDialogDescription>
                        We&apos;ll email them a one-click link to accept and create their account. It expires in 7
                        days.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="inviteEmail">Email Address *</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        placeholder="colleague@school.edu.gh"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="mt-2"
                      />
                      {inviteError && <p className="text-sm text-destructive mt-2">{inviteError}</p>}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={(e) => { e.preventDefault(); handleInvite() }} disabled={isPending}>
                        Send Invitation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {admin.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{admin.user.name}</p>
                          {admin.isPrimary && <Badge>Primary</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{admin.user.email}</p>
                      </div>
                    </div>
                    {!admin.isPrimary && admin.userId !== me.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleRemoveAdmin(admin.id)}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Invitations that have been sent but not yet accepted</CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No pending invitations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resendInviteError && (
                    <p className="text-sm text-destructive">{resendInviteError}</p>
                  )}
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{inv.email}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvite(inv.id)}
                          disabled={isPending}
                        >
                          {resendingInviteId === inv.id ? "Resending..." : "Resend"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleCancelInvite(inv.id)} disabled={isPending}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              There&apos;s no email/SMS delivery system built yet - these toggles aren&apos;t saved.
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assessment Results</Label>
                  <p className="text-sm text-muted-foreground">Receive email summaries when students complete assessments</p>
                </div>
                <Switch
                  checked={notifications.emailResults}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailResults: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Assessments Available</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new assessments are added to the library</p>
                </div>
                <Switch
                  checked={notifications.emailNewAssessments}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewAssessments: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Billing &amp; Subscription</Label>
                  <p className="text-sm text-muted-foreground">Receive invoices and subscription renewal reminders</p>
                </div>
                <Switch
                  checked={notifications.emailBilling}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailBilling: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <p className={`text-sm ${passwordMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {passwordMessage.text}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
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
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>Two-factor authentication isn&apos;t built yet.</AlertDescription>
              </Alert>
              <Button variant="outline" className="mt-4" disabled>
                Enable 2FA
              </Button>
            </CardContent>
          </Card>

          {isPrimary && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Delete School Account</p>
                    <p className="text-sm text-muted-foreground">
                      Not available yet - permanently deleting a school and all its student/result data needs a
                      dedicated, carefully-guarded flow that hasn&apos;t been built. Contact platform support.
                    </p>
                  </div>
                  <Button variant="destructive" disabled>
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
