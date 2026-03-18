"use client"

import { useState } from "react"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
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

const plans = [
  {
    id: 1,
    name: "Starter",
    description: "Perfect for small schools just getting started",
    monthlyPrice: 150,
    yearlyPrice: 1440,
    studentLimit: 100,
    features: [
      "Up to 100 students",
      "Basic assessments",
      "Email support",
      "Standard reports",
    ],
    isPopular: false,
    isActive: true,
    subscriberCount: 45,
    icon: School,
    color: "bg-slate-100 text-slate-700",
  },
  {
    id: 2,
    name: "Professional",
    description: "Best for growing schools with more needs",
    monthlyPrice: 350,
    yearlyPrice: 3360,
    studentLimit: 500,
    features: [
      "Up to 500 students",
      "Advanced assessments",
      "Priority support",
      "Detailed analytics",
      "Custom branding",
      "Bulk imports",
    ],
    isPopular: true,
    isActive: true,
    subscriberCount: 68,
    icon: Zap,
    color: "bg-primary/10 text-primary",
  },
  {
    id: 3,
    name: "Enterprise",
    description: "For large institutions with advanced requirements",
    monthlyPrice: 750,
    yearlyPrice: 7200,
    studentLimit: -1,
    features: [
      "Unlimited students",
      "All assessments",
      "24/7 dedicated support",
      "Advanced analytics",
      "Custom integrations",
      "API access",
      "White labeling",
      "SLA guarantee",
    ],
    isPopular: false,
    isActive: true,
    subscriberCount: 14,
    icon: Crown,
    color: "bg-amber-100 text-amber-700",
  },
]

const recentSubscriptions = [
  { school: "Accra Academy", plan: "Professional", date: "2 hours ago", action: "upgraded" },
  { school: "Wesley Girls' High", plan: "Enterprise", date: "1 day ago", action: "new" },
  { school: "Presec Legon", plan: "Professional", date: "2 days ago", action: "renewed" },
  { school: "Mfantsipim School", plan: "Starter", date: "3 days ago", action: "new" },
  { school: "Holy Child School", plan: "Professional", date: "5 days ago", action: "upgraded" },
]

export default function SubscriptionPlansPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<typeof plans[0] | null>(null)

  const totalMRR = plans.reduce((sum, plan) => sum + plan.monthlyPrice * plan.subscriberCount, 0)
  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscriberCount, 0)
  const avgRevenuePerSchool = Math.round(totalMRR / totalSubscribers)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage subscription tiers and pricing for schools
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Subscription Plan</DialogTitle>
              <DialogDescription>
                Define a new subscription tier for schools
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="plan-name">Plan Name</Label>
                  <Input id="plan-name" placeholder="e.g., Professional" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-limit">Student Limit</Label>
                  <Input id="student-limit" type="number" placeholder="500" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Brief description of the plan..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="monthly-price">Monthly Price (GHS)</Label>
                  <Input id="monthly-price" type="number" placeholder="350" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="yearly-price">Yearly Price (GHS)</Label>
                  <Input id="yearly-price" type="number" placeholder="3360" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Features (one per line)</Label>
                <Textarea 
                  placeholder="Up to 500 students&#10;Advanced assessments&#10;Priority support" 
                  rows={5}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mark as Popular</Label>
                  <p className="text-sm text-muted-foreground">
                    Highlight this plan as recommended
                  </p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateOpen(false)}>
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Revenue"
          value={`GHS ${totalMRR.toLocaleString()}`}
          changeLabel="From all plans"
          icon={DollarSign}
          change={12}
        />
        <StatCard
          title="Total Subscribers"
          value={totalSubscribers.toString()}
          changeLabel="Active schools"
          icon={School}
          change={8}
        />
        <StatCard
          title="Avg Revenue/School"
          value={`GHS ${avgRevenuePerSchool}`}
          changeLabel="Per subscriber"
          icon={Building2}
          change={5}
        />
        <StatCard
          title="Active Plans"
          value={plans.filter(p => p.isActive).length.toString()}
          changeLabel="Available tiers"
          icon={CheckCircle2}
          change={0}
        />
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <Card key={plan.id} className={plan.isPopular ? "border-primary ring-1 ring-primary" : ""}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-lg ${plan.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setEditingPlan(plan)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        View Subscribers
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.isPopular && (
                      <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">GHS {plan.monthlyPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    or GHS {plan.yearlyPrice}/year (save 20%)
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">
                    {plan.studentLimit === -1 ? "Unlimited" : `Up to ${plan.studentLimit}`} students
                  </p>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-sm text-muted-foreground">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Subscribers</span>
                    <span className="font-semibold">{plan.subscriberCount} schools</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Monthly Revenue</span>
                    <span className="font-semibold text-green-600">
                      GHS {(plan.monthlyPrice * plan.subscriberCount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscription Activity</CardTitle>
          <CardDescription>Latest subscription changes and new sign-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSubscriptions.map((sub, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{sub.school}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sub.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        sub.action === "upgraded"
                          ? "bg-green-100 text-green-700"
                          : sub.action === "new"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    >
                      {sub.action.charAt(0).toUpperCase() + sub.action.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sub.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
