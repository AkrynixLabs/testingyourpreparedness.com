"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { AuditLog, AuditAction, AuditCategory, AuditStatus, User as PrismaUser } from "@/lib/generated/prisma/client"

export type AuditLogRow = AuditLog & { actor: PrismaUser | null }

const categories: { value: AuditCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "auth", label: "Authentication" },
  { value: "content", label: "Content" },
  { value: "school", label: "Schools" },
  { value: "user", label: "Users" },
  { value: "billing", label: "Billing" },
  { value: "data", label: "Data Export" },
  { value: "settings", label: "Settings" },
]

const actionOptions: { value: AuditAction | "all"; label: string }[] = [
  { value: "all", label: "All Actions" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "export", label: "Export" },
  { value: "login_failed", label: "Login Failed" },
]

function roleLabel(role: string) {
  return role
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

function getActionIcon(action: AuditAction) {
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
      return <RefreshCw className="h-4 w-4" />
    case "login_failed":
      return <AlertTriangle className="h-4 w-4" />
    default:
      return <Eye className="h-4 w-4" />
  }
}

function getCategoryIcon(category: AuditCategory) {
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

function getStatusBadge(status: AuditStatus) {
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

export function AuditLogsTable({ logs }: { logs: AuditLogRow[] }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | "all">("all")
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all")
  const [statusFilter, setStatusFilter] = useState<AuditStatus | "all">("all")
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null)

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.actor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    return matchesSearch && matchesCategory && matchesAction && matchesStatus
  })

  return (
    <>
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
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as AuditCategory | "all")}>
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
              <Select value={actionFilter} onValueChange={(v) => setActionFilter(v as AuditAction | "all")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AuditStatus | "all")}>
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
              <Button variant="outline" onClick={() => router.refresh()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No events match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
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
                            {log.actor
                              ? log.actor.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{log.actor?.name ?? "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.actor ? roleLabel(log.actor.role) : "-"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-sm">{log.description}</p>
                      {log.ipAddress && (
                        <p className="text-xs text-muted-foreground">{log.ipAddress}</p>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {log.timestamp.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} events
      </p>

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
                  <p className="font-medium">{selectedLog.actor?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLog.actor ? roleLabel(selectedLog.actor.role) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-mono text-sm">{selectedLog.ipAddress ?? "-"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedLog.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Timestamp</p>
                <p className="font-medium">{selectedLog.timestamp.toLocaleString()}</p>
              </div>

              {selectedLog.details !== null && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Additional Details</p>
                  <div className="bg-muted rounded-lg p-3">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
