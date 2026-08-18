"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
import { formatCount } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardList,
  BarChart3,
  CreditCard,
  Settings,
  UserPlus,
  PlusCircle,
  Trophy,
  ShieldAlert,
} from "lucide-react"

type SchoolAdminNavCounts = {
  allStudents: number
  classes: number
  assignedTests: number
  flaggedAttempts: number
}

function buildNavigation(counts: SchoolAdminNavCounts): NavGroup[] {
  return [
    {
      items: [
        { title: "Dashboard", href: "/school-admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Students",
      items: [
        { title: "All Students", href: "/school-admin/students", icon: Users, badge: formatCount(counts.allStudents) },
        { title: "Add Students", href: "/school-admin/students/add", icon: UserPlus },
        { title: "Classes/Forms", href: "/school-admin/classes", icon: GraduationCap, badge: formatCount(counts.classes) },
        { title: "Leaderboard", href: "/school-admin/leaderboard", icon: Trophy },
      ],
    },
    {
      title: "Assessments",
      items: [
        { title: "Assigned Tests", href: "/school-admin/assessments", icon: ClipboardList, badge: formatCount(counts.assignedTests) },
        { title: "Assign New", href: "/school-admin/assessments/assign", icon: PlusCircle },
        { title: "Results", href: "/school-admin/results", icon: BarChart3 },
        {
          title: "Flagged Attempts",
          href: "/school-admin/flagged-attempts",
          icon: ShieldAlert,
          badge: counts.flaggedAttempts > 0 ? formatCount(counts.flaggedAttempts) : undefined,
        },
      ],
    },
    {
      title: "Account",
      items: [
        { title: "Subscription", href: "/school-admin/subscription", icon: CreditCard },
        { title: "Settings", href: "/school-admin/settings", icon: Settings },
      ],
    },
  ]
}

export function SchoolAdminShell({
  children,
  userName,
  userEmail,
  counts,
}: {
  children: React.ReactNode
  userName: string
  userEmail: string
  counts: SchoolAdminNavCounts
}) {
  return (
    <DashboardShell
      navigation={buildNavigation(counts)}
      userRole="School Administrator"
      userName={userName}
      userEmail={userEmail}
      settingsHref="/school-admin/settings"
    >
      {children}
    </DashboardShell>
  )
}
