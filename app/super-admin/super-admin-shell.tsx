"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
import { formatCount } from "@/lib/utils"
import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  Settings,
  FileText,
  ShieldCheck,
  CheckSquare,
  FileQuestion,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Activity,
  Trophy,
  Library,
  UserCog,
} from "lucide-react"

type SuperAdminNavCounts = {
  schools: number
  students: number
  reviewQueue: number
  questionBank: number
  contentAdmins: number
  tutors: number
  courses: number
  overdueInvoices: number
  examsInProgress: number
}

function buildNavigation(counts: SuperAdminNavCounts): NavGroup[] {
  return [
    {
      items: [
        { title: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Management",
      items: [
        { title: "Schools", href: "/super-admin/schools", icon: School, badge: formatCount(counts.schools) },
        { title: "Students", href: "/super-admin/students", icon: GraduationCap, badge: formatCount(counts.students) },
        { title: "Content Admins", href: "/super-admin/content-admins", icon: Users, badge: formatCount(counts.contentAdmins) },
        { title: "Tutors", href: "/super-admin/tutors", icon: UserCog, badge: formatCount(counts.tutors) },
        { title: "Subjects & Topics", href: "/super-admin/subjects", icon: BookOpen },
      ],
    },
    {
      title: "Content",
      items: [
        { title: "Review Queue", href: "/super-admin/review-queue", icon: CheckSquare, badge: formatCount(counts.reviewQueue) },
        { title: "Question Bank", href: "/super-admin/question-bank", icon: FileQuestion, badge: formatCount(counts.questionBank) },
        { title: "Courses", href: "/super-admin/courses", icon: Library, badge: formatCount(counts.courses) },
      ],
    },
    {
      title: "Billing & Revenue",
      items: [
        { title: "Revenue Analytics", href: "/super-admin/revenue", icon: DollarSign },
        { title: "Subscription Plans", href: "/super-admin/plans", icon: CreditCard },
        // Badge is the overdue-invoice count (actionable), not a raw total -
        // matches super-admin/payments's own "Overdue Invoices" stat.
        { title: "Payments & Invoices", href: "/super-admin/payments", icon: FileText, badge: formatCount(counts.overdueInvoices) },
      ],
    },
    {
      title: "Analytics & Insights",
      items: [
        { title: "Platform Analytics", href: "/super-admin/analytics", icon: TrendingUp },
        { title: "School Leaderboard", href: "/super-admin/leaderboard", icon: Trophy },
        // Badge is exams in progress right now, matching live-activity's own
        // real "in progress" signal - not a static row count.
        { title: "Live Activity", href: "/super-admin/live-activity", icon: Activity, badge: formatCount(counts.examsInProgress) },
        { title: "Reports", href: "/super-admin/reports", icon: BarChart3 },
        { title: "Audit Logs", href: "/super-admin/audit-logs", icon: ShieldCheck },
      ],
    },
    {
      items: [
        { title: "Settings", href: "/super-admin/settings", icon: Settings },
      ],
    },
  ]
}

export function SuperAdminShell({
  children,
  userName,
  userEmail,
  counts,
}: {
  children: React.ReactNode
  userName: string
  userEmail: string
  counts: SuperAdminNavCounts
}) {
  return (
    <DashboardShell
      navigation={buildNavigation(counts)}
      userRole="Super Administrator"
      userName={userName}
      userEmail={userEmail}
      settingsHref="/super-admin/settings"
    >
      {children}
    </DashboardShell>
  )
}
