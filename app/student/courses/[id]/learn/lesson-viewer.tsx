"use client"

import { useState } from "react"
import Link from "next/link"
import MuxPlayer from "@mux/mux-player-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, FileText, ArrowLeft, ExternalLink, Loader2 } from "lucide-react"

type Lesson = {
  id: string
  title: string
  type: string
  videoUrl: string | null
  content: string | null
  videoSource: string | null
  muxPlaybackId: string | null
  muxStatus: string | null
}
type Module = { id: string; title: string; lessons: Lesson[] }

export function LessonViewer({ course }: { course: { id: string; title: string; modules: Module[] } }) {
  const allLessons = course.modules.flatMap((m) => m.lessons)
  const [activeLessonId, setActiveLessonId] = useState(allLessons[0]?.id ?? null)
  const activeLesson = allLessons.find((l) => l.id === activeLessonId) ?? null

  return (
    <div className="space-y-4">
      <Link href={`/student/courses/${course.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>
      <h1 className="text-2xl font-bold">{course.title}</h1>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card className="min-h-[300px]">
          <CardContent className="p-6">
            {activeLesson ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{activeLesson.title}</h2>
                {activeLesson.type === "video" && activeLesson.videoSource === "mux" ? (
                  activeLesson.muxStatus === "ready" && activeLesson.muxPlaybackId ? (
                    <MuxPlayer
                      playbackId={activeLesson.muxPlaybackId}
                      streamType="on-demand"
                      metadata={{ video_title: activeLesson.title }}
                      style={{ width: "100%", aspectRatio: "16/9", borderRadius: "0.5rem" }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Video is still processing - check back in a few minutes.
                    </div>
                  )
                ) : activeLesson.type === "video" && activeLesson.videoUrl ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      This lesson's video is hosted externally.
                    </p>
                    <Button asChild>
                      <a href={activeLesson.videoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Watch Video
                      </a>
                    </Button>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{activeLesson.content}</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">This course has no lessons yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            {course.modules.map((module, index) => (
              <div key={module.id}>
                <p className="text-sm font-medium mb-2">
                  Module {index + 1}: {module.title}
                </p>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`flex items-center gap-2 w-full text-left text-sm rounded-md px-2 py-1.5 transition-colors ${
                        activeLessonId === lesson.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                      }`}
                    >
                      {lesson.type === "video" ? <PlayCircle className="h-4 w-4 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}
                      {lesson.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
