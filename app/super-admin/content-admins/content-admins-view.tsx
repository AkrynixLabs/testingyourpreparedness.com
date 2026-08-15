"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  MoreHorizontal,
  Mail,
  Shield,
  ShieldOff,
  Trash2,
  CheckCircle2,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createContentAdmin, setContentAdminStatus, deleteContentAdmin, resendContentAdminCredentials } from "./actions"
import type { ContentAdminProfile, ContentAdminSubject, ContentAdminStatus, Subject, User } from "@/lib/generated/prisma/client"

type AdminRow = ContentAdminProfile & {
  user: Omit<User, "passwordHash">
  subjects: (ContentAdminSubject & { subject: Subject })[]
  counts: { created: number; approved: number; pending: number; rejected: number }
}

export function ContentAdminsView({ admins, subjects }: { admins: AdminRow[]; subjects: Subject[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ContentAdminStatus | "all">("all")
  const [subjectFilter, setSubjectFilter] = useState("all")

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addName, setAddName] = useState("")
  const [addEmail, setAddEmail] = useState("")
  const [addSubjectIds, setAddSubjectIds] = useState<string[]>([])
  const [credentials, setCredentials] = useState<{ email: string; tempPassword: string } | null>(null)

  const [resendTarget, setResendTarget] = useState<AdminRow | null>(null)
  const [resendCredentials, setResendCredentials] = useState<{ email: string; tempPassword: string } | null>(null)

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || admin.status === statusFilter
    const matchesSubject = subjectFilter === "all" || admin.subjects.some((s) => s.subjectId === subjectFilter)
    return matchesSearch && matchesStatus && matchesSubject
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const result = await createContentAdmin({ name: addName, email: addEmail, subjectIds: addSubjectIds })
        setCredentials({ email: addEmail.trim().toLowerCase(), tempPassword: result.tempPassword })
        setAddName("")
        setAddEmail("")
        setAddSubjectIds([])
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create content admin")
      }
    })
  }

  const closeAddDialog = () => {
    setIsAddOpen(false)
    setCredentials(null)
    setError(null)
  }

  const handleSetStatus = (profileId: string, status: ContentAdminStatus) => {
    setError(null)
    startTransition(async () => {
      try {
        await setContentAdminStatus(profileId, status)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update status")
      }
    })
  }

  const handleResend = () => {
    if (!resendTarget) return
    setError(null)
    startTransition(async () => {
      try {
        const result = await resendContentAdminCredentials(resendTarget.id)
        setResendCredentials(result)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to resend credentials")
        setResendTarget(null)
      }
    })
  }

  const closeResendDialog = () => {
    setResendTarget(null)
    setResendCredentials(null)
  }

  const handleRemove = (profileId: string) => {
    setError(null)
    startTransition(async () => {
      try {
        await deleteContentAdmin(profileId)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove content admin")
      }
    })
  }

  return (
    <>
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Dialog open={isAddOpen} onOpenChange={(open) => (open ? setIsAddOpen(true) : closeAddDialog())}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Content Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Content Administrator</DialogTitle>
              <DialogDescription>
                We'll email their temporary password, and you'll also get a one-time copy here to hand to them
                directly in case delivery doesn't go through.
              </DialogDescription>
            </DialogHeader>

            {credentials ? (
              <div className="space-y-4 py-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Content admin added</AlertTitle>
                  <AlertDescription>
                    Share these credentials with the new admin: <br />
                    <strong>{credentials.email}</strong> / <strong>{credentials.tempPassword}</strong>
                  </AlertDescription>
                </Alert>
                <DialogFooter>
                  <Button onClick={closeAddDialog}>Done</Button>
                </DialogFooter>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleAdd}>
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="Enter full name" value={addName} onChange={(e) => setAddName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Assigned Subjects</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {subjects.map((subject) => (
                      <label key={subject.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-input"
                          checked={addSubjectIds.includes(subject.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAddSubjectIds([...addSubjectIds, subject.id])
                            } else {
                              setAddSubjectIds(addSubjectIds.filter((id) => id !== subject.id))
                            }
                          }}
                        />
                        {subject.name}
                      </label>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeAddDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    <Mail className="mr-2 h-4 w-4" />
                    Add Admin
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!resendTarget} onOpenChange={(open) => !open && closeResendDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Email</DialogTitle>
            <DialogDescription>
              Delivery can't be confirmed, so resending issues a <strong>new</strong> temporary password for{" "}
              {resendTarget?.user.name} - their old temporary password will stop working once this completes.
            </DialogDescription>
          </DialogHeader>
          {resendCredentials ? (
            <div className="space-y-4 py-2">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>New credentials issued</AlertTitle>
                <AlertDescription>
                  Share these with {resendTarget?.user.name} in case delivery doesn't go through: <br />
                  <strong>{resendCredentials.email}</strong> / <strong>{resendCredentials.tempPassword}</strong>
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button onClick={closeResendDialog}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setResendTarget(null)} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleResend} disabled={isPending}>
                <Mail className="mr-2 h-4 w-4" />
                {isPending ? "Resending..." : "Resend Email"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContentAdminStatus | "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead className="text-center">Approved</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No content admins match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={admin.user.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {admin.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{admin.user.name}</p>
                          <p className="text-sm text-muted-foreground">{admin.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {admin.subjects.length === 0 ? (
                          <span className="text-xs text-muted-foreground">None assigned</span>
                        ) : (
                          admin.subjects.map((s) => (
                            <Badge key={s.subjectId} variant="secondary" className="text-xs">
                              {s.subject.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{admin.counts.created}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-medium">{admin.counts.approved}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {admin.counts.pending > 0 ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {admin.counts.pending}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          admin.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : admin.status === "pending"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                            : ""
                        }
                        variant={admin.status === "inactive" ? "outline" : "default"}
                      >
                        {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {admin.lastActive ? admin.lastActive.toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isPending}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setResendTarget(admin)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Resend Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {admin.status === "active" ? (
                            <DropdownMenuItem className="text-amber-600" onClick={() => handleSetStatus(admin.id, "inactive")}>
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : admin.status === "inactive" ? (
                            <DropdownMenuItem className="text-green-600" onClick={() => handleSetStatus(admin.id, "active")}>
                              <Shield className="mr-2 h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600" onClick={() => handleSetStatus(admin.id, "active")}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve Access
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(admin.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
