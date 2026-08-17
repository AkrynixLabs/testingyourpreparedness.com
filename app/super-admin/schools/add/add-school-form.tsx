"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Building2, MapPin, User, Info } from "lucide-react"
import { createSchoolBySuperAdmin } from "./actions"
import type { OwnershipType } from "@/lib/generated/prisma/client"

const regions = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Volta",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Western North",
  "Oti",
  "North East",
  "Savannah",
]

const ownershipTypes: { value: OwnershipType; label: string }[] = [
  { value: "public", label: "Public School" },
  { value: "private", label: "Private School" },
  { value: "international", label: "International School" },
  { value: "religious", label: "Religious/Mission School" },
]

export function AddSchoolForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    schoolName: "",
    ownershipType: "" as "" | OwnershipType,
    registrationNumber: "",
    yearEstablished: "",
    website: "",
    region: "",
    district: "",
    town: "",
    address: "",
    postalCode: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
  })

  const update = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = () => {
    setError(null)
    if (!formData.schoolName.trim()) return setError("School name is required.")
    if (!formData.ownershipType) return setError("Ownership type is required.")
    if (!formData.region.trim() || !formData.district.trim() || !formData.town.trim() || !formData.address.trim()) {
      return setError("Region, district, town, and address are all required.")
    }
    if (!formData.adminFirstName.trim() || !formData.adminLastName.trim() || !formData.adminEmail.trim() || !formData.adminPhone.trim()) {
      return setError("Administrator name, email, and phone are all required.")
    }

    startTransition(async () => {
      try {
        await createSchoolBySuperAdmin({
          ...formData,
          ownershipType: formData.ownershipType as OwnershipType,
        })
      } catch (err) {
        // A successful create ends in redirect(), which throws internally
        // and never reaches here - only a real failure lands in this catch.
        setError(err instanceof Error ? err.message : "Failed to create school.")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/super-admin/schools">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add School</h1>
          <p className="text-muted-foreground">Create a school directly - no self-signup or checkout involved</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This school is created and activated immediately - it won&apos;t go through the pending-verification queue
          self-registered schools do. The administrator account is created with a temporary password, emailed to
          them directly.
        </AlertDescription>
      </Alert>

      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Basic details about the institution</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schoolName">School Name *</Label>
            <Input id="schoolName" value={formData.schoolName} onChange={(e) => update("schoolName", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ownershipType">Ownership Type *</Label>
              <Select value={formData.ownershipType} onValueChange={(v) => update("ownershipType", v)}>
                <SelectTrigger id="ownershipType">
                  <SelectValue placeholder="Select school type" />
                </SelectTrigger>
                <SelectContent>
                  {ownershipTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">GES Registration Number</Label>
              <Input
                id="registrationNumber"
                placeholder="e.g., GES/123456"
                value={formData.registrationNumber}
                onChange={(e) => update("registrationNumber", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="yearEstablished">Year Established</Label>
              <Input
                id="yearEstablished"
                type="number"
                placeholder="e.g., 1990"
                value={formData.yearEstablished}
                onChange={(e) => update("yearEstablished", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.yourschool.edu.gh"
                value={formData.website}
                onChange={(e) => update("website", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where the school is located</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select value={formData.region} onValueChange={(v) => update("region", v)}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input id="district" value={formData.district} onChange={(e) => update("district", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="town">Town/City *</Label>
              <Input id="town" value={formData.town} onChange={(e) => update("town", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal/GPS Code</Label>
              <Input id="postalCode" value={formData.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Full Address *</Label>
            <Textarea id="address" rows={3} value={formData.address} onChange={(e) => update("address", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Primary Administrator</CardTitle>
              <CardDescription>Gets a temporary password by email to log in and manage this school</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="adminFirstName">First Name *</Label>
              <Input id="adminFirstName" value={formData.adminFirstName} onChange={(e) => update("adminFirstName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminLastName">Last Name *</Label>
              <Input id="adminLastName" value={formData.adminLastName} onChange={(e) => update("adminLastName", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminEmail">Email *</Label>
            <Input id="adminEmail" type="email" value={formData.adminEmail} onChange={(e) => update("adminEmail", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminPhone">Phone *</Label>
            <Input id="adminPhone" type="tel" value={formData.adminPhone} onChange={(e) => update("adminPhone", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Creating School..." : "Create School"}
        </Button>
      </div>
    </div>
  )
}
