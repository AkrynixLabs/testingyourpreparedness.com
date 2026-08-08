import { prisma } from "@/lib/prisma"
import { BulkUploadForm } from "./bulk-upload-form"

export default async function BulkUploadPage() {
  const subjects = await prisma.subject.findMany({
    include: { topics: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  })

  return <BulkUploadForm subjects={subjects} />
}
