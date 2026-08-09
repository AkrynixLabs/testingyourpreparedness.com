"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, MoreHorizontal, ShieldOff, ShieldCheck, Eye } from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { setTutorStatus } from "./actions"
import type { TutorProfile, TutorStatus, User } from "@/lib/generated/prisma/client"

type TutorRow = TutorProfile & {
  user: Omit<User, "passwordHash">
  courseCount: number
  totalStudents: number
  totalEarnings: number
}

export function TutorsView({ tutors }: { tutors: TutorRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TutorStatus | "all">("all")

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      tutor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || tutor.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSetStatus = (tutorId: string, status: TutorStatus) => {
    setError(null)
    setPendingId(tutorId)
    startTransition(async () => {
      try {
        await setTutorStatus(tutorId, status)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update tutor status")
      } finally {
        setPendingId(null)
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
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TutorStatus | "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tutor</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead className="text-center">Courses</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTutors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No tutors match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTutors.map((tutor) => {
                  const expertiseAreas = (tutor.expertiseAreas as unknown as string[]) ?? []
                  return (
                    <TableRow key={tutor.id}>
                      <TableCell>
                        <Link href={`/super-admin/tutors/${tutor.id}`} className="flex items-center gap-3 hover:underline">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={tutor.user.avatar || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {tutor.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{tutor.user.name}</p>
                            <p className="text-sm text-muted-foreground">{tutor.user.email}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {expertiseAreas.length === 0 ? (
                            <span className="text-xs text-muted-foreground">None listed</span>
                          ) : (
                            expertiseAreas.map((area) => (
                              <Badge key={area} variant="secondary" className="text-xs">
                                {area}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{tutor.courseCount}</TableCell>
                      <TableCell className="text-center">{tutor.totalStudents}</TableCell>
                      <TableCell className="text-right font-medium">GHS {tutor.totalEarnings.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            tutor.status === "active"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {tutor.status.charAt(0).toUpperCase() + tutor.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isPending && pendingId === tutor.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/super-admin/tutors/${tutor.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {tutor.status === "active" ? (
                              <DropdownMenuItem className="text-amber-600" onClick={() => handleSetStatus(tutor.id, "suspended")}>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-green-600" onClick={() => handleSetStatus(tutor.id, "active")}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
