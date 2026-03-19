"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
import {
  LayoutDashboard,
  FileQuestion,
  Upload,
  ClipboardList,
  PlusCircle,
  Settings,
  Clock,
} from "lucide-react"

const navigation: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/content-admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Questions",
    items: [
      { title: "My Questions", href: "/content-admin/questions", icon: FileQuestion, badge: "156" },
      { title: "Create Question", href: "/content-admin/questions/create", icon: PlusCircle },
      { title: "Bulk Upload", href: "/content-admin/questions/upload", icon: Upload },
      { title: "Pending Approval", href: "/content-admin/questions/pending", icon: Clock, badge: "8" },
    ],
  },
  {
    title: "Assessments",
    items: [
      { title: "All Assessments", href: "/content-admin/assessments", icon: ClipboardList },
      { title: "Create Assessment", href: "/content-admin/assessments/create", icon: PlusCircle },
    ],
  },
  {
    items: [
      { title: "Settings", href: "/content-admin/settings", icon: Settings },
    ],
  },
]

export default function ContentAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      navigation={navigation}
      userRole="Content Administrator"
      userName="Ama Boateng"
      userEmail="content@typ.edu.gh"
      settingsHref="/content-admin/settings"
    >
      {children}
    </DashboardShell>
  )
}
