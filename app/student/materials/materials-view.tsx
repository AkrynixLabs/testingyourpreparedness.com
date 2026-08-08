"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Search,
  Filter,
  Eye,
  Star,
  ChevronRight,
  Play,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toggleBookmark } from "./actions"
import type { MaterialFormat, MaterialType } from "@/lib/generated/prisma/client"

type MaterialRow = {
  id: string
  title: string
  subject: string
  type: MaterialType
  format: MaterialFormat
  size: number | null
  duration: number | null
  views: number
  rating: number | null
  description: string | null
  topics: string[]
  isBookmarked: boolean
}

const subjectColors: Record<string, string> = {
  Mathematics: "bg-blue-100 text-blue-700",
  "English Language": "bg-purple-100 text-purple-700",
  "Integrated Science": "bg-green-100 text-green-700",
  "Social Studies": "bg-amber-100 text-amber-700",
  French: "bg-rose-100 text-rose-700",
  ICT: "bg-cyan-100 text-cyan-700",
  "Ghanaian Language": "bg-orange-100 text-orange-700",
  RME: "bg-indigo-100 text-indigo-700",
}

function formatSize(bytes: number | null) {
  if (!bytes) return null
  return `${(bytes / 1_000_000).toFixed(1)} MB`
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  return `${Math.round(seconds / 60)} mins`
}

export function StudentMaterialsView({ materials }: { materials: MaterialRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("All Subjects")
  const [selectedType, setSelectedType] = useState("all")
  const [pendingBookmark, setPendingBookmark] = useState<string | null>(null)

  const subjects = useMemo(() => ["All Subjects", ...Array.from(new Set(materials.map((m) => m.subject))).sort()], [materials])

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSubject = selectedSubject === "All Subjects" || material.subject === selectedSubject
    const matchesType = selectedType === "all" || material.type === selectedType
    return matchesSearch && matchesSubject && matchesType
  })

  const bookmarkedMaterials = materials.filter((m) => m.isBookmarked)

  const handleToggleBookmark = (id: string) => {
    setPendingBookmark(id)
    startTransition(async () => {
      await toggleBookmark(id)
      router.refresh()
      setPendingBookmark(null)
    })
  }

  const getTypeIcon = (type: MaterialType) => (type === "video" ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />)
  const getSubjectColor = (subject: string) => subjectColors[subject] || "bg-muted text-muted-foreground"

  const renderCard = (material: MaterialRow) => (
    <Card key={material.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${material.type === "video" ? "bg-blue-100" : "bg-amber-100"}`}>
            {material.type === "video" ? <Play className="h-6 w-6 text-blue-600" /> : <FileText className="h-6 w-6 text-amber-600" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">{material.title}</h3>
                {material.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{material.description}</p>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => handleToggleBookmark(material.id)}
                disabled={pendingBookmark === material.id}
              >
                {material.isBookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge variant="secondary" className={getSubjectColor(material.subject)}>
                {material.subject}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {getTypeIcon(material.type)}
                {material.format}
                {formatSize(material.size) && ` • ${formatSize(material.size)}`}
                {formatDuration(material.duration) && ` • ${formatDuration(material.duration)}`}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {material.views.toLocaleString()} views
              </span>
              {material.rating !== null && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {material.rating}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {material.topics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center">
            <Button variant="ghost" size="icon" disabled title="File delivery isn't wired up yet">
              {material.type === "video" ? <Play className="h-5 w-5" /> : <Download className="h-5 w-5" />}
            </Button>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Study Materials</h1>
        <p className="text-muted-foreground">Access notes, videos, and resources for all BECE subjects</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{materials.length}</p>
                <p className="text-sm text-muted-foreground">Total Materials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{materials.filter((m) => m.type === "video").length}</p>
                <p className="text-sm text-muted-foreground">Video Lessons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{materials.filter((m) => m.type === "document").length}</p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Bookmark className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookmarkedMaterials.length}</p>
                <p className="text-sm text-muted-foreground">Bookmarked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Materials</TabsTrigger>
                <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search materials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[120px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="mt-4 space-y-3">
              {filteredMaterials.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium text-lg">No materials found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredMaterials.map(renderCard)
              )}
            </TabsContent>

            <TabsContent value="bookmarked" className="mt-4 space-y-3">
              {bookmarkedMaterials.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium text-lg">No bookmarked materials</h3>
                    <p className="text-muted-foreground">Save materials for quick access later</p>
                  </CardContent>
                </Card>
              ) : (
                bookmarkedMaterials.map(renderCard)
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Browse by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {subjects
                  .filter((s) => s !== "All Subjects")
                  .map((subject) => {
                    const count = materials.filter((m) => m.subject === subject).length
                    return (
                      <Button key={subject} variant="ghost" className="w-full justify-between h-auto py-2" onClick={() => setSelectedSubject(subject)}>
                        <span className="text-sm">{subject}</span>
                        <Badge variant="secondary" className="ml-2">
                          {count}
                        </Badge>
                      </Button>
                    )
                  })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Study Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Break your study sessions into 25-minute focused blocks with 5-minute breaks. This technique helps improve
                concentration and retention.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
