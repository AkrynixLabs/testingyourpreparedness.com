import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { AddSchoolForm } from "./add-school-form"

export default async function AddSchoolPage() {
  const session = await auth()
  if (session?.user?.role !== "super_admin") notFound()

  return <AddSchoolForm />
}
