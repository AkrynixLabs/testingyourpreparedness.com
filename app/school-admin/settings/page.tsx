"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Bell,
  Shield,
  Users,
  Key,
  Save,
  Upload,
  Trash2,
  Plus,
  X,
} from "lucide-react"

// Demo data
const schoolInfo = {
  name: "Achimota School",
  code: "ACH-001",
  email: "admin@achimota.edu.gh",
  phone: "+233 30 222 1234",
  website: "www.achimota.edu.gh",
  address: "Achimota, Accra, Greater Accra Region",
  type: "Junior High School",
  established: "1927",
  logo: "/placeholder.svg",
}

const admins = [
  {
    id: "1",
    name: "Mr. Kofi Asante",
    email: "kofi.asante@achimota.edu.gh",
    role: "Primary Admin",
    lastActive: "2 minutes ago",
    avatar: "",
  },
  {
    id: "2",
    name: "Mrs. Ama Boateng",
    email: "ama.boateng@achimota.edu.gh",
    role: "Admin",
    lastActive: "1 hour ago",
    avatar: "",
  },
]

export default function SettingsPage() {
  const [school, setSchool] = useState(schoolInfo)
  const [notifications, setNotifications] = useState({
    emailResults: true,
    emailNewAssessments: true,
    emailBilling: true,
    smsResults: false,
    smsReminders: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your school profile, administrators, and preferences
        </p>
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
              <CardDescription>
                Update your school&apos;s basic information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={school.logo} alt={school.name} />
                  <AvatarFallback className="text-2xl">
                    {school.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h4 className="font-medium">School Logo</h4>
                  <p className="text-sm text-muted-foreground">
                    This will be displayed on student reports and certificates.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New
                    </Button>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="schoolName"
                      className="pl-9"
                      value={school.name}
                      onChange={(e) => setSchool({ ...school, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolCode">School Code</Label>
                  <Input
                    id="schoolCode"
                    value={school.code}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is your unique school identifier
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9"
                      value={school.email}
                      onChange={(e) => setSchool({ ...school, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-9"
                      value={school.phone}
                      onChange={(e) => setSchool({ ...school, phone: e.target.value })}
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
                      value={school.website}
                      onChange={(e) => setSchool({ ...school, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">School Type</Label>
                  <Select
                    value={school.type}
                    onValueChange={(value) => setSchool({ ...school, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior High School">Junior High School</SelectItem>
                      <SelectItem value="Senior High School">Senior High School</SelectItem>
                      <SelectItem value="Basic School">Basic School (Primary + JHS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      className="pl-9 min-h-[80px]"
                      value={school.address}
                      onChange={(e) => setSchool({ ...school, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
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
                  <CardDescription>
                    Manage who has access to this school&apos;s dashboard
                  </CardDescription>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Invite Admin
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Invite Administrator</AlertDialogTitle>
                      <AlertDialogDescription>
                        Send an invitation to a new administrator. They will receive an email with instructions to set up their account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        placeholder="colleague@school.edu.gh"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Send Invitation</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={admin.avatar} />
                        <AvatarFallback>
                          {admin.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{admin.name}</p>
                          {admin.role === "Primary Admin" && (
                            <Badge>Primary</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Active {admin.lastActive}
                        </p>
                      </div>
                    </div>
                    {admin.role !== "Primary Admin" && (
                      <Button variant="ghost" size="icon" className="text-destructive">
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
              <CardDescription>
                Invitations that have been sent but not yet accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No pending invitations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure which email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assessment Results</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email summaries when students complete assessments
                  </p>
                </div>
                <Switch
                  checked={notifications.emailResults}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailResults: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Assessments Available</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new assessments are added to the library
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNewAssessments}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailNewAssessments: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Billing & Subscription</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive invoices and subscription renewal reminders
                  </p>
                </div>
                <Switch
                  checked={notifications.emailBilling}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailBilling: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                SMS Notifications
              </CardTitle>
              <CardDescription>
                Configure SMS alerts for important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Result Summaries</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive SMS when class assessment results are ready
                  </p>
                </div>
                <Switch
                  checked={notifications.smsResults}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsResults: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assessment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming assessment deadlines
                  </p>
                </div>
                <Switch
                  checked={notifications.smsReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, smsReminders: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with a mix of letters, numbers, and symbols
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Protect your account with 2FA via authenticator app
                  </p>
                </div>
                <Badge variant="outline">Not Enabled</Badge>
              </div>
              <Button variant="outline" className="mt-4">
                Enable 2FA
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Delete School Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your school and all associated data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your school account, all student data, assessment results, and remove your subscription.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, Delete Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
