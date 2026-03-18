"use client"

import { useState } from "react"
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileUp,
  Trash2,
  Eye,
  ArrowRight,
  HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type UploadStep = "upload" | "preview" | "processing" | "complete"

interface PreviewQuestion {
  row: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  subject: string
  topic: string
  difficulty: string
  status: "valid" | "warning" | "error"
  issues: string[]
}

const demoPreviewData: PreviewQuestion[] = [
  {
    row: 1,
    question: "What is the capital of Ghana?",
    optionA: "Kumasi",
    optionB: "Accra",
    optionC: "Tamale",
    optionD: "Cape Coast",
    correctAnswer: "B",
    subject: "Social Studies",
    topic: "Geography",
    difficulty: "Easy",
    status: "valid",
    issues: []
  },
  {
    row: 2,
    question: "Calculate: 15 + 27 = ?",
    optionA: "42",
    optionB: "40",
    optionC: "43",
    optionD: "41",
    correctAnswer: "A",
    subject: "Mathematics",
    topic: "Arithmetic",
    difficulty: "Easy",
    status: "valid",
    issues: []
  },
  {
    row: 3,
    question: "Which of these is a primary color?",
    optionA: "Green",
    optionB: "Orange",
    optionC: "Red",
    optionD: "Purple",
    correctAnswer: "C",
    subject: "Science",
    topic: "Physics",
    difficulty: "Easy",
    status: "warning",
    issues: ["Topic 'Physics' may not match subject 'Science'. Consider 'Basic Science'."]
  },
  {
    row: 4,
    question: "The largest planet in our solar system is",
    optionA: "Mars",
    optionB: "Saturn",
    optionC: "Jupiter",
    optionD: "",
    correctAnswer: "C",
    subject: "Science",
    topic: "Astronomy",
    difficulty: "Medium",
    status: "error",
    issues: ["Option D is empty. All options are required."]
  },
  {
    row: 5,
    question: "Who wrote the Ghana National Anthem?",
    optionA: "Kwame Nkrumah",
    optionB: "Philip Gbeho",
    optionC: "J.B. Danquah",
    optionD: "Kofi Annan",
    correctAnswer: "B",
    subject: "Social Studies",
    topic: "History",
    difficulty: "Medium",
    status: "valid",
    issues: []
  },
]

export default function BulkUploadPage() {
  const [step, setStep] = useState<UploadStep>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewQuestion[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [defaultSubject, setDefaultSubject] = useState("")

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handlePreview = () => {
    setPreviewData(demoPreviewData)
    setStep("preview")
  }

  const handleUpload = () => {
    setStep("processing")
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => setStep("complete"), 500)
      }
    }, 300)
  }

  const handleReset = () => {
    setStep("upload")
    setFile(null)
    setPreviewData([])
    setUploadProgress(0)
  }

  const validCount = previewData.filter(q => q.status === "valid").length
  const warningCount = previewData.filter(q => q.status === "warning").length
  const errorCount = previewData.filter(q => q.status === "error").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bulk Upload Questions</h1>
          <p className="text-muted-foreground">Import multiple questions at once using CSV or Excel files</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 py-4">
        {["Upload File", "Preview & Validate", "Processing", "Complete"].map((label, index) => {
          const steps: UploadStep[] = ["upload", "preview", "processing", "complete"]
          const currentIndex = steps.indexOf(step)
          const isActive = index === currentIndex
          const isComplete = index < currentIndex

          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${isActive ? "text-primary" : isComplete ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isComplete ? "bg-primary text-primary-foreground" : 
                  isActive ? "bg-primary text-primary-foreground" : 
                  "bg-muted text-muted-foreground"
                }`}>
                  {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{label}</span>
              </div>
              {index < 3 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
                <CardDescription>
                  Select a CSV or Excel file containing your questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : 
                    file ? "border-primary bg-primary/5" : 
                    "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                >
                  {file ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <FileSpreadsheet className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <FileUp className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Drop your file here</p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button asChild variant="outline">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Select File
                        </label>
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: CSV, XLSX, XLS (max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Default Subject */}
                {file && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Default Subject (optional)
                    </label>
                    <Select value={defaultSubject} onValueChange={setDefaultSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Apply to rows without subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="english">English Language</SelectItem>
                        <SelectItem value="science">Integrated Science</SelectItem>
                        <SelectItem value="social">Social Studies</SelectItem>
                        <SelectItem value="rme">RME</SelectItem>
                        <SelectItem value="ict">ICT</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="ghanaian">Ghanaian Language</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {file && (
                  <Button onClick={handlePreview} className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview & Validate
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">File Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Your file should include the following columns:
                </p>
                <ul className="space-y-2">
                  {[
                    { name: "question", required: true },
                    { name: "option_a", required: true },
                    { name: "option_b", required: true },
                    { name: "option_c", required: true },
                    { name: "option_d", required: true },
                    { name: "correct_answer", required: true },
                    { name: "subject", required: false },
                    { name: "topic", required: false },
                    { name: "difficulty", required: false },
                    { name: "explanation", required: false },
                  ].map((col) => (
                    <li key={col.name} className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {col.name}
                      </code>
                      {col.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Use A, B, C, or D for correct_answer column</p>
                <p>Difficulty should be: Easy, Medium, or Hard</p>
                <p>Leave optional fields blank if not applicable</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && (
        <div className="space-y-6">
          {/* Validation Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{previewData.length}</p>
                    <p className="text-sm text-muted-foreground">Total Rows</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{validCount}</p>
                    <p className="text-sm text-muted-foreground">Valid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{warningCount}</p>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                    <p className="text-sm text-muted-foreground">Errors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {errorCount > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors Found</AlertTitle>
              <AlertDescription>
                {errorCount} row(s) have errors that must be fixed before uploading. 
                You can still upload the valid rows.
              </AlertDescription>
            </Alert>
          )}

          {/* Preview Table */}
          <Card>
            <CardHeader>
              <CardTitle>Preview Data</CardTitle>
              <CardDescription>
                Review your questions before uploading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead className="w-16">Status</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead className="w-16">Answer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row) => (
                      <TableRow key={row.row} className={row.status === "error" ? "bg-red-50" : row.status === "warning" ? "bg-amber-50" : ""}>
                        <TableCell className="font-mono text-sm">{row.row}</TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {row.status === "valid" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                {row.status === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                                {row.status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                              </TooltipTrigger>
                              {row.issues.length > 0 && (
                                <TooltipContent>
                                  <ul className="text-xs space-y-1">
                                    {row.issues.map((issue, i) => (
                                      <li key={i}>{issue}</li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{row.question}</TableCell>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell>{row.topic}</TableCell>
                        <TableCell>
                          <Badge variant={
                            row.difficulty === "Easy" ? "secondary" :
                            row.difficulty === "Medium" ? "default" : "destructive"
                          }>
                            {row.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{row.correctAnswer}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("upload")}>
              Back to Upload
            </Button>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Upload Options
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Options</DialogTitle>
                    <DialogDescription>
                      Choose how to handle the upload
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      You have {validCount + warningCount} uploadable rows and {errorCount} rows with errors.
                    </p>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" onClick={handleUpload}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Upload valid rows only ({validCount})
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={handleUpload}>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Upload valid + warnings ({validCount + warningCount})
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handleUpload} disabled={validCount === 0}>
                Upload {validCount + warningCount} Questions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === "processing" && (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Uploading Questions...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait while we process your file
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === "complete" && (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upload Complete!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Successfully uploaded {validCount + warningCount} questions
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-left text-sm space-y-1">
              <p><span className="text-muted-foreground">Total processed:</span> {previewData.length}</p>
              <p><span className="text-muted-foreground">Successfully uploaded:</span> {validCount + warningCount}</p>
              <p><span className="text-muted-foreground">Skipped (errors):</span> {errorCount}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleReset}>
                Upload More
              </Button>
              <Button asChild>
                <a href="/content-admin/questions">View Question Bank</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
