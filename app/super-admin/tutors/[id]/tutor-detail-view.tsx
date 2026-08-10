"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, MoreHorizontal, ShieldOff, ShieldCheck, BookOpen, Users, Wallet, Mail } from "lucide-react"
import { setTutorStatus } from "../actions"
import type { TutorProfile, User } from "@/lib/generated/prisma/client"

type CourseRow = {
  id: string
  title: string
  category: string
  price: number
  status: string
  publishedAt: Date
  enrollmentCount: number
  revenue: number
  earnings: number
}

export function TutorDetailView({
  tutor,
  courses,
  stats,
}: {
  tutor: TutorProfile & { user: Omit<User, "passwordHash"> }
  courses: CourseRow[]
  stats: { totalCourses: number; totalStudents: number; totalEarnings: number; totalRevenue: number }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const expertiseAreas = (tutor.expertiseAreas as unknown as string[]) ?? []

  const handleSetStatus = (status: "active" | "suspended") => {
    setError(null)
    startTransition(async () => {
      try {
        await setTutorStatus(tutor.id, status)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update tutor status")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/super-admin/tutors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Avatar className="h-12 w-12">
            <AvatarImage src={tutor.user.avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {tutor.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{tutor.user.name}</h1>
              <Badge
                className={
                  tutor.status === "active"
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : "bg-red-100 text-red-700 hover:bg-red-100"
                }
              >
                {tutor.status.charAt(0).toUpperCase() + tutor.status.slice(1)}
              </Badge>
            </div>
            <p className="flex items-center gap-1 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> {tutor.user.email}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isPending}>
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {tutor.status === "active" ? (
              <DropdownMenuItem className="text-amber-600" onClick={() => handleSetStatus("suspended")}>
                <ShieldOff className="mr-2 h-4 w-4" />
                Suspend
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-green-600" onClick={() => handleSetStatus("active")}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Reactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {tutor.headline && <p className="text-muted-foreground">{tutor.headline}</p>}

      {expertiseAreas.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {expertiseAreas.map((area) => (
            <Badge key={area} variant="secondary">
              {area}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" /> Courses
            </div>
            <p className="text-2xl font-bold">{stats.totalCourses}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> Students
            </div>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">GHS {stats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" /> Tutor Earnings
            </div>
            <p className="text-2xl font-bold text-emerald-600">GHS {stats.totalEarnings.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {tutor.bio && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{tutor.bio}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Every course published by this tutor</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No courses published yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Students</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Link href={`/super-admin/courses/${course.id}`} className="hover:underline">
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          course.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : course.status === "flagged"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">GHS {course.price}</TableCell>
                    <TableCell className="text-center">{course.enrollmentCount}</TableCell>
                    <TableCell className="text-right font-medium">GHS {course.earnings.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
