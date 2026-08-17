"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, CheckCircle2, Loader2, XCircle } from "lucide-react"
import { requestMuxUploadUrl } from "@/app/tutor/courses/actions"

export type VideoLessonValue = {
  videoUrl: string
  videoSource?: "external" | "mux"
  muxUploadId?: string
}

// Lets a tutor either paste an external video link (the original model,
// still fully supported) or upload a real file, hosted through Mux - see
// prisma/schema.prisma's Lesson.videoSource comment and lib/video/mux.ts.
// The uploaded file goes straight from the browser to Mux (a direct PUT to
// the URL requestMuxUploadUrl() returns) - it never passes through our own
// server. There's no live progress percentage (a plain fetch PUT doesn't
// expose upload progress the way XMLHttpRequest does) - just an
// uploading/done/error state, which is enough for a course-authoring form.
export function VideoLessonInput({
  value,
  onChange,
}: {
  value: VideoLessonValue
  onChange: (value: VideoLessonValue) => void
}) {
  const [mode, setMode] = useState<"external" | "mux">(value.videoSource ?? "external")
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    value.muxUploadId ? "done" : "idle"
  )
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setStatus("uploading")
    setFileName(file.name)
    try {
      const { uploadId, uploadUrl } = await requestMuxUploadUrl()
      const response = await fetch(uploadUrl, { method: "PUT", body: file })
      if (!response.ok) throw new Error("Upload failed")
      setStatus("done")
      onChange({ videoUrl: "", videoSource: "mux", muxUploadId: uploadId })
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="space-y-2">
      <Tabs
        value={mode}
        onValueChange={(v) => {
          const next = v as "external" | "mux"
          setMode(next)
          onChange(next === "external" ? { videoUrl: value.videoUrl, videoSource: "external" } : { videoUrl: "" })
        }}
      >
        <TabsList className="h-8">
          <TabsTrigger value="external" className="text-xs px-2 py-1">
            Paste URL
          </TabsTrigger>
          <TabsTrigger value="mux" className="text-xs px-2 py-1">
            Upload Video
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "external" ? (
        <Input
          placeholder="Video URL (YouTube, Vimeo, etc.)"
          value={value.videoUrl}
          onChange={(e) => onChange({ videoUrl: e.target.value, videoSource: "external" })}
        />
      ) : (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="h-3.5 w-3.5 mr-2" />
              {status === "uploading" ? "Uploading..." : "Choose File"}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={status === "uploading"}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </label>
          </Button>
          {status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {status === "done" && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {fileName ?? "Uploaded"} - processing will finish shortly
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <XCircle className="h-3.5 w-3.5" />
              Upload failed - try again
            </span>
          )}
        </div>
      )}
    </div>
  )
}
