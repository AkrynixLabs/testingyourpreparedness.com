"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
import { formatCount } from "@/lib/utils"
import { LayoutDashboard, BookOpen, PlusCircle, Settings } from "lucide-react"

function buildNavigation(myCourses: number): NavGroup[] {
  return [
    {
      items: [{ title: "Dashboard", href: "/tutor", icon: LayoutDashboard }],
    },
    {
      title: "Courses",
      items: [
        { title: "My Courses", href: "/tutor/courses", icon: BookOpen, badge: formatCount(myCourses) },
        { title: "Create Course", href: "/tutor/courses/create", icon: PlusCircle },
      ],
    },
    {
      items: [{ title: "Settings", href: "/tutor/settings", icon: Settings }],
    },
  ]
}

export function TutorShell({
  children,
  userName,
  userEmail,
  counts,
}: {
  children: React.ReactNode
  userName: string
  userEmail: string
  counts: { myCourses: number }
}) {
  return (
    <DashboardShell
      navigation={buildNavigation(counts.myCourses)}
      userRole="Tutor"
      userName={userName}
      userEmail={userEmail}
      settingsHref="/tutor/settings"
    >
      {children}
    </DashboardShell>
  )
}
