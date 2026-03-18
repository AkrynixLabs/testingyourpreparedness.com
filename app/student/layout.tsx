"use client"

import { DashboardShell } from "@/components/dashboard-shell"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const studentNavigation = [
    { name: "Dashboard", href: "/student", icon: "LayoutDashboard" },
    { name: "Available Exams", href: "/student/exams", icon: "ClipboardList" },
    { name: "My Results", href: "/student/results", icon: "Award" },
    { name: "Progress", href: "/student/progress", icon: "TrendingUp" },
    { name: "Study Materials", href: "/student/materials", icon: "BookOpen" },
  ]

  return (
    <DashboardShell
      role="student"
      navigation={studentNavigation}
      user={{
        name: "Kwame Asante",
        email: "kwame.asante@student.edu.gh",
        avatar: "KA",
      }}
    >
      {children}
    </DashboardShell>
  )
}
