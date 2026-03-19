"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import {
  LayoutDashboard,
  ClipboardList,
  Award,
  TrendingUp,
  BookOpen,
  Trophy,
  Settings,
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
        { title: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
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
    >
      {children}
    </DashboardShell>
  )
}
