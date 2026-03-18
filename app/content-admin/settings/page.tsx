"use client"

import { useState } from "react"

import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Eye,
  EyeOff,
  Key
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"

export default function ContentSettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "Ama",
    lastName: "Boateng",
    email: "content@typ.edu.gh",
    phone: "+233 20 123 4567",
    bio: "Senior Content Administrator specializing in Mathematics and Science curriculum development for BECE preparation."
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewSubmissions: true,
    emailReviewReminders: true,
    emailWeeklyDigest: true,
    browserNotifications: false,
    reviewAssignments: true,
    questionFlags: true
  })

  // Preferences
  const [preferences, setPreferences] = useState({
    defaultSubject: "Mathematics",
    questionsPerPage: "25",
    autoSaveDrafts: true,
    showPreviewPanel: true,
    keyboardShortcuts: true
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xl">AB</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-muted-foreground">
                  Brief description for your profile.
                </p>
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what email notifications you receive
              </CardDescription>
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
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, emailNewSubmissions: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Review Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders about pending reviews
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Weekly summary of content statistics and updates
                  </p>
                </div>
                <Switch
                  checked={notifications.emailWeeklyDigest}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, emailWeeklyDigest: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications within the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show desktop notifications
                  </p>
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
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, reviewAssignments: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Question Flags</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when your questions are flagged for issues
                  </p>
                </div>
                <Switch
                  checked={notifications.questionFlags}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, questionFlags: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Preferences</CardTitle>
              <CardDescription>
                Customize your content creation experience
              </CardDescription>
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
                  <p className="text-xs text-muted-foreground">
                    Pre-select this subject when creating questions
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Number of questions shown in the question bank
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Save Drafts</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save questions as you type
                    </p>
                  </div>
                  <Switch
                    checked={preferences.autoSaveDrafts}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, autoSaveDrafts: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Preview Panel</Label>
                    <p className="text-sm text-muted-foreground">
                      Display live preview when creating questions
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showPreviewPanel}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, showPreviewPanel: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Keyboard Shortcuts</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable keyboard shortcuts for faster navigation
                    </p>
                  </div>
                  <Switch
                    checked={preferences.keyboardShortcuts}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, keyboardShortcuts: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
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
                />
              </div>
              <Button>
                <Key className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication is currently <strong>disabled</strong>. 
                  Enable it to add an extra layer of security to your account.
                </AlertDescription>
              </Alert>
              <Button variant="outline">Enable Two-Factor Authentication</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Chrome on Windows</p>
                    <p className="text-sm text-muted-foreground">Accra, Ghana • Current session</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Safari on iPhone</p>
                    <p className="text-sm text-muted-foreground">Kumasi, Ghana • Last active 2 hours ago</p>
                  </div>
                  <Button variant="ghost" size="sm">Revoke</Button>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Sign Out All Other Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
