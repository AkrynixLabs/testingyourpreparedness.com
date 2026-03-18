"use client"

import { DashboardShell, NavGroup } from "@/components/dashboard-shell"
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
} from "lucide-react"

const navigation: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Schools", href: "/super-admin/schools", icon: School, badge: "127" },
      { title: "Content Admins", href: "/super-admin/content-admins", icon: Users },
      { title: "Subjects & Topics", href: "/super-admin/subjects", icon: BookOpen },
    ],
  },
  {
    title: "Billing",
    items: [
      { title: "Subscription Plans", href: "/super-admin/plans", icon: CreditCard },
      { title: "Payments & Invoices", href: "/super-admin/payments", icon: FileText },
    ],
  },
  {
    title: "Analytics",
    items: [
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

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      navigation={navigation}
      userRole="Super Administrator"
      userName="Dr. Kwaku Mensah"
      userEmail="admin@typ.edu.gh"
    >
      {children}
    </DashboardShell>
  )
}
