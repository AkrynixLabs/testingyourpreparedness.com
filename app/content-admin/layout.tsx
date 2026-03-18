"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
import {
  LayoutDashboard,
  FileQuestion,
  Upload,
  ClipboardList,
  PlusCircle,
  CheckSquare,
  Settings,
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
      { title: "Question Bank", href: "/content-admin/questions", icon: FileQuestion, badge: "8.7K" },
      { title: "Create Question", href: "/content-admin/questions/create", icon: PlusCircle },
      { title: "Bulk Upload", href: "/content-admin/questions/upload", icon: Upload },
      { title: "Review Queue", href: "/content-admin/questions/review", icon: CheckSquare, badge: "12" },
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
    >
      {children}
    </DashboardShell>
  )
}
