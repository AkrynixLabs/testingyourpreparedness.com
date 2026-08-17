"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, PlayCircle, FileText, Users, Wallet, Star } from "lucide-react"
import { addModule } from "../actions"
import { VideoLessonInput } from "@/components/video-lesson-input"
import { VirtualSessionsSection, type VirtualSessionRow } from "./virtual-sessions-section"
import type { LessonType } from "@/lib/generated/prisma/client"

type LessonDraft = {
  title: string
  type: LessonType
  videoUrl: string
  content: string
  videoSource?: "external" | "mux"
  muxUploadId?: string
}
function emptyLesson(): LessonDraft {
  return { title: "", type: "video", videoUrl: "", content: "" }
}

type CourseDetail = {
  id: string
  title: string
  description: string
  category: string
  price: number
  status: string
  modules: { id: string; title: string; lessons: { id: string; title: string; type: string }[] }[]
  enrollments: { id: string; studentName: string; enrolledAt: string }[]
  totalRevenue: number
  averageRating: number | null
  reviewCount: number
  virtualSessions: VirtualSessionRow[]
}

export function CourseDetailView({ course }: { course: CourseDetail }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [moduleTitle, setModuleTitle] = useState("")
  const [lessons, setLessons] = useState<LessonDraft[]>([emptyLesson()])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const updateLesson = (index: number, patch: Partial<LessonDraft>) => {
    setLessons((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }
  const addLesson = () => setLessons((prev) => [...prev, emptyLesson()])
  const removeLesson = (index: number) => setLessons((prev) => prev.filter((_, i) => i !== index))

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await addModule({ courseId: course.id, title: moduleTitle, lessons })
        setDialogOpen(false)
        setModuleTitle("")
        setLessons([emptyLesson()])
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add module.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <Badge variant={course.status === "published" ? "default" : course.status === "flagged" ? "destructive" : "secondary"}>
              {course.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {course.category} · GHS {course.price}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students Enrolled</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.enrollments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {course.totalRevenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course.averageRating !== null ? course.averageRating.toFixed(1) : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {course.reviewCount} review{course.reviewCount === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{course.description}</p>
        </CardContent>
      </Card>

      <VirtualSessionsSection courseId={course.id} sessions={course.virtualSessions} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Curriculum</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Module</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddModule} className="space-y-4">
                {error && (
                  <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
                )}
                <Input
                  placeholder="Module title *"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                />
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div key={index} className="rounded-lg border p-3 space-y-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={`Lesson ${index + 1} title *`}
                          required
                          value={lesson.title}
                          onChange={(e) => updateLesson(index, { title: e.target.value })}
                        />
                        <Select value={lesson.type} onValueChange={(value) => updateLesson(index, { type: value as LessonType })}>
                          <SelectTrigger className="w-28 shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="article">Article</SelectItem>
                          </SelectContent>
                        </Select>
                        {lessons.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeLesson(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      {lesson.type === "video" ? (
                        <VideoLessonInput
                          value={{ videoUrl: lesson.videoUrl, videoSource: lesson.videoSource, muxUploadId: lesson.muxUploadId }}
                          onChange={(v) => updateLesson(index, v)}
                        />
                      ) : (
                        <Textarea
                          placeholder="Article content *"
                          required
                          rows={2}
                          value={lesson.content}
                          onChange={(e) => updateLesson(index, { content: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addLesson}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Adding..." : "Add Module"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {course.modules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No modules yet.</p>
          ) : (
            course.modules.map((module, index) => (
              <div key={module.id} className="rounded-lg border p-4">
                <p className="font-medium mb-2">
                  Module {index + 1}: {module.title}
                </p>
                <div className="space-y-1 pl-4">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                      {lesson.type === "video" ? (
                        <PlayCircle className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      {lesson.title}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
        </CardHeader>
        <CardContent>
          {course.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No students enrolled yet.</p>
          ) : (
            <div className="space-y-2">
              {course.enrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span>{e.studentName}</span>
                  <span className="text-muted-foreground">{new Date(e.enrolledAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
