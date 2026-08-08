"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Trash2, PlusCircle } from "lucide-react"
import { deleteCourse } from "./actions"

type CourseRow = {
  id: string
  title: string
  category: string
  price: number
  status: string
  students: number
  modules: number
  publishedAt: string
}

export function CoursesTable({ courses }: { courses: CourseRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = (courseId: string) => {
    setError(null)
    startTransition(async () => {
      try {
        await deleteCourse(courseId)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete course.")
      }
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        )}
        {courses.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t created any courses yet.</p>
            <Button asChild>
              <Link href="/tutor/courses/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Course
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>GHS {course.price}</TableCell>
                  <TableCell>{course.modules}</TableCell>
                  <TableCell>{course.students}</TableCell>
                  <TableCell>
                    <Badge variant={course.status === "published" ? "default" : course.status === "flagged" ? "destructive" : "secondary"}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tutor/courses/${course.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        {course.students === 0 && (
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={isPending}
                            onClick={() => handleDelete(course.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
