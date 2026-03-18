"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { subjects, topics } from "@/lib/demo-data"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus, BookOpen, Edit, Trash2 } from "lucide-react"

export default function SubjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [topicDialogOpen, setTopicDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects & Topics</h1>
          <p className="text-muted-foreground">
            Manage BECE subjects and their associated topics
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Create a new subject for the BECE curriculum
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setDialogOpen(false) }}>
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input id="subjectName" placeholder="e.g., French Language" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code</Label>
                <Input id="subjectCode" placeholder="e.g., FRE" maxLength={3} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Subject</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subject cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {subjects.map((subject) => (
          <Card key={subject.id} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">{subject.code}</span>
                </div>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold mb-1">{subject.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{subject.questionCount} questions</span>
                <span>{subject.topicCount} topics</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Topics accordion */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Topics by Subject</CardTitle>
            <CardDescription>
              Expand to view and manage topics for each subject
            </CardDescription>
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
                <DialogDescription>
                  Add a topic to a subject
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setTopicDialogOpen(false) }}>
                <div className="space-y-2">
                  <Label htmlFor="topicSubject">Subject</Label>
                  <select id="topicSubject" className="w-full p-2 border rounded-lg">
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topicName">Topic Name</Label>
                  <Input id="topicName" placeholder="e.g., Quadratic Equations" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setTopicDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Topic</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {subjects.map((subject) => (
              <AccordionItem key={subject.id} value={subject.code}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{subject.name}</span>
                    <Badge variant="secondary">{subject.topicCount} topics</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-11 space-y-2">
                    {topics[subject.id as keyof typeof topics]?.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 group"
                      >
                        <span className="text-sm">{topic}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
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
    </div>
  )
}
