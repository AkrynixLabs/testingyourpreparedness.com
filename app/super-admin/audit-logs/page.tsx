"use client"

import { useState } from "react"
import {
  Search,
  Download,
  Filter,
  Shield,
  User,
  School,
  FileQuestion,
  CreditCard,
  Settings,
  LogIn,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatCard } from "@/components/stat-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const auditLogs = [
  {
    id: "LOG-001",
    action: "login",
    category: "auth",
    user: "Dr. Kwaku Mensah",
    userRole: "Super Admin",
    description: "Successful login from 192.168.1.100",
    ipAddress: "192.168.1.100",
    timestamp: "Dec 15, 2025 14:32:05",
    status: "success",
    details: {
      browser: "Chrome 120",
      os: "Windows 11",
      location: "Accra, Ghana",
    },
  },
  {
    id: "LOG-002",
    action: "approve",
    category: "content",
    user: "Dr. Kwaku Mensah",
    userRole: "Super Admin",
    description: "Approved 15 questions from Ama Serwaa",
    ipAddress: "192.168.1.100",
    timestamp: "Dec 15, 2025 14:28:12",
    status: "success",
    details: {
      questionsApproved: 15,
      subject: "Mathematics",
      contentAdmin: "Ama Serwaa",
    },
  },
  {
    id: "LOG-003",
    action: "update",
    category: "school",
    user: "Dr. Kwaku Mensah",
    userRole: "Super Admin",
    description: "Updated subscription for Accra Academy to Professional",
    ipAddress: "192.168.1.100",
    timestamp: "Dec 15, 2025 13:45:30",
    status: "success",
    details: {
      school: "Accra Academy",
      previousPlan: "Starter",
      newPlan: "Professional",
    },
  },
  {
    id: "LOG-004",
    action: "create",
    category: "user",
    user: "Dr. Kwaku Mensah",
    userRole: "Super Admin",
    description: "Created new Content Admin: Efua Darko",
    ipAddress: "192.168.1.100",
    timestamp: "Dec 15, 2025 12:15:00",
    status: "success",
    details: {
      newUser: "Efua Darko",
      email: "efua.darko@typ.edu.gh",
      assignedSubjects: ["Creative Arts", "Career Technology"],
    },
  },
  {
    id: "LOG-005",
    action: "reject",
    category: "content",
    user: "Dr. Kwaku Mensah",
    userRole: "Super Admin",
    description: "Rejected 3 questions from Yaw Boateng",
    ipAddress: "192.168.1.100",
    timestamp: "Dec 15, 2025 11:30:45",
    status: "warning",
    details: {
      questionsRejected: 3,
      subject: "French",
      contentAdmin: "Yaw Boateng",
      reason: "Questions contain inaccuracies",
    },
  },
  {
    id: "LOG-006",
    action: "login_failed",
    category: "auth",
    user: "Unknown",
    userRole: "Unknown",
    description: "Failed login attempt for admin@typ.edu.gh",
    ipAddress: "45.67.89.123",
    timestamp: "Dec 15, 2025 10:22:18",
    status: "error",
    details: {
      attemptedEmail: "admin@typ.edu.gh",
      failureReason: "Invalid password",
      attemptCount: 3,
    },
  },
  {
    id: "LOG-007",
    action: "delete",
    category: "school",
    user: "Dr. Kwaku Mensah",
    userRole: "Super Admin",
    description: "Deactivated school: Test School Demo",
    ipAddress: "192.168.1.100",
    timestamp: "Dec 14, 2025 16:45:00",
    status: "warning",
    details: {
      school: "Test School Demo",
      reason: "Trial period expired",
      studentsAffected: 25,
    },
  },
  {
    id: "LOG-008",
    action: "export",
    category: "data",
    user: "Dr. Kwaku Mensah",
    userRole: "Super Admin",
    description: "Exported monthly revenue report",
    ipAddress: "192.168.1.100",
    timestamp: "Dec 14, 2025 15:30:00",
    status: "success",
    details: {
      reportType: "Revenue Report",
      format: "Excel",
      dateRange: "November 2025",
    },
  },
]

const categories = [
  { value: "all", label: "All Categories" },
  { value: "auth", label: "Authentication" },
  { value: "content", label: "Content" },
  { value: "school", label: "Schools" },
  { value: "user", label: "Users" },
  { value: "billing", label: "Billing" },
  { value: "data", label: "Data Export" },
  { value: "settings", label: "Settings" },
]

const actions = [
  { value: "all", label: "All Actions" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "export", label: "Export" },
]

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLog, setSelectedLog] = useState<typeof auditLogs[0] | null>(null)

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    return matchesSearch && matchesCategory && matchesAction && matchesStatus
  })

  const totalLogs = auditLogs.length
  const successLogs = auditLogs.filter((l) => l.status === "success").length
  const warningLogs = auditLogs.filter((l) => l.status === "warning").length
  const errorLogs = auditLogs.filter((l) => l.status === "error").length

  const getActionIcon = (action: string) => {
    switch (action) {
      case "login":
        return <LogIn className="h-4 w-4" />
      case "logout":
        return <LogOut className="h-4 w-4" />
      case "create":
        return <Plus className="h-4 w-4" />
      case "update":
        return <Edit className="h-4 w-4" />
      case "delete":
        return <Trash2 className="h-4 w-4" />
      case "approve":
        return <CheckCircle2 className="h-4 w-4" />
      case "reject":
        return <XCircle className="h-4 w-4" />
      case "export":
        return <Download className="h-4 w-4" />
      case "login_failed":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "auth":
        return <Shield className="h-4 w-4" />
      case "content":
        return <FileQuestion className="h-4 w-4" />
      case "school":
        return <School className="h-4 w-4" />
      case "user":
        return <User className="h-4 w-4" />
      case "billing":
        return <CreditCard className="h-4 w-4" />
      case "settings":
        return <Settings className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Success</Badge>
      case "warning":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Warning</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all system activities and administrative actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={totalLogs.toString()}
          changeLabel="Today"
          icon={Shield}
          change={12}
        />
        <StatCard
          title="Successful"
          value={successLogs.toString()}
          changeLabel="Events completed"
          icon={CheckCircle2}
          change={8}
        />
        <StatCard
          title="Warnings"
          value={warningLogs.toString()}
          changeLabel="Needs review"
          icon={AlertTriangle}
          change={0}
        />
        <StatCard
          title="Errors"
          value={errorLogs.toString()}
          changeLabel="Failed events"
          icon={XCircle}
          change={-1}
        />
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">{log.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        {getActionIcon(log.action)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{log.action.replace("_", " ")}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getCategoryIcon(log.category)}
                          <span className="capitalize">{log.category}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {log.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{log.user}</p>
                        <p className="text-xs text-muted-foreground">{log.userRole}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="truncate text-sm">{log.description}</p>
                    <p className="text-xs text-muted-foreground">{log.ipAddress}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Event Details
              {selectedLog && getStatusBadge(selectedLog.status)}
            </DialogTitle>
            <DialogDescription>{selectedLog?.id}</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Action</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getActionIcon(selectedLog.action)}
                    <span className="font-medium capitalize">
                      {selectedLog.action.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryIcon(selectedLog.category)}
                    <span className="font-medium capitalize">{selectedLog.category}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{selectedLog.user}</p>
                  <p className="text-xs text-muted-foreground">{selectedLog.userRole}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedLog.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Timestamp</p>
                <p className="font-medium">{selectedLog.timestamp}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Additional Details</p>
                <div className="bg-muted rounded-lg p-3">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
