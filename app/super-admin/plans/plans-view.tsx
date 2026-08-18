"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  DollarSign,
  CheckCircle2,
  School,
  Zap,
  Crown,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { StatCard } from "@/components/stat-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createPlan, updatePlan, deletePlan, type PlanInput } from "./actions"
import type { School as SchoolModel, Subscription, SubscriptionPlan } from "@/lib/generated/prisma/client"

type PlanRow = SubscriptionPlan & { _count: { subscriptions: number } }
type SubscriptionRow = Subscription & { plan: SubscriptionPlan; school: SchoolModel | null }

const PLAN_ICON: Record<string, typeof School> = { starter: School, professional: Zap, enterprise: Crown }
const PLAN_COLOR: Record<string, string> = {
  starter: "bg-slate-100 text-slate-700",
  professional: "bg-primary/10 text-primary",
  enterprise: "bg-amber-100 text-amber-700",
}

const emptyForm: PlanInput = {
  name: "",
  description: "",
  monthlyPrice: 0,
  yearlyPrice: 0,
  studentLimit: null,
  features: [],
  popular: false,
}

export function PlansView({
  plans,
  recentSubscriptions,
  stats,
}: {
  plans: PlanRow[]
  recentSubscriptions: SubscriptionRow[]
  stats: { totalMRR: number; totalSubscribers: number; avgRevenuePerSchool: number; activePlans: number }
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PlanRow | null>(null)
  const [form, setForm] = useState<PlanInput>(emptyForm)
  const [featuresText, setFeaturesText] = useState("")

  const openCreate = () => {
    setEditingPlan(null)
    setForm(emptyForm)
    setFeaturesText("")
    setError(null)
    setDialogOpen(true)
  }

  const openEdit = (plan: PlanRow) => {
    setEditingPlan(plan)
    const features = (plan.features as unknown as string[]) ?? []
    setForm({
      name: plan.name,
      description: "",
      monthlyPrice: plan.monthlyPrice ?? 0,
      yearlyPrice: plan.yearlyPrice ?? 0,
      studentLimit: plan.studentLimit,
      features,
      popular: plan.popular,
    })
    setFeaturesText(features.join("\n"))
    setError(null)
    setDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const features = featuresText.split("\n").map((f) => f.trim()).filter(Boolean)
    const payload = { ...form, features }
    startTransition(async () => {
      try {
        if (editingPlan) {
          await updatePlan(editingPlan.id, payload)
        } else {
          await createPlan(payload)
        }
        setDialogOpen(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save plan")
      }
    })
  }

  const handleDelete = (plan: PlanRow) => {
    setError(null)
    startTransition(async () => {
      try {
        await deletePlan(plan.id)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete plan")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">Manage subscription tiers and pricing for schools</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}</DialogTitle>
              <DialogDescription>
                {editingPlan ? "Update this subscription tier" : "Define a new subscription tier for schools"}
              </DialogDescription>
            </DialogHeader>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="plan-name">Plan Name *</Label>
                  <Input
                    id="plan-name"
                    placeholder="e.g., Professional"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={!!editingPlan}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-limit">Student Limit (blank = unlimited)</Label>
                  <Input
                    id="student-limit"
                    type="number"
                    placeholder="500"
                    value={form.studentLimit ?? ""}
                    onChange={(e) => setForm({ ...form, studentLimit: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="monthly-price">Monthly Price (GHS) *</Label>
                  <Input
                    id="monthly-price"
                    type="number"
                    placeholder="350"
                    value={form.monthlyPrice || ""}
                    onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="yearly-price">Yearly Price (GHS)</Label>
                  <Input
                    id="yearly-price"
                    type="number"
                    placeholder="3360"
                    value={form.yearlyPrice || ""}
                    onChange={(e) => setForm({ ...form, yearlyPrice: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Features (one per line)</Label>
                <Textarea
                  placeholder={"Up to 500 students\nAdvanced assessments\nPriority support"}
                  rows={5}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mark as Popular</Label>
                  <p className="text-sm text-muted-foreground">Highlight this plan as recommended</p>
                </div>
                <Switch checked={form.popular} onCheckedChange={(checked) => setForm({ ...form, popular: checked })} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {editingPlan ? "Save Changes" : "Create Plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && !dialogOpen && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Revenue (approx)" value={`GHS ${stats.totalMRR.toLocaleString()}`} changeLabel="From school plans" icon={DollarSign} />
        <StatCard title="Total Subscribers" value={stats.totalSubscribers.toString()} changeLabel="Active schools" icon={School} />
        <StatCard title="Avg Revenue/School" value={`GHS ${stats.avgRevenuePerSchool}`} icon={Building2} />
        <StatCard title="Active Plans" value={stats.activePlans.toString()} icon={CheckCircle2} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = PLAN_ICON[plan.id] ?? School
          const color = PLAN_COLOR[plan.id] ?? "bg-muted text-foreground"
          const features = (plan.features as unknown as string[]) ?? []
          const monthlyRevenue = (plan.monthlyPrice ?? 0) * plan._count.subscriptions
          return (
            <Card key={plan.id} className={plan.popular ? "border-primary ring-1 ring-primary" : ""}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isPending}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openEdit(plan)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Plan
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(plan)}
                        disabled={plan._count.subscriptions > 0}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.popular && <Badge className="bg-primary text-primary-foreground">Popular</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">GHS {plan.monthlyPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {plan.yearlyPrice && (
                    <p className="text-sm text-muted-foreground">or GHS {plan.yearlyPrice}/year</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">
                    {plan.studentLimit === null ? "Unlimited" : `Up to ${plan.studentLimit}`} students
                  </p>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Subscribers</span>
                    <span className="font-semibold">{plan._count.subscriptions} schools</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Monthly Revenue</span>
                    <span className="font-semibold text-green-600">GHS {monthlyRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Subscriptions</CardTitle>
          <CardDescription>Most recently started school subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No school subscriptions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.school?.name ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.plan.name}</Badge>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">{sub.billingCycle}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          sub.status === "active"
                            ? "bg-green-100 text-green-700"
                            : sub.status === "past_due"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {sub.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{sub.startDate.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
