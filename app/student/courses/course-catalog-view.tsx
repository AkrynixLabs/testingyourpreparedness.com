"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, BookOpen, CheckCircle2, Star, ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 9

type CourseRow = {
  id: string
  title: string
  description: string
  programId: string | null
  programName: string | null
  price: number
  thumbnailUrl: string | null
  tutorName: string
  studentCount: number
  moduleCount: number
  isEnrolled: boolean
  reviewCount: number
  averageRating: number | null
}

type ProgramOption = { id: string; name: string }

export function CourseCatalogView({ courses, programs }: { courses: CourseRow[]; programs: ProgramOption[] }) {
  const [search, setSearch] = useState("")
  const [programId, setProgramId] = useState("all")
  const [page, setPage] = useState(1)

  const filtered = courses.filter((c) => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tutorName.toLowerCase().includes(search.toLowerCase())
    const matchesProgram = programId === "all" || c.programId === programId
    return matchesSearch && matchesProgram
  })

  const selectedProgramName = programs.find((p) => p.id === programId)?.name

  // Client-side pagination - the catalog query already returns every
  // published course in one shot (no page/limit params on either
  // platform yet), same reasoning as mobile's matching pagination pass
  // (2026-08-19, user-requested "apply the pagination bit to web too").
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses or tutors..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={programId}
          onValueChange={(value) => {
            setProgramId(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">
          {search
            ? "No courses match your search."
            : selectedProgramName
              ? `No ${selectedProgramName} courses yet. Check back soon.`
              : "No courses match your search."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((course) => (
            <Link key={course.id} href={`/student/courses/${course.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary">{course.programName ?? "Uncategorized"}</Badge>
                    {course.isEnrolled && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight mt-2">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  <p className="text-xs text-muted-foreground">by {course.tutorName}</p>
                  {course.averageRating !== null && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{course.averageRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({course.reviewCount} review{course.reviewCount === 1 ? "" : "s"})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {course.moduleCount} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.studentCount} students
                    </span>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {course.price === 0 ? "Free" : `GHS ${course.price}`}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
