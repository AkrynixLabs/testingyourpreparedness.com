"use client"

import { useState } from "react"
import { 
  BookOpen, 
  FileText, 
  Video, 
  Download, 
  Search, 
  Filter,
  Clock,
  Eye,
  Star,
  ChevronRight,
  Play,
  File,
  Image as ImageIcon,
  Bookmark,
  BookmarkCheck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

// Demo data for study materials
const studyMaterials = [
  {
    id: "1",
    title: "Mathematics - Algebraic Expressions Complete Guide",
    subject: "Mathematics",
    type: "document",
    format: "PDF",
    size: "2.4 MB",
    duration: null,
    views: 1245,
    rating: 4.8,
    isBookmarked: true,
    lastUpdated: "2026-03-10",
    description: "Comprehensive guide covering all algebraic expressions topics for BECE preparation.",
    topics: ["Algebra", "Expressions", "Equations"]
  },
  {
    id: "2",
    title: "English Language - Essay Writing Techniques",
    subject: "English Language",
    type: "video",
    format: "MP4",
    size: null,
    duration: "45 mins",
    views: 892,
    rating: 4.9,
    isBookmarked: false,
    lastUpdated: "2026-03-08",
    description: "Learn professional essay writing techniques to score high marks in your BECE English exam.",
    topics: ["Essay Writing", "Grammar", "Comprehension"]
  },
  {
    id: "3",
    title: "Integrated Science - Human Body Systems",
    subject: "Integrated Science",
    type: "document",
    format: "PDF",
    size: "5.1 MB",
    duration: null,
    views: 756,
    rating: 4.7,
    isBookmarked: true,
    lastUpdated: "2026-03-05",
    description: "Detailed notes on all human body systems with diagrams and practice questions.",
    topics: ["Human Body", "Digestive System", "Circulatory System"]
  },
  {
    id: "4",
    title: "Social Studies - Ghana's Independence History",
    subject: "Social Studies",
    type: "video",
    format: "MP4",
    size: null,
    duration: "32 mins",
    views: 1102,
    rating: 4.6,
    isBookmarked: false,
    lastUpdated: "2026-03-01",
    description: "Documentary-style video covering Ghana's journey to independence and key historical figures.",
    topics: ["Ghana History", "Independence", "Nationalism"]
  },
  {
    id: "5",
    title: "French - Common Vocabulary and Phrases",
    subject: "French",
    type: "document",
    format: "PDF",
    size: "1.8 MB",
    duration: null,
    views: 634,
    rating: 4.5,
    isBookmarked: false,
    lastUpdated: "2026-02-28",
    description: "Essential French vocabulary and phrases commonly tested in BECE examinations.",
    topics: ["Vocabulary", "Phrases", "Grammar"]
  },
  {
    id: "6",
    title: "ICT - Computer Hardware Fundamentals",
    subject: "ICT",
    type: "video",
    format: "MP4",
    size: null,
    duration: "28 mins",
    views: 543,
    rating: 4.8,
    isBookmarked: true,
    lastUpdated: "2026-02-25",
    description: "Visual guide to computer hardware components and their functions.",
    topics: ["Hardware", "Components", "Input/Output"]
  },
  {
    id: "7",
    title: "Mathematics - Geometry and Mensuration",
    subject: "Mathematics",
    type: "document",
    format: "PDF",
    size: "3.2 MB",
    duration: null,
    views: 987,
    rating: 4.7,
    isBookmarked: false,
    lastUpdated: "2026-02-20",
    description: "Complete geometry notes with formulas, worked examples, and practice problems.",
    topics: ["Geometry", "Mensuration", "Area", "Volume"]
  },
  {
    id: "8",
    title: "English Language - Comprehension Strategies",
    subject: "English Language",
    type: "video",
    format: "MP4",
    size: null,
    duration: "38 mins",
    views: 821,
    rating: 4.9,
    isBookmarked: false,
    lastUpdated: "2026-02-18",
    description: "Proven strategies for answering comprehension questions effectively.",
    topics: ["Comprehension", "Reading Skills", "Answering Techniques"]
  }
]

const subjects = [
  "All Subjects",
  "Mathematics",
  "English Language",
  "Integrated Science",
  "Social Studies",
  "French",
  "ICT",
  "Ghanaian Language",
  "RME"
]

const recentlyViewed = [
  { id: "1", title: "Mathematics - Algebraic Expressions", progress: 75 },
  { id: "3", title: "Integrated Science - Human Body Systems", progress: 45 },
  { id: "6", title: "ICT - Computer Hardware Fundamentals", progress: 100 }
]

export default function StudentMaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("All Subjects")
  const [selectedType, setSelectedType] = useState("all")
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(
    studyMaterials.reduce((acc, m) => ({ ...acc, [m.id]: m.isBookmarked }), {})
  )

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredMaterials = studyMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSubject = selectedSubject === "All Subjects" || material.subject === selectedSubject
    const matchesType = selectedType === "all" || material.type === selectedType
    return matchesSearch && matchesSubject && matchesType
  })

  const bookmarkedMaterials = studyMaterials.filter(m => bookmarks[m.id])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />
      case "document": return <FileText className="h-4 w-4" />
      case "image": return <ImageIcon className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      "Mathematics": "bg-blue-100 text-blue-700",
      "English Language": "bg-purple-100 text-purple-700",
      "Integrated Science": "bg-green-100 text-green-700",
      "Social Studies": "bg-amber-100 text-amber-700",
      "French": "bg-rose-100 text-rose-700",
      "ICT": "bg-cyan-100 text-cyan-700",
      "Ghanaian Language": "bg-orange-100 text-orange-700",
      "RME": "bg-indigo-100 text-indigo-700"
    }
    return colors[subject] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Study Materials</h1>
        <p className="text-muted-foreground">Access notes, videos, and resources for all BECE subjects</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studyMaterials.length}</p>
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
                <p className="text-2xl font-bold">{studyMaterials.filter(m => m.type === "video").length}</p>
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
                <p className="text-2xl font-bold">{studyMaterials.filter(m => m.type === "document").length}</p>
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

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Materials List */}
        <div className="lg:col-span-3 space-y-4">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Materials</TabsTrigger>
                <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
              </TabsList>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
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
                filteredMaterials.map(material => (
                  <Card key={material.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Type Icon */}
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
                          material.type === "video" ? "bg-blue-100" : "bg-amber-100"
                        }`}>
                          {material.type === "video" ? (
                            <Play className={`h-6 w-6 ${material.type === "video" ? "text-blue-600" : "text-amber-600"}`} />
                          ) : (
                            <FileText className="h-6 w-6 text-amber-600" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-foreground truncate">{material.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{material.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => toggleBookmark(material.id)}
                            >
                              {bookmarks[material.id] ? (
                                <BookmarkCheck className="h-5 w-5 text-primary" />
                              ) : (
                                <Bookmark className="h-5 w-5" />
                              )}
                            </Button>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge variant="secondary" className={getSubjectColor(material.subject)}>
                              {material.subject}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {getTypeIcon(material.type)}
                              {material.format}
                              {material.size && ` • ${material.size}`}
                              {material.duration && ` • ${material.duration}`}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {material.views.toLocaleString()} views
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {material.rating}
                            </span>
                          </div>

                          {/* Topics */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {material.topics.map(topic => (
                              <Badge key={topic} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Action */}
                        <div className="hidden sm:flex items-center">
                          <Button variant="ghost" size="icon">
                            {material.type === "video" ? (
                              <Play className="h-5 w-5" />
                            ) : (
                              <Download className="h-5 w-5" />
                            )}
                          </Button>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
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
                bookmarkedMaterials.map(material => (
                  <Card key={material.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
                          material.type === "video" ? "bg-blue-100" : "bg-amber-100"
                        }`}>
                          {material.type === "video" ? (
                            <Play className="h-6 w-6 text-blue-600" />
                          ) : (
                            <FileText className="h-6 w-6 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-foreground truncate">{material.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{material.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => toggleBookmark(material.id)}
                            >
                              <BookmarkCheck className="h-5 w-5 text-primary" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <Badge variant="secondary" className={getSubjectColor(material.subject)}>
                              {material.subject}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {getTypeIcon(material.type)}
                              {material.format}
                              {material.size && ` • ${material.size}`}
                              {material.duration && ` • ${material.duration}`}
                            </span>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center">
                          <Button variant="ghost" size="icon">
                            {material.type === "video" ? (
                              <Play className="h-5 w-5" />
                            ) : (
                              <Download className="h-5 w-5" />
                            )}
                          </Button>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recently Viewed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recently Viewed</CardTitle>
              <CardDescription>Continue where you left off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentlyViewed.map(item => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate pr-2">{item.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Browse by Subject */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Browse by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {subjects.filter(s => s !== "All Subjects").map(subject => {
                  const count = studyMaterials.filter(m => m.subject === subject).length
                  return (
                    <Button
                      key={subject}
                      variant="ghost"
                      className="w-full justify-between h-auto py-2"
                      onClick={() => setSelectedSubject(subject)}
                    >
                      <span className="text-sm">{subject}</span>
                      <Badge variant="secondary" className="ml-2">{count}</Badge>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Study Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Study Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Break your study sessions into 25-minute focused blocks with 5-minute breaks. 
                This technique helps improve concentration and retention.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
