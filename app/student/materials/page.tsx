import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { StudentMaterialsView } from "./materials-view"

export default async function StudentMaterialsPage() {
  const session = await auth()
  const student = await prisma.student.findUnique({ where: { userId: session!.user.id } })

  if (!student) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Study Materials</h1>
        <p className="text-muted-foreground">No learner profile found for this account.</p>
      </div>
    )
  }

  const [materials, bookmarks] = await Promise.all([
    prisma.studyMaterial.findMany({ include: { subject: true }, orderBy: { lastUpdated: "desc" } }),
    prisma.studentMaterialBookmark.findMany({ where: { studentId: student.id }, select: { materialId: true } }),
  ])

  const bookmarkedIds = new Set(bookmarks.map((b) => b.materialId))

  const rows = materials.map((m) => ({
    id: m.id,
    title: m.title,
    subject: m.subject.name,
    type: m.type,
    format: m.format,
    size: m.size,
    duration: m.duration,
    views: m.views,
    rating: m.rating,
    description: m.description,
    topics: m.topics,
    isBookmarked: bookmarkedIds.has(m.id),
  }))

  return <StudentMaterialsView materials={rows} />
}
