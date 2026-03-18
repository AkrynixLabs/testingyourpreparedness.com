"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Lock,
} from "lucide-react"

const savedPaymentMethods = [
  {
    id: "card-1",
    type: "card",
    brand: "Visa",
    last4: "4242",
    expiry: "12/27",
    isDefault: true,
  },
  {
    id: "momo-1",
    type: "mobile_money",
    provider: "MTN Mobile Money",
    number: "**** 5678",
    isDefault: false,
  },
]

export default function PaymentMethodPage() {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState(savedPaymentMethods)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [newMethodType, setNewMethodType] = useState<"card" | "mobile_money">("card")
  const [isProcessing, setIsProcessing] = useState(false)

  // Form state
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")
  const [momoProvider, setMomoProvider] = useState("")
  const [momoNumber, setMomoNumber] = useState("")

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    )
  }

  const handleDelete = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id))
    setShowDeleteDialog(null)
  }

  const handleAddMethod = () => {
    setIsProcessing(true)
    setTimeout(() => {
      const newMethod = newMethodType === "card"
        ? {
            id: `card-${Date.now()}`,
            type: "card" as const,
            brand: "Visa",
            last4: cardNumber.slice(-4),
            expiry: cardExpiry,
            isDefault: paymentMethods.length === 0,
          }
        : {
            id: `momo-${Date.now()}`,
            type: "mobile_money" as const,
            provider: momoProvider,
            number: `**** ${momoNumber.slice(-4)}`,
            isDefault: paymentMethods.length === 0,
          }

      setPaymentMethods(prev => [...prev, newMethod])
      setShowAddDialog(false)
      setIsProcessing(false)
      // Reset form
      setCardNumber("")
      setCardExpiry("")
      setCardCvc("")
      setCardName("")
      setMomoProvider("")
      setMomoNumber("")
    }, 1500)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(" ") : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
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
          <p className="text-muted-foreground mt-1">
            Manage your payment methods for subscription billing
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">Your payment information is secure</p>
              <p className="text-sm text-muted-foreground">
                All payment data is encrypted and processed securely. We never store your full card details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Saved Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods for automatic billing</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`rounded-lg border p-4 transition-all ${
                method.isDefault ? "border-primary bg-primary/5" : ""
              }`}
            >
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
                        <p className="font-medium">{method.brand} ending in {method.last4}</p>
                        <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">{method.provider}</p>
                        <p className="text-sm text-muted-foreground">{method.number}</p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteDialog(method.id)}
                    disabled={method.isDefault && paymentMethods.length > 1}
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
              <p className="text-lg font-medium">No payment methods</p>
              <p className="text-muted-foreground mb-4">Add a payment method to continue your subscription</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
          <CardDescription>This address appears on your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-medium">Achimota School</p>
            <p className="text-sm text-muted-foreground">P.O. Box AN 5186</p>
            <p className="text-sm text-muted-foreground">Achimota, Accra</p>
            <p className="text-sm text-muted-foreground">Ghana</p>
          </div>
          <Button variant="outline" className="mt-4">
            Update Address
          </Button>
        </CardContent>
      </Card>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Choose a payment method to add to your account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Method Type Selection */}
            <RadioGroup
              value={newMethodType}
              onValueChange={(value) => setNewMethodType(value as "card" | "mobile_money")}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="card" id="card" className="sr-only" />
                <Label
                  htmlFor="card"
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    newMethodType === "card" ? "border-primary bg-primary/5" : "border-muted"
                  }`}
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="font-medium">Credit/Debit Card</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="mobile_money" id="mobile_money" className="sr-only" />
                <Label
                  htmlFor="mobile_money"
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    newMethodType === "mobile_money" ? "border-primary bg-primary/5" : "border-muted"
                  }`}
                >
                  <Smartphone className="h-6 w-6" />
                  <span className="font-medium">Mobile Money</span>
                </Label>
              </div>
            </RadioGroup>

            <Separator />

            {/* Card Form */}
            {newMethodType === "card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Money Form */}
            {newMethodType === "mobile_money" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="momoProvider">Provider</Label>
                  <RadioGroup
                    value={momoProvider}
                    onValueChange={setMomoProvider}
                    className="grid grid-cols-3 gap-2"
                  >
                    {["MTN MoMo", "Vodafone Cash", "AirtelTigo"].map((provider) => (
                      <div key={provider}>
                        <RadioGroupItem value={provider} id={provider} className="sr-only" />
                        <Label
                          htmlFor={provider}
                          className={`flex items-center justify-center rounded-lg border p-3 cursor-pointer text-sm transition-all ${
                            momoProvider === provider ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          {provider}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="momoNumber">Mobile Number</Label>
                  <Input
                    id="momoNumber"
                    placeholder="024 XXX XXXX"
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMethod} disabled={isProcessing}>
              {isProcessing ? "Adding..." : "Add Payment Method"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              If this is your only payment method, you&apos;ll need to add a new one before your next billing date.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
            >
              Remove Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
