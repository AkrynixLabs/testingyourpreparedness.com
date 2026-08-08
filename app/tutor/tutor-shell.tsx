"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
import { LayoutDashboard, BookOpen, PlusCircle, Settings } from "lucide-react"

const navigation: NavGroup[] = [
  {
    items: [{ title: "Dashboard", href: "/tutor", icon: LayoutDashboard }],
  },
  {
    title: "Courses",
    items: [
      { title: "My Courses", href: "/tutor/courses", icon: BookOpen },
      { title: "Create Course", href: "/tutor/courses/create", icon: PlusCircle },
    ],
  },
  {
    items: [{ title: "Settings", href: "/tutor/settings", icon: Settings }],
  },
]

export function TutorShell({
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
      navigation={navigation}
      userRole="Tutor"
      userName={userName}
      userEmail={userEmail}
      settingsHref="/tutor/settings"
    >
      {children}
    </DashboardShell>
  )
}
