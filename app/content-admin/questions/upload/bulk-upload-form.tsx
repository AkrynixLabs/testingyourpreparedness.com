"use client"

import { useState } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
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
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { normalizeHeader, validateRow, type ParsedRow, type ValidatedRow } from "./validation"
import { bulkCreateQuestions, type BulkUploadResult } from "./actions"
import type { Subject, Topic } from "@/lib/generated/prisma/client"

type UploadStep = "upload" | "preview" | "processing" | "complete"

type SubjectWithTopics = Subject & { topics: Topic[] }

const EMPTY_ROW: ParsedRow = {
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "",
  subject: "",
  topic: "",
  difficulty: "",
  explanation: "",
}

function rowsFromRecords(records: Record<string, string>[]): ParsedRow[] {
  return records.map((record) => {
    const normalized: Record<string, string> = {}
    for (const [key, value] of Object.entries(record)) {
      normalized[normalizeHeader(key)] = String(value ?? "").trim()
    }
    return { ...EMPTY_ROW, ...normalized }
  })
}

function downloadTemplate() {
  const headers = [
    "question",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_answer",
    "subject",
    "topic",
    "difficulty",
    "explanation",
  ]
  const example = [
    "What is the capital of Ghana?",
    "Kumasi",
    "Accra",
    "Tamale",
    "Cape Coast",
    "B",
    "Social Studies",
    "Geography",
    "Easy",
    "Accra has been the capital since independence.",
  ]
  const csv = [headers.join(","), example.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "question-upload-template.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export function BulkUploadForm({ subjects }: { subjects: SubjectWithTopics[] }) {
  const [step, setStep] = useState<UploadStep>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [defaultSubjectId, setDefaultSubjectId] = useState<string>("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)

  const acceptFile = (candidate: File | undefined) => {
    if (!candidate) return
    const name = candidate.name.toLowerCase()
    if (name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls")) {
      setFile(candidate)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    acceptFile(e.dataTransfer.files[0])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0])
  }

  const runValidation = (parsedRows: ParsedRow[]) => {
    const subjectsForValidation = subjects.map((s) => ({
      id: s.id,
      name: s.name,
      topics: s.topics.map((t) => ({ id: t.id, name: t.name })),
    }))
    const results = parsedRows.map((parsed, i) =>
      validateRow(i + 1, parsed, subjectsForValidation, defaultSubjectId || null)
    )
    setValidatedRows(results)
    setStep("preview")
  }

  const handlePreview = () => {
    if (!file) return
    setParseError(null)
    const name = file.name.toLowerCase()

    if (name.endsWith(".csv")) {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            setParseError("The file has no data rows.")
            return
          }
          runValidation(rowsFromRecords(results.data))
        },
        error: (err) => setParseError(`Failed to parse CSV: ${err.message}`),
      })
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const records = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" })
          if (records.length === 0) {
            setParseError("The file has no data rows.")
            return
          }
          runValidation(rowsFromRecords(records))
        } catch {
          setParseError("Failed to parse the spreadsheet. Make sure it's a valid .xlsx/.xls file.")
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const validCount = validatedRows.filter((r) => r.status === "valid").length
  const warningCount = validatedRows.filter((r) => r.status === "warning").length
  const errorCount = validatedRows.filter((r) => r.status === "error").length

  const handleUpload = (includeWarnings: boolean) => {
    const toUpload = validatedRows.filter((r) => r.status === "valid" || (includeWarnings && r.status === "warning"))
    if (toUpload.length === 0) return

    setStep("processing")
    setIsUploading(true)
    setUploadProgress(10)
    const interval = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 10 : p))
    }, 250)

    bulkCreateQuestions(
      toUpload.map((r) => ({ row: r.row, parsed: r.parsed })),
      defaultSubjectId || null
    )
      .then((result) => {
        clearInterval(interval)
        setUploadProgress(100)
        setUploadResult(result)
        setIsUploading(false)
        setTimeout(() => setStep("complete"), 400)
      })
      .catch((err) => {
        clearInterval(interval)
        setIsUploading(false)
        setParseError(err instanceof Error ? err.message : "Upload failed.")
        setStep("preview")
      })
  }

  const handleReset = () => {
    setStep("upload")
    setFile(null)
    setValidatedRows([])
    setUploadProgress(0)
    setUploadResult(null)
    setParseError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bulk Upload Questions</h1>
          <p className="text-muted-foreground">Import multiple questions at once using CSV or Excel files</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={downloadTemplate}>
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 py-4">
        {["Upload File", "Preview & Validate", "Processing", "Complete"].map((label, index) => {
          const steps: UploadStep[] = ["upload", "preview", "processing", "complete"]
          const currentIndex = steps.indexOf(step)
          const isActive = index === currentIndex
          const isComplete = index < currentIndex

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 ${
                  isActive ? "text-primary" : isComplete ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{label}</span>
              </div>
              {index < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />}
            </div>
          )
        })}
      </div>

      {parseError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      {step === "upload" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
                <CardDescription>Select a CSV or Excel file containing your questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : file
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                >
                  {file ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <FileSpreadsheet className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
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
                        <p className="text-sm text-muted-foreground">or click to browse</p>
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
                      <p className="text-xs text-muted-foreground">Supported formats: CSV, XLSX, XLS (max 5MB)</p>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Default Subject (optional)</label>
                    <Select value={defaultSubjectId} onValueChange={setDefaultSubjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Apply to rows without a subject column" />
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

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">File Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">Your file should include the following columns:</p>
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
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{col.name}</code>
                      {col.required && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
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
                <p>A topic that doesn&apos;t exist yet under its subject will be created automatically</p>
                <p>Leave optional fields blank if not applicable</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{validatedRows.length}</p>
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
                {errorCount} row(s) have errors that must be fixed before uploading. You can still upload the valid
                rows.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Preview Data</CardTitle>
              <CardDescription>Review your questions before uploading</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
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
                    {validatedRows.map((r) => (
                      <TableRow
                        key={r.row}
                        className={r.status === "error" ? "bg-red-50" : r.status === "warning" ? "bg-amber-50" : ""}
                      >
                        <TableCell className="font-mono text-sm">{r.row}</TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {r.status === "valid" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                {r.status === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                                {r.status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                              </TooltipTrigger>
                              {r.issues.length > 0 && (
                                <TooltipContent>
                                  <ul className="text-xs space-y-1">
                                    {r.issues.map((issue, i) => (
                                      <li key={i}>{issue}</li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{r.parsed.question}</TableCell>
                        <TableCell>{r.resolvedSubjectName ?? "-"}</TableCell>
                        <TableCell>{r.resolvedTopicName ?? "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.difficulty === "Easy" ? "secondary" : r.difficulty === "Medium" ? "default" : "destructive"
                            }
                          >
                            {r.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{r.parsed.correct_answer}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

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
                    <DialogDescription>Choose how to handle the upload</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      You have {validCount + warningCount} uploadable rows and {errorCount} rows with errors.
                    </p>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" onClick={() => handleUpload(false)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Upload valid rows only ({validCount})
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => handleUpload(true)}>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Upload valid + warnings ({validCount + warningCount})
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={() => handleUpload(true)} disabled={validCount + warningCount === 0 || isUploading}>
                Upload {validCount + warningCount} Questions
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "processing" && (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Uploading Questions...</h3>
              <p className="text-sm text-muted-foreground mt-1">Please wait while we process your file</p>
            </div>
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "complete" && uploadResult && (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upload Complete!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Successfully uploaded {uploadResult.created} question{uploadResult.created !== 1 ? "s" : ""} for review
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-left text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Successfully uploaded:</span> {uploadResult.created}
              </p>
              <p>
                <span className="text-muted-foreground">Skipped (errors):</span> {uploadResult.skipped}
              </p>
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
