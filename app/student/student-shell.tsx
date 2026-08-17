"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
import { formatCount } from "@/lib/utils"
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
  Trophy,
} from "lucide-react"

type StudentNavCounts = {
  availableExams: number
  myCourses: number
}

function buildNavigation(counts: StudentNavCounts): NavGroup[] {
  return [
    {
      items: [
        { title: "Dashboard", href: "/student", icon: LayoutDashboard },
        { title: "Available Exams", href: "/student/exams", icon: ClipboardList, badge: formatCount(counts.availableExams) },
        { title: "My Results", href: "/student/results", icon: Award },
        { title: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
        { title: "Progress", href: "/student/progress", icon: TrendingUp },
        { title: "Study Materials", href: "/student/materials", icon: BookOpen },
      ],
    },
    {
      title: "Courses",
      items: [
        { title: "Browse Courses", href: "/student/courses", icon: GraduationCap },
        { title: "My Courses", href: "/student/courses/my", icon: PlaySquare, badge: formatCount(counts.myCourses) },
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
}

export function StudentShell({
  children,
  userName,
  userEmail,
  counts,
}: {
  children: React.ReactNode
  userName: string
  userEmail: string
  counts: StudentNavCounts
}) {
  return (
    <DashboardShell
      userRole="Student"
      navigation={buildNavigation(counts)}
      userName={userName}
      userEmail={userEmail}
      profileHref="/student/profile"
      settingsHref="/student/settings"
    >
      {children}
    </DashboardShell>
  )
}
