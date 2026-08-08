"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, CreditCard, Smartphone, Plus, Trash2, CheckCircle2, Shield } from "lucide-react"
import { setDefaultPaymentMethod, deletePaymentMethod } from "./actions"
import type { MomoProvider, PaymentMethodType } from "@/lib/generated/prisma/client"

type PaymentMethodRow = {
  id: string
  type: PaymentMethodType
  cardBrand: string | null
  cardLast4: string | null
  cardExpiry: string | null
  momoProvider: MomoProvider | null
  momoNumber: string | null
  isDefault: boolean
}

const momoLabel: Record<MomoProvider, string> = {
  mtn_momo: "MTN MoMo",
  vodafone_cash: "Vodafone Cash",
  airteltigo_money: "AirtelTigo Money",
}

export function PaymentMethodView({
  school,
  paymentMethods,
}: {
  school: { name: string; address: string; town: string; region: string }
  paymentMethods: PaymentMethodRow[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethodRow | null>(null)

  const handleSetDefault = (id: string) => {
    setError(null)
    startTransition(async () => {
      try {
        await setDefaultPaymentMethod(id)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update default method.")
      }
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setError(null)
    startTransition(async () => {
      try {
        await deletePaymentMethod(deleteTarget.id)
        setDeleteTarget(null)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove payment method.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/school-admin/subscription">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground mt-1">Manage your payment methods for subscription billing</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Your payment information is secure</p>
              <p className="text-sm text-muted-foreground">
                Card details are captured directly by Paystack during checkout - this app never sees or stores your
                full card number.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Saved Payment Methods</CardTitle>
              <CardDescription>Captured automatically the next time you complete a checkout</CardDescription>
            </div>
            <Button asChild>
              <Link href="/school-admin/subscription/upgrade">
                <Plus className="h-4 w-4 mr-2" />
                Add via Checkout
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className={`rounded-lg border p-4 transition-all ${method.isDefault ? "border-primary bg-primary/5" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-3 ${method.isDefault ? "bg-primary/10" : "bg-muted"}`}>
                    {method.type === "card" ? (
                      <CreditCard className={`h-5 w-5 ${method.isDefault ? "text-primary" : "text-muted-foreground"}`} />
                    ) : (
                      <Smartphone className={`h-5 w-5 ${method.isDefault ? "text-primary" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <div>
                    {method.type === "card" ? (
                      <>
                        <p className="font-medium">
                          {method.cardBrand ?? "Card"} ending in {method.cardLast4 ?? "----"}
                        </p>
                        <p className="text-sm text-muted-foreground">Expires {method.cardExpiry ?? "-"}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">{method.momoProvider ? momoLabel[method.momoProvider] : "Mobile Money"}</p>
                        <p className="text-sm text-muted-foreground">{method.momoNumber ?? "-"}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault ? (
                    <Badge className="bg-primary/10 text-primary">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)} disabled={isPending}>
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(method)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {paymentMethods.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No payment methods yet</p>
              <p className="text-muted-foreground mb-4">
                A payment method is saved automatically the next time you complete a Paystack checkout.
              </p>
              <Button asChild>
                <Link href="/school-admin/subscription/upgrade">
                  <Plus className="h-4 w-4 mr-2" />
                  Go to Checkout
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
          <CardDescription>This is your school&apos;s registered address</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-medium">{school.name}</p>
            <p className="text-sm text-muted-foreground">{school.address}</p>
            <p className="text-sm text-muted-foreground">
              {school.town}, {school.region}
            </p>
          </div>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/school-admin/settings">Update Address</Link>
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this payment method?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. If this is your only payment method, you&apos;ll need to add a new one before
              your next billing date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isPending}
            >
              {isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
