"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
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
} from "lucide-react"

const navigation: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/school-admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Students",
    items: [
      { title: "All Students", href: "/school-admin/students", icon: Users, badge: "1,240" },
      { title: "Add Students", href: "/school-admin/students/add", icon: UserPlus },
      { title: "Classes/Forms", href: "/school-admin/classes", icon: GraduationCap },
    ],
  },
  {
    title: "Assessments",
    items: [
      { title: "Assigned Tests", href: "/school-admin/assessments", icon: ClipboardList },
      { title: "Assign New", href: "/school-admin/assessments/assign", icon: PlusCircle },
      { title: "Results", href: "/school-admin/results", icon: BarChart3 },
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

export default function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      navigation={navigation}
      userRole="School Administrator"
      userName="Mr. Kofi Asante"
      userEmail="admin@achimota.edu.gh"
    >
      {children}
    </DashboardShell>
  )
}
