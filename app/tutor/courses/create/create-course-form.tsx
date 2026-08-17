"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { createCourse } from "../actions"
import { VideoLessonInput } from "@/components/video-lesson-input"
import type { LessonType } from "@/lib/generated/prisma/client"

type LessonDraft = {
  title: string
  type: LessonType
  videoUrl: string
  content: string
  videoSource?: "external" | "mux"
  muxUploadId?: string
}
type ModuleDraft = { title: string; lessons: LessonDraft[] }

function emptyLesson(): LessonDraft {
  return { title: "", type: "video", videoUrl: "", content: "" }
}
function emptyModule(): ModuleDraft {
  return { title: "", lessons: [emptyLesson()] }
}

export function CreateCourseForm() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [modules, setModules] = useState<ModuleDraft[]>([emptyModule()])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const updateModule = (index: number, patch: Partial<ModuleDraft>) => {
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }
  const updateLesson = (moduleIndex: number, lessonIndex: number, patch: Partial<LessonDraft>) => {
    setModules((prev) =>
      prev.map((m, i) =>
        i === moduleIndex
          ? { ...m, lessons: m.lessons.map((l, j) => (j === lessonIndex ? { ...l, ...patch } : l)) }
          : m
      )
    )
  }
  const addModule = () => setModules((prev) => [...prev, emptyModule()])
  const removeModule = (index: number) => setModules((prev) => prev.filter((_, i) => i !== index))
  const addLesson = (moduleIndex: number) =>
    setModules((prev) =>
      prev.map((m, i) => (i === moduleIndex ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m))
    )
  const removeLesson = (moduleIndex: number, lessonIndex: number) =>
    setModules((prev) =>
      prev.map((m, i) =>
        i === moduleIndex ? { ...m, lessons: m.lessons.filter((_, j) => j !== lessonIndex) } : m
      )
    )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const { courseId } = await createCourse({
          title,
          description,
          category,
          price: Number(price),
          thumbnailUrl,
          modules,
        })
        router.push(`/tutor/courses/${courseId}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create course.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                required
                placeholder="e.g. Web Development"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (GHS) *</Label>
              <Input id="price" type="number" min={0} required value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
            <Input id="thumbnail" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Curriculum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="rounded-lg border p-4 space-y-4">
              <div className="flex items-start gap-2">
                <GripVertical className="h-5 w-5 mt-2 text-muted-foreground shrink-0" />
                <div className="flex-1 space-y-2">
                  <Label>Module {moduleIndex + 1} Title *</Label>
                  <Input
                    required
                    value={module.title}
                    onChange={(e) => updateModule(moduleIndex, { title: e.target.value })}
                  />
                </div>
                {modules.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeModule(moduleIndex)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-3 pl-7">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="rounded-lg border p-3 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        placeholder={`Lesson ${lessonIndex + 1} title *`}
                        required
                        value={lesson.title}
                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })}
                      />
                      <Select
                        value={lesson.type}
                        onValueChange={(value) => updateLesson(moduleIndex, lessonIndex, { type: value as LessonType })}
                      >
                        <SelectTrigger className="w-32 shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                        </SelectContent>
                      </Select>
                      {module.lessons.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeLesson(moduleIndex, lessonIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    {lesson.type === "video" ? (
                      <VideoLessonInput
                        value={{ videoUrl: lesson.videoUrl, videoSource: lesson.videoSource, muxUploadId: lesson.muxUploadId }}
                        onChange={(v) => updateLesson(moduleIndex, lessonIndex, v)}
                      />
                    ) : (
                      <Textarea
                        placeholder="Article content (markdown) *"
                        required
                        rows={3}
                        value={lesson.content}
                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, { content: e.target.value })}
                      />
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addLesson(moduleIndex)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addModule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending} size="lg">
        {isPending ? "Publishing..." : "Publish Course"}
      </Button>
    </form>
  )
}
