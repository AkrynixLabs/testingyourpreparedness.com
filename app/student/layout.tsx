"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import {
  LayoutDashboard,
  ClipboardList,
  Award,
  TrendingUp,
  BookOpen,
  Settings,
  User,
} from "lucide-react"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const studentNavigation = [
    {
      items: [
        { title: "Dashboard", href: "/student", icon: LayoutDashboard },
        { title: "Available Exams", href: "/student/exams", icon: ClipboardList },
        { title: "My Results", href: "/student/results", icon: Award },
        { title: "Progress", href: "/student/progress", icon: TrendingUp },
        { title: "Study Materials", href: "/student/materials", icon: BookOpen },
      ],
    },
    {
      title: "Account",
      items: [
        { title: "Profile", href: "/student/profile", icon: User },
        { title: "Settings", href: "/student/settings", icon: Settings },
      ],
    },
  ]

  return (
    <DashboardShell
      userRole="Student"
      navigation={studentNavigation}
      userName="Kwame Asante"
      userEmail="kwame.asante@student.edu.gh"
      profileHref="/student/profile"
      settingsHref="/student/settings"
    >
      {children}
    </DashboardShell>
  )
}
