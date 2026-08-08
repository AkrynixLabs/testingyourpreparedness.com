import { prisma } from "@/lib/prisma"
import { LeaderboardView } from "./leaderboard-view"

function isPass(score: number, totalMarks: number) {
  return totalMarks > 0 && (score / totalMarks) * 100 >= 50
}

export default async function SuperAdminLeaderboardPage() {
  const [schools, students, questions, subjects, independentCount] = await Promise.all([
    prisma.school.findMany({
      include: { students: { include: { examAttempts: true } } },
    }),
    prisma.student.findMany({
      include: { user: true, school: true, examAttempts: { include: { assessment: true } } },
    }),
    prisma.question.findMany({ select: { id: true, subjectId: true, correctAnswerIndex: true } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.student.count({ where: { enrollmentType: "independent" } }),
  ])

  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]))

  // --- School rankings: real avg score / pass rate / exams, from ExamAttempt ---
  const schoolRankings = schools
    .map((school) => {
      const attempts = school.students.flatMap((s) => s.examAttempts).filter((a) => a.submittedAt !== null)
      const scored = attempts.filter((a) => a.score !== null && a.totalMarks)
      const avgScore =
        scored.length > 0
          ? scored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / scored.length
          : null
      const passRate =
        scored.length > 0
          ? (scored.filter((a) => isPass(a.score!, a.totalMarks!)).length / scored.length) * 100
          : null
      return {
        id: school.id,
        name: school.name,
        region: school.region,
        ownershipType: school.ownershipType,
        students: school.students.length,
        examsCompleted: attempts.length,
        avgScore,
        passRate,
      }
    })
    .filter((s) => s.avgScore !== null)
    .sort((a, b) => b.avgScore! - a.avgScore!)
    .map((s, i) => ({ ...s, rank: i + 1 }))

  // --- Student rankings: real avg score across submitted attempts ---
  const studentRankings = students
    .map((student) => {
      const attempts = student.examAttempts.filter((a) => a.submittedAt !== null)
      const scored = attempts.filter((a) => a.score !== null && a.totalMarks)
      const avgScore =
        scored.length > 0
          ? scored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / scored.length
          : null
      const subjectIds = new Set(attempts.map((a) => a.assessment.subjectId))
      return {
        id: student.id,
        name: student.user.name,
        schoolName: student.school?.name ?? null,
        region: student.school?.region ?? null,
        enrollmentType: student.enrollmentType,
        exams: attempts.length,
        subjects: subjectIds.size,
        avgScore,
      }
    })
    .filter((s) => s.avgScore !== null)
    .sort((a, b) => b.avgScore! - a.avgScore!)
    .map((s, i) => ({ ...s, rank: i + 1 }))

  // --- Regional analysis: real, grouped from School.region ---
  const regionMap = new Map<
    string,
    { schools: number; students: number; scoreSum: number; scoreCount: number }
  >()
  for (const school of schoolRankings) {
    const entry = regionMap.get(school.region) ?? { schools: 0, students: 0, scoreSum: 0, scoreCount: 0 }
    entry.schools += 1
    entry.students += school.students
    if (school.avgScore !== null) {
      entry.scoreSum += school.avgScore
      entry.scoreCount += 1
    }
    regionMap.set(school.region, entry)
  }
  const regionStats = Array.from(regionMap.entries())
    .map(([region, r]) => ({
      region,
      schools: r.schools,
      students: r.students,
      avgScore: r.scoreCount > 0 ? r.scoreSum / r.scoreCount : null,
    }))
    .sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0))

  // --- Subject performance: real, derived from ExamAttempt.answers vs Question.correctAnswerIndex ---
  const subjectAgg = new Map<string, { correct: number; total: number }>()
  const subjectSchoolAgg = new Map<string, Map<string, { correct: number; total: number }>>()
  for (const student of students) {
    for (const attempt of student.examAttempts) {
      if (!attempt.submittedAt) continue
      const answers = attempt.answers as Record<string, number>
      for (const [questionId, selected] of Object.entries(answers)) {
        const q = questionMap.get(questionId)
        if (!q) continue
        const agg = subjectAgg.get(q.subjectId) ?? { correct: 0, total: 0 }
        agg.total += 1
        if (selected === q.correctAnswerIndex) agg.correct += 1
        subjectAgg.set(q.subjectId, agg)

        if (student.schoolId) {
          const bySchool = subjectSchoolAgg.get(q.subjectId) ?? new Map()
          const schoolAgg = bySchool.get(student.schoolId) ?? { correct: 0, total: 0 }
          schoolAgg.total += 1
          if (selected === q.correctAnswerIndex) schoolAgg.correct += 1
          bySchool.set(student.schoolId, schoolAgg)
          subjectSchoolAgg.set(q.subjectId, bySchool)
        }
      }
    }
  }
  const schoolNameMap = new Map(schools.map((s) => [s.id, s.name]))
  const subjectPerformance = Array.from(subjectAgg.entries())
    .map(([subjectId, agg]) => {
      const bySchool = subjectSchoolAgg.get(subjectId)
      let topSchool: { name: string; score: number } | null = null
      if (bySchool) {
        for (const [schoolId, schoolAgg] of bySchool.entries()) {
          const score = (schoolAgg.correct / schoolAgg.total) * 100
          if (!topSchool || score > topSchool.score) {
            topSchool = { name: schoolNameMap.get(schoolId) ?? "Unknown", score }
          }
        }
      }
      return {
        subjectId,
        subject: subjectMap.get(subjectId) ?? "Unknown",
        avgScore: (agg.correct / agg.total) * 100,
        answeredQuestions: agg.total,
        topSchool,
      }
    })
    .sort((a, b) => b.avgScore - a.avgScore)

  const allScored = students
    .flatMap((s) => s.examAttempts)
    .filter((a) => a.submittedAt !== null && a.score !== null && a.totalMarks)
  const nationalAverage =
    allScored.length > 0
      ? allScored.reduce((sum, a) => sum + (a.score! / a.totalMarks!) * 100, 0) / allScored.length
      : null
  const nationalPassRate =
    allScored.length > 0
      ? (allScored.filter((a) => isPass(a.score!, a.totalMarks!)).length / allScored.length) * 100
      : null

  return (
    <LeaderboardView
      schoolRankings={schoolRankings}
      studentRankings={studentRankings}
      regionStats={regionStats}
      subjectPerformance={subjectPerformance}
      summary={{
        totalSchools: schools.length,
        schoolStudents: students.length - independentCount,
        independentStudents: independentCount,
        nationalAverage,
        nationalPassRate,
      }}
    />
  )
}
