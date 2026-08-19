"use client"

import { usePathname } from "next/navigation"
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

// Matches app/student/exams/[id]/start - the exam-taking route. Next.js
// layouts can't receive info from the page they wrap, so this is matched on
// pathname rather than an explicit prop from the page itself.
const EXAM_TAKING_PATTERN = /^\/student\/exams\/[^/]+\/start(\/|$)/

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
  const pathname = usePathname()

  // While an exam is in progress, the dashboard shell (sidebar nav links,
  // top-header sign-out/notification bell, mobile hamburger menu) is a real
  // click-away escape route the exam-taking-client's own back-button/
  // beforeunload guards can't intercept, since those only cover browser
  // navigation, not in-app link clicks. User-requested 2026-08-18, after a
  // 2026-08-18 anti-cheat audit flagged this as a known gap in that same
  // guard work. Bypassing the shell entirely (rather than a "hide sidebar"
  // flag) removes every one of those surfaces at once, not just the nav
  // list. exam-taking-client.tsx already renders its own full-bleed
  // min-h-screen wrapper, so it doesn't rely on DashboardShell's padding.
  if (pathname && EXAM_TAKING_PATTERN.test(pathname)) {
    return <>{children}</>
  }

  return (
    <DashboardShell
      userRole="Learner"
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
