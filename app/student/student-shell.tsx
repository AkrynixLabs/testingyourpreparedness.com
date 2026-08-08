"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
import {
  LayoutDashboard,
  ClipboardList,
  Award,
  TrendingUp,
  BookOpen,
  Settings,
  User,
  GraduationCap,
  PlaySquare,
} from "lucide-react"

const navigation: NavGroup[] = [
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
    title: "Courses",
    items: [
      { title: "Browse Courses", href: "/student/courses", icon: GraduationCap },
      { title: "My Courses", href: "/student/courses/my", icon: PlaySquare },
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

export function StudentShell({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode
  userName: string
  userEmail: string
}) {
  return (
    <DashboardShell
      userRole="Student"
      navigation={navigation}
      userName={userName}
      userEmail={userEmail}
      profileHref="/student/profile"
      settingsHref="/student/settings"
    >
      {children}
    </DashboardShell>
  )
}
