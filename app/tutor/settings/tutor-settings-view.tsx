"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2 } from "lucide-react"
import {
  updateProfile,
  updateTutorProfile,
  updatePassword,
  getBankList,
  resolvePayoutAccount,
  connectPaystackSubaccount,
  disconnectPaystackSubaccount,
} from "./actions"
import type { User as UserModel } from "@/lib/generated/prisma/client"

type SafeUser = Omit<UserModel, "passwordHash">

export function TutorSettingsView({
  user,
  tutorProfile,
  paystackSubaccountCode,
}: {
  user: SafeUser
  tutorProfile: { headline: string; bio: string; expertiseAreas: string[] }
  paystackSubaccountCode: string | null
}) {
  const [isPending, startTransition] = useTransition()

  const [profile, setProfile] = useState({ name: user.name, email: user.email })
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [tutorForm, setTutorForm] = useState({
    headline: tutorProfile.headline,
    bio: tutorProfile.bio,
    expertiseAreas: tutorProfile.expertiseAreas.join(", "),
  })
  const [tutorMessage, setTutorMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" })
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [connectedSubaccountCode, setConnectedSubaccountCode] = useState(paystackSubaccountCode)
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([])
  const [banksError, setBanksError] = useState<string | null>(null)
  const [payoutForm, setPayoutForm] = useState({ bankCode: "", accountNumber: "" })
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(null)
  const [payoutMessage, setPayoutMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isResolving, setIsResolving] = useState(false)

  useEffect(() => {
    if (connectedSubaccountCode) return
    getBankList()
      .then(setBanks)
      .catch((err) => setBanksError(err instanceof Error ? err.message : "Couldn't load the bank list."))
  }, [connectedSubaccountCode])

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

  const handleSaveTutorProfile = () => {
    setTutorMessage(null)
    startTransition(async () => {
      try {
        await updateTutorProfile({
          headline: tutorForm.headline,
          bio: tutorForm.bio,
          expertiseAreas: tutorForm.expertiseAreas.split(",").map((a) => a.trim()).filter(Boolean),
        })
        setTutorMessage({ type: "success", text: "Tutor profile updated." })
      } catch (err) {
        setTutorMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update tutor profile." })
      }
    })
  }

  const handleSavePassword = () => {
    setPasswordMessage(null)
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage({ type: "error", text: "New passwords don't match." })
      return
    }
    startTransition(async () => {
      try {
        await updatePassword({ currentPassword: passwordForm.current, newPassword: passwordForm.next })
        setPasswordMessage({ type: "success", text: "Password updated." })
        setPasswordForm({ current: "", next: "", confirm: "" })
      } catch (err) {
        setPasswordMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update password." })
      }
    })
  }

  const handleResolveAccount = () => {
    setPayoutMessage(null)
    setResolvedAccountName(null)
    setIsResolving(true)
    resolvePayoutAccount(payoutForm)
      .then((r) => setResolvedAccountName(r.accountName))
      .catch((err) => setPayoutMessage({ type: "error", text: err instanceof Error ? err.message : "Couldn't verify that account." }))
      .finally(() => setIsResolving(false))
  }

  const handleConnectPayout = () => {
    setPayoutMessage(null)
    startTransition(async () => {
      try {
        await connectPaystackSubaccount(payoutForm)
        setConnectedSubaccountCode("connected") // exact code isn't needed client-side, just that it's set
        setPayoutMessage({ type: "success", text: "Payout account connected." })
      } catch (err) {
        setPayoutMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to connect payout account." })
      }
    })
  }

  const handleDisconnectPayout = () => {
    setPayoutMessage(null)
    startTransition(async () => {
      try {
        await disconnectPaystackSubaccount()
        setConnectedSubaccountCode(null)
        setPayoutForm({ bankCode: "", accountNumber: "" })
        setResolvedAccountName(null)
        setPayoutMessage({ type: "success", text: "Payout account disconnected. Connect a new one below." })
      } catch (err) {
        setPayoutMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to disconnect payout account." })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and tutor profile.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tutor-profile">Tutor Profile</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your basic account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileMessage && (
                <p className={`text-sm rounded-lg border p-3 ${profileMessage.type === "success" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600" : "border-destructive/50 bg-destructive/10 text-destructive"}`}>
                  {profileMessage.text}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <Button onClick={handleSaveProfile} disabled={isPending}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutor-profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tutor Profile</CardTitle>
              <CardDescription>What students see on your courses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tutorMessage && (
                <p className={`text-sm rounded-lg border p-3 ${tutorMessage.type === "success" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600" : "border-destructive/50 bg-destructive/10 text-destructive"}`}>
                  {tutorMessage.text}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" value={tutorForm.headline} onChange={(e) => setTutorForm((f) => ({ ...f, headline: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} value={tutorForm.bio} onChange={(e) => setTutorForm((f) => ({ ...f, bio: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expertise">Areas of Expertise</Label>
                <Input
                  id="expertise"
                  placeholder="Web Development, Digital Marketing (comma separated)"
                  value={tutorForm.expertiseAreas}
                  onChange={(e) => setTutorForm((f) => ({ ...f, expertiseAreas: e.target.value }))}
                />
              </div>
              <Button onClick={handleSaveTutorProfile} disabled={isPending}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Account</CardTitle>
              <CardDescription>
                Connect a bank account via Paystack so course payments split automatically - your share lands directly
                in your account, no manual payout needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {payoutMessage && (
                <p className={`text-sm rounded-lg border p-3 ${payoutMessage.type === "success" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600" : "border-destructive/50 bg-destructive/10 text-destructive"}`}>
                  {payoutMessage.text}
                </p>
              )}
              {banksError && (
                <p className="text-sm rounded-lg border border-destructive/50 bg-destructive/10 text-destructive p-3">
                  {banksError} Paystack may not be configured in this environment yet.
                </p>
              )}

              {connectedSubaccountCode ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>
                      Your payout account is connected. Future course sales split automatically - the platform's cut
                      goes to TYP, the rest is paid out to this account by Paystack.
                    </span>
                  </div>
                  <Button variant="outline" onClick={handleDisconnectPayout} disabled={isPending}>
                    Disconnect Payout Account
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Disconnecting stops future splits - sales go to the platform's account until you connect a new
                    one. It won't affect payouts already made.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bank">Bank / Mobile Money *</Label>
                    <Select
                      value={payoutForm.bankCode}
                      onValueChange={(v) => {
                        setPayoutForm((f) => ({ ...f, bankCode: v }))
                        setResolvedAccountName(null)
                      }}
                      disabled={banks.length === 0}
                    >
                      <SelectTrigger id="bank">
                        <SelectValue placeholder={banks.length === 0 ? "Loading banks..." : "Select a bank"} />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((b) => (
                          <SelectItem key={b.code} value={b.code}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-number">Account Number *</Label>
                    <Input
                      id="account-number"
                      value={payoutForm.accountNumber}
                      onChange={(e) => {
                        setPayoutForm((f) => ({ ...f, accountNumber: e.target.value }))
                        setResolvedAccountName(null)
                      }}
                      placeholder="0123456789"
                    />
                  </div>

                  {resolvedAccountName ? (
                    <p className="text-sm rounded-lg border border-emerald-500/50 bg-emerald-500/10 text-emerald-600 p-3">
                      Account holder: <strong>{resolvedAccountName}</strong>. If this looks right, connect below.
                    </p>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleResolveAccount}
                      disabled={isResolving || !payoutForm.bankCode || !payoutForm.accountNumber}
                    >
                      {isResolving ? "Verifying..." : "Verify Account"}
                    </Button>
                  )}

                  <Button onClick={handleConnectPayout} disabled={isPending || !resolvedAccountName}>
                    Connect Payout Account
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <p className={`text-sm rounded-lg border p-3 ${passwordMessage.type === "success" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600" : "border-destructive/50 bg-destructive/10 text-destructive"}`}>
                  {passwordMessage.text}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password *</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password *</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                />
              </div>
              <Button onClick={handleSavePassword} disabled={isPending}>
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
