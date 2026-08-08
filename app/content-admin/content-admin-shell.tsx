"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
import { formatCount } from "@/lib/utils"
import {
  LayoutDashboard,
  FileQuestion,
  Upload,
  ClipboardList,
  PlusCircle,
  Settings,
  Clock,
} from "lucide-react"

type ContentAdminNavCounts = {
  myQuestions: number
  pendingApproval: number
  allAssessments: number
}

function buildNavigation(counts: ContentAdminNavCounts): NavGroup[] {
  return [
    {
      items: [
        { title: "Dashboard", href: "/content-admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Questions",
      items: [
        { title: "My Questions", href: "/content-admin/questions", icon: FileQuestion, badge: formatCount(counts.myQuestions) },
        { title: "Create Question", href: "/content-admin/questions/create", icon: PlusCircle },
        { title: "Bulk Upload", href: "/content-admin/questions/upload", icon: Upload },
        { title: "Pending Approval", href: "/content-admin/questions/pending", icon: Clock, badge: formatCount(counts.pendingApproval) },
      ],
    },
    {
      title: "Assessments",
      items: [
        { title: "All Assessments", href: "/content-admin/assessments", icon: ClipboardList, badge: formatCount(counts.allAssessments) },
        { title: "Create Assessment", href: "/content-admin/assessments/create", icon: PlusCircle },
      ],
    },
    {
      items: [
        { title: "Settings", href: "/content-admin/settings", icon: Settings },
      ],
    },
  ]
}

export function ContentAdminShell({
  children,
  userName,
  userEmail,
  counts,
}: {
  children: React.ReactNode
  userName: string
  userEmail: string
  counts: ContentAdminNavCounts
}) {
  return (
    <DashboardShell
      navigation={buildNavigation(counts)}
      userRole="Content Administrator"
      userName={userName}
      userEmail={userEmail}
      settingsHref="/content-admin/settings"
    >
      {children}
    </DashboardShell>
  )
}
