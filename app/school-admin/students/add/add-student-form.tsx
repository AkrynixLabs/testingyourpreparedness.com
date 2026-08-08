"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ArrowLeft,
  Upload,
  UserPlus,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
} from "lucide-react"
import { createStudent, bulkCreateStudents, type BulkStudentResult } from "./actions"
import { normalizeHeader, validateStudentRow, type ParsedStudentRow, type ValidatedStudentRow } from "./validation"
import type { Class, Gender, GuardianRelation } from "@/lib/generated/prisma/client"

const EMPTY_ROW: ParsedStudentRow = { name: "", email: "", class: "", guardian: "", guardian_phone: "" }

export function AddStudentForm({ classes }: { classes: Class[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("single")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/school-admin/students">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Students</h1>
          <p className="text-muted-foreground">Add students individually or import in bulk</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="single" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Single Student
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Bulk Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <SingleStudentTab classes={classes} onDone={() => router.push("/school-admin/students")} />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkImportTab classes={classes} onDone={() => router.push("/school-admin/students")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SingleStudentTab({ classes, onDone }: { classes: Class[]; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<{ email: string; tempPassword: string } | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    classId: "",
    dateOfBirth: "",
    gender: "" as "" | Gender,
    address: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelation: "guardian" as GuardianRelation,
    notes: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      classId: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      guardianName: "",
      guardianPhone: "",
      guardianEmail: "",
      guardianRelation: "guardian",
      notes: "",
    })
  }

  const handleSubmit = (andAddAnother: boolean) => {
    setError(null)
    setCredentials(null)
    const name = `${formData.firstName} ${formData.lastName}`.trim()

    startTransition(async () => {
      try {
        const result = await createStudent({
          name,
          email: formData.email,
          classId: formData.classId,
          dateOfBirth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          address: formData.address || null,
          notes: formData.notes || null,
          guardianName: formData.guardianName,
          guardianPhone: formData.guardianPhone,
          guardianEmail: formData.guardianEmail,
          guardianRelation: formData.guardianRelation,
        })
        setCredentials({ email: formData.email.trim().toLowerCase(), tempPassword: result.tempPassword })
        resetForm()
        if (!andAddAnother) {
          onDone()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add student.")
      }
    })
  }

  return (
    <>
      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {credentials && (
        <Alert>
          <KeyRound className="h-4 w-4" />
          <AlertTitle>Student added</AlertTitle>
          <AlertDescription>
            There&apos;s no email delivery set up yet, so share these sign-in details with the student directly:{" "}
            <strong>{credentials.email}</strong> / <strong>{credentials.tempPassword}</strong>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Enter the student&apos;s personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@school.edu.gh"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class/Form *</Label>
                <Select value={formData.classId} onValueChange={(value) => handleInputChange("classId", value)}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Home Address</Label>
              <Textarea
                id="address"
                placeholder="Enter home address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Guardian Information</CardTitle>
            <CardDescription>Parent or guardian contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guardianName">Full Name</Label>
              <Input
                id="guardianName"
                placeholder="Guardian's full name"
                value={formData.guardianName}
                onChange={(e) => handleInputChange("guardianName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianRelation">Relationship</Label>
              <Select
                value={formData.guardianRelation}
                onValueChange={(value) => handleInputChange("guardianRelation", value)}
              >
                <SelectTrigger id="guardianRelation">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianPhone">Phone Number</Label>
              <Input
                id="guardianPhone"
                placeholder="024 XXX XXXX"
                value={formData.guardianPhone}
                onChange={(e) => handleInputChange("guardianPhone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianEmail">Email Address</Label>
              <Input
                id="guardianEmail"
                type="email"
                placeholder="guardian@email.com"
                value={formData.guardianEmail}
                onChange={(e) => handleInputChange("guardianEmail", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special requirements or notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" asChild>
          <Link href="/school-admin/students">Cancel</Link>
        </Button>
        <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isPending}>
          Save & Add Another
        </Button>
        <Button onClick={() => handleSubmit(false)} disabled={isPending}>
          <UserPlus className="mr-2 h-4 w-4" />
          {isPending ? "Adding..." : "Add Student"}
        </Button>
      </div>
    </>
  )
}

function BulkImportTab({ classes, onDone }: { classes: Class[]; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [defaultClassId, setDefaultClassId] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [validatedRows, setValidatedRows] = useState<ValidatedStudentRow[] | null>(null)
  const [result, setResult] = useState<BulkStudentResult | null>(null)

  const handleFileUpload = (file: File | undefined) => {
    if (!file) return
    setParseError(null)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setParseError("The file has no data rows.")
          return
        }
        const classOptions = classes.map((c) => ({ id: c.id, displayName: c.displayName }))
        const parsedRows: ParsedStudentRow[] = results.data.map((record) => {
          const normalized: Record<string, string> = {}
          for (const [key, value] of Object.entries(record)) {
            normalized[normalizeHeader(key)] = String(value ?? "").trim()
          }
          return { ...EMPTY_ROW, ...normalized }
        })
        setValidatedRows(
          parsedRows.map((parsed, i) => validateStudentRow(i + 1, parsed, classOptions, defaultClassId || null))
        )
      },
      error: (err) => setParseError(`Failed to parse CSV: ${err.message}`),
    })
  }

  const validCount = validatedRows?.filter((r) => r.status === "valid").length ?? 0
  const warningCount = validatedRows?.filter((r) => r.status === "warning").length ?? 0
  const errorCount = validatedRows?.filter((r) => r.status === "error").length ?? 0

  const handleImport = () => {
    if (!validatedRows) return
    const toImport = validatedRows.filter((r) => r.status !== "error")
    startTransition(async () => {
      try {
        const res = await bulkCreateStudents(
          toImport.map((r) => ({ row: r.row, parsed: r.parsed })),
          defaultClassId || null
        )
        setResult(res)
        setValidatedRows(null)
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Import failed.")
      }
    })
  }

  if (result) {
    return (
      <div className="space-y-6">
        <Alert>
          <KeyRound className="h-4 w-4" />
          <AlertTitle>Import complete</AlertTitle>
          <AlertDescription>
            {result.created.length} student{result.created.length !== 1 ? "s" : ""} added,{" "}
            {result.skipped.length} skipped. There&apos;s no email delivery set up yet - share each temporary
            password with the corresponding student directly.
          </AlertDescription>
        </Alert>

        {result.created.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>New Sign-In Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Temporary Password</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.created.map((s) => (
                    <TableRow key={s.email}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell className="font-mono">{s.tempPassword}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {result.skipped.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Skipped Rows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {result.skipped.map((s) => (
                <p key={s.row}>
                  Row {s.row}: {s.issues.join(" ")}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setResult(null)}>
            Import More
          </Button>
          <Button onClick={onDone}>Done</Button>
        </div>
      </div>
    )
  }

  if (!validatedRows) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Import Students from CSV</CardTitle>
          <CardDescription>Upload a CSV file with student information to add multiple students at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Default Class (optional)</Label>
            <Select value={defaultClassId} onValueChange={setDefaultClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Apply to rows without a class column" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label
            htmlFor="csv-upload"
            className="block border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">CSV files only (max 5MB)</p>
              </div>
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
            />
          </label>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Required Columns:</h4>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">name</Badge>
                <span className="text-muted-foreground">Student full name</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">email</Badge>
                <span className="text-muted-foreground">Student email</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">class</Badge>
                <span className="text-muted-foreground">Class/Form (e.g., Form 3A)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">guardian</Badge>
                <span className="text-muted-foreground">Guardian name (optional)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">guardian_phone</Badge>
                <span className="text-muted-foreground">Guardian phone (optional)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{validatedRows.length}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{validCount + warningCount}</p>
                <p className="text-sm text-muted-foreground">Ready to Import</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errorCount}</p>
                <p className="text-sm text-muted-foreground">With Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preview Import Data</CardTitle>
              <CardDescription>Review and fix any errors before importing</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setValidatedRows(null)}>
              <X className="mr-2 h-4 w-4" />
              Cancel Import
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Guardian Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validatedRows.map((r) => (
                  <TableRow key={r.row} className={r.status === "error" ? "bg-red-500/5" : ""}>
                    <TableCell>
                      {r.status === "valid" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : r.status === "warning" ? (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{r.parsed.name}</TableCell>
                    <TableCell>{r.parsed.email || <span className="text-red-500 text-sm">Missing email</span>}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.resolvedClassName ?? r.parsed.class ?? "-"}</Badge>
                    </TableCell>
                    <TableCell>{r.parsed.guardian}</TableCell>
                    <TableCell>{r.parsed.guardian_phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {errorCount > 0 && <span className="text-amber-600">{errorCount} record(s) with errors will be skipped</span>}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setValidatedRows(null)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isPending || validCount + warningCount === 0}>
            <UserPlus className="mr-2 h-4 w-4" />
            {isPending ? "Importing..." : `Import ${validCount + warningCount} Students`}
          </Button>
        </div>
      </div>
    </div>
  )
}
