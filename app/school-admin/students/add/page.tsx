"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { 
  ArrowLeft, 
  Upload, 
  UserPlus, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Trash2,
  X
} from "lucide-react"

// Demo parsed CSV data
const demoImportData = [
  { name: "Ama Serwaa", email: "ama.serwaa@student.edu.gh", class: "Form 3A", guardian: "Mrs. Serwaa", guardianPhone: "0244123456", status: "valid" },
  { name: "Kofi Mensah", email: "kofi.mensah@student.edu.gh", class: "Form 3A", guardian: "Mr. Mensah", guardianPhone: "0201234567", status: "valid" },
  { name: "Akua Boateng", email: "", class: "Form 3B", guardian: "Mrs. Boateng", guardianPhone: "0551234567", status: "error" },
  { name: "Yaw Asante", email: "yaw.asante@student.edu.gh", class: "Form 2A", guardian: "Mr. Asante", guardianPhone: "0271234567", status: "valid" },
  { name: "Efua Owusu", email: "efua.owusu@student.edu.gh", class: "Form 2B", guardian: "Mrs. Owusu", guardianPhone: "0541234567", status: "valid" },
]

export default function AddStudentsPage() {
  const [activeTab, setActiveTab] = useState("single")
  const [importData, setImportData] = useState<typeof demoImportData | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Single student form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    class: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelation: "",
    notes: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = () => {
    setIsUploading(true)
    // Simulate file processing
    setTimeout(() => {
      setImportData(demoImportData)
      setIsUploading(false)
    }, 1500)
  }

  const validCount = importData?.filter(s => s.status === "valid").length || 0
  const errorCount = importData?.filter(s => s.status === "error").length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/school-admin/students">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Students</h1>
          <p className="text-muted-foreground">
            Add students individually or import in bulk
          </p>
        </div>
      </div>

      {/* Tabs for Single vs Bulk */}
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

        {/* Single Student Form */}
        <TabsContent value="single" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Student Information */}
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
                <CardDescription>
                  Enter the student&apos;s personal details
                </CardDescription>
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="024 XXX XXXX"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class/Form *</Label>
                    <Select
                      value={formData.class}
                      onValueChange={(value) => handleInputChange("class", value)}
                    >
                      <SelectTrigger id="class">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="form-3a">Form 3A</SelectItem>
                        <SelectItem value="form-3b">Form 3B</SelectItem>
                        <SelectItem value="form-3c">Form 3C</SelectItem>
                        <SelectItem value="form-2a">Form 2A</SelectItem>
                        <SelectItem value="form-2b">Form 2B</SelectItem>
                        <SelectItem value="form-1a">Form 1A</SelectItem>
                        <SelectItem value="form-1b">Form 1B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
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

            {/* Guardian Information */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Guardian Information</CardTitle>
                <CardDescription>
                  Parent or guardian contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Full Name *</Label>
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
                  <Label htmlFor="guardianPhone">Phone Number *</Label>
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/school-admin/students">Cancel</Link>
            </Button>
            <Button variant="outline">
              Save & Add Another
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </TabsContent>

        {/* Bulk Import */}
        <TabsContent value="bulk" className="space-y-6">
          {!importData ? (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Import Students from CSV</CardTitle>
                <CardDescription>
                  Upload a CSV file with student information to add multiple students at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={handleFileUpload}
                >
                  {isUploading ? (
                    <div className="space-y-3">
                      <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium">Processing file...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          CSV files only (max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Download */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Download Template</p>
                    <p className="text-xs text-muted-foreground">
                      Use our CSV template to ensure correct formatting
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                {/* Format Instructions */}
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
                      <span className="text-muted-foreground">Guardian name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">guardian_phone</Badge>
                      <span className="text-muted-foreground">Guardian phone</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Import Summary */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{importData.length}</p>
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
                        <p className="text-2xl font-bold">{validCount}</p>
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

              {/* Preview Table */}
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Preview Import Data</CardTitle>
                      <CardDescription>
                        Review and fix any errors before importing
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setImportData(null)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel Import
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Guardian</TableHead>
                          <TableHead>Guardian Phone</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importData.map((student, index) => (
                          <TableRow key={index} className={student.status === "error" ? "bg-red-500/5" : ""}>
                            <TableCell>
                              {student.status === "valid" ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>
                              {student.email || (
                                <span className="text-red-500 text-sm">Missing email</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{student.class}</Badge>
                            </TableCell>
                            <TableCell>{student.guardian}</TableCell>
                            <TableCell>{student.guardianPhone}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Import Actions */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {errorCount > 0 && (
                    <span className="text-amber-600">
                      {errorCount} record(s) with errors will be skipped
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setImportData(null)}>
                    Cancel
                  </Button>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Import {validCount} Students
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
