"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus, BookOpen, Trash2 } from "lucide-react"
import { createSubject, deleteSubject, createTopic, deleteTopic } from "./actions"
import type { Program, Subject, Topic } from "@/lib/generated/prisma/client"

type TopicWithCount = Topic & { _count: { questions: number } }
type SubjectWithRelations = Subject & {
  program: Program
  topics: TopicWithCount[]
  _count: { questions: number; topics: number }
}

export function SubjectsView({
  subjects,
  programs,
}: {
  subjects: SubjectWithRelations[]
  programs: Program[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false)
  const [subjectProgramId, setSubjectProgramId] = useState("")
  const [subjectName, setSubjectName] = useState("")
  const [subjectCode, setSubjectCode] = useState("")

  const [topicDialogOpen, setTopicDialogOpen] = useState(false)
  const [topicSubjectId, setTopicSubjectId] = useState(subjects[0]?.id ?? "")
  const [topicName, setTopicName] = useState("")

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await createSubject({ programId: subjectProgramId, name: subjectName, code: subjectCode })
        setSubjectDialogOpen(false)
        setSubjectProgramId("")
        setSubjectName("")
        setSubjectCode("")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create subject")
      }
    })
  }

  const handleDeleteSubject = (subjectId: string) => {
    setError(null)
    startTransition(async () => {
      try {
        await deleteSubject(subjectId)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete subject")
      }
    })
  }

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await createTopic({ subjectId: topicSubjectId, name: topicName })
        setTopicDialogOpen(false)
        setTopicName("")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create topic")
      }
    })
  }

  const handleDeleteTopic = (topicId: string) => {
    setError(null)
    startTransition(async () => {
      try {
        await deleteTopic(topicId)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete topic")
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

      <div className="flex justify-end">
        <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>Create a new subject under an exam program</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateSubject}>
              <div className="space-y-2">
                <Label htmlFor="subjectProgram">Program</Label>
                <Select value={subjectProgramId} onValueChange={setSubjectProgramId}>
                  <SelectTrigger id="subjectProgram">
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input
                  id="subjectName"
                  placeholder="e.g., French Language"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code</Label>
                <Input
                  id="subjectCode"
                  placeholder="e.g., FRE"
                  maxLength={4}
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setSubjectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !subjectProgramId}>
                  Add Subject
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((subject) => (
          <Card key={subject.id} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">{subject.code}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleDeleteSubject(subject.id)}
                  title={
                    subject._count.questions + subject._count.topics > 0
                      ? "Remove all topics/questions before deleting"
                      : "Delete subject"
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <h3 className="font-semibold mb-1">{subject.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{subject._count.questions} questions</span>
                <span>{subject._count.topics} topics</span>
              </div>
              <Badge variant="outline" className="mt-2">
                {subject.program.name}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Topics by Subject</CardTitle>
            <CardDescription>Expand to view and manage topics for each subject</CardDescription>
          </div>
          <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Topic</DialogTitle>
                <DialogDescription>Add a topic to a subject</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateTopic}>
                <div className="space-y-2">
                  <Label htmlFor="topicSubject">Subject</Label>
                  <Select value={topicSubjectId} onValueChange={setTopicSubjectId}>
                    <SelectTrigger id="topicSubject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topicName">Topic Name</Label>
                  <Input
                    id="topicName"
                    placeholder="e.g., Quadratic Equations"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setTopicDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending || !topicSubjectId}>
                    Add Topic
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {subjects.map((subject) => (
              <AccordionItem key={subject.id} value={subject.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{subject.name}</span>
                    <Badge variant="secondary">{subject.topics.length} topics</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-11 space-y-2">
                    {subject.topics.length === 0 && (
                      <p className="text-sm text-muted-foreground py-2">No topics yet.</p>
                    )}
                    {subject.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 group"
                      >
                        <span className="text-sm">
                          {topic.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({topic._count.questions} questions)
                          </span>
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            disabled={isPending}
                            onClick={() => handleDeleteTopic(topic.id)}
                            title={
                              topic._count.questions > 0
                                ? "Remove attached questions before deleting"
                                : "Delete topic"
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </>
  )
}
