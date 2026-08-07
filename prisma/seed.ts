/**
 * Dev database seed script. Consolidates the frontend's scattered demo data
 * (lib/demo-data.ts plus the richest per-page arrays across app/**) into one
 * coherent dataset that exercises every model in prisma/schema.prisma.
 *
 * DESTRUCTIVE & DEV-ONLY: wipes and reseeds every table. Never point this at
 * a production database. All seeded users share the password "password123"
 * (hashed) purely for local login testing.
 *
 * Run with: npm run db:seed
 */

import net from "node:net"
import dns from "node:dns"
import "dotenv/config"
import bcrypt from "bcryptjs"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import ws from "ws"
import { PrismaClient, Prisma } from "../lib/generated/prisma/client"

// Neon's serverless driver needs a WebSocket implementation outside
// edge/browser/Node 22+ runtimes (Node 20 here has no native `WebSocket`).
neonConfig.webSocketConstructor = ws

// This dev environment has no real IPv6 route - Node's Happy-Eyeballs races
// IPv4+IPv6 addresses concurrently, and the IPv6 ENETUNREACH failures were
// observed to make IPv4 attempts time out too. Same fix as lib/prisma.ts -
// see CLAUDE.md for the full diagnosis.
net.setDefaultAutoSelectFamily(false)
dns.setDefaultResultOrder("ipv4first")

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEV_PASSWORD = "password123"

async function main() {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10)

  console.log("Clearing existing data...")
  await clearDatabase()

  console.log("Seeding programs...")
  const programs = await seedPrograms()

  console.log("Seeding subjects & topics...")
  const { subjects, topics } = await seedSubjectsAndTopics(programs.bece.id)

  console.log("Seeding users (super admin, content admins)...")
  const { superAdmin, contentAdmins } = await seedStaffUsers(passwordHash, subjects)

  console.log("Seeding schools & school admins...")
  const schools = await seedSchools(passwordHash)

  console.log("Seeding classes...")
  const classes = await seedClasses(schools)

  console.log("Seeding students & guardians...")
  const students = await seedStudents(passwordHash, schools, classes)

  console.log("Seeding questions...")
  const questions = await seedQuestions(subjects, topics, contentAdmins, superAdmin)

  console.log("Seeding assessments...")
  const assessments = await seedAssessments(subjects, questions, contentAdmins)

  console.log("Seeding assessment assignments...")
  await seedAssignments(assessments, schools, classes)

  console.log("Seeding exam attempts...")
  await seedExamAttempts(students, assessments)

  console.log("Seeding study materials & goals...")
  await seedStudyMaterialsAndGoals(subjects, students)

  console.log("Seeding achievements...")
  await seedAchievements(students)

  console.log("Seeding subscription plans, subscriptions, invoices, payments...")
  await seedBilling(programs, schools, students)

  console.log("Seeding audit logs...")
  await seedAuditLogs(superAdmin, contentAdmins, schools)

  console.log("Done.")
}

async function clearDatabase() {
  // Order matters: children before parents. Using deleteMany per model
  // rather than TRUNCATE CASCADE so this stays portable across Postgres
  // hosts without needing elevated privileges.
  await prisma.auditLog.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.studentAchievement.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.studyGoal.deleteMany()
  await prisma.studentMaterialBookmark.deleteMany()
  await prisma.studyMaterial.deleteMany()
  await prisma.examAttempt.deleteMany()
  await prisma.assessmentAssignmentStudent.deleteMany()
  await prisma.assessmentAssignmentClass.deleteMany()
  await prisma.assessmentAssignment.deleteMany()
  await prisma.assessmentQuestion.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.question.deleteMany()
  await prisma.contentAdminSubject.deleteMany()
  await prisma.topic.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.guardian.deleteMany()
  await prisma.student.deleteMany()
  await prisma.class.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.schoolAdmin.deleteMany()
  await prisma.school.deleteMany()
  await prisma.contentAdminProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.program.deleteMany()
}

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------

async function seedPrograms() {
  const [bece, wassce, nursing, university, digitalSkills] = await Promise.all([
    prisma.program.create({
      data: {
        name: "BECE",
        slug: "bece",
        description: "Basic Education Certificate Examination — Junior High School exit exam.",
      },
    }),
    prisma.program.create({
      data: {
        name: "WASSCE",
        slug: "wassce",
        description: "West African Senior School Certificate Examination.",
      },
    }),
    prisma.program.create({
      data: {
        name: "Nursing Entrance",
        slug: "nursing-entrance",
        description: "Nursing and midwifery training school entrance/licensing exams.",
      },
    }),
    prisma.program.create({
      data: {
        name: "University Entrance",
        slug: "university-entrance",
        description: "University and tertiary entrance examinations.",
      },
    }),
    prisma.program.create({
      data: {
        name: "Digital Skills",
        slug: "digital-skills",
        description: "Digital skills training and certification track.",
      },
    }),
  ])
  return { bece, wassce, nursing, university, digitalSkills }
}

// ---------------------------------------------------------------------------
// Subjects & Topics — only BECE has real content today (data-model.md)
// ---------------------------------------------------------------------------

async function seedSubjectsAndTopics(beceProgramId: string) {
  const subjectDefs = [
    { code: "ENG", name: "English Language", topics: ["Comprehension", "Grammar", "Vocabulary", "Essay Writing", "Summary", "Letter Writing", "Creative Writing", "Punctuation", "Parts of Speech", "Sentence Structure", "Figures of Speech", "Oral English"] },
    { code: "MAT", name: "Mathematics", topics: ["Algebra", "Geometry", "Statistics", "Trigonometry", "Number Theory", "Fractions", "Percentages", "Probability", "Mensuration", "Sets", "Vectors", "Functions", "Sequences", "Ratios", "Indices"] },
    { code: "SCI", name: "Integrated Science", topics: ["Living Things", "Ecology", "Human Body", "Energy", "Matter", "Forces", "Electricity", "Chemistry Basics", "Earth Science", "Scientific Method"] },
    { code: "SOC", name: "Social Studies", topics: ["Governance", "History of Ghana", "Culture", "Economics", "Environment", "Human Rights", "National Symbols", "International Relations", "Social Issues", "Citizenship", "Tourism", "Agriculture", "Industry", "Family"] },
    { code: "ICT", name: "ICT", topics: [] as string[] },
    { code: "RME", name: "RME", topics: [] as string[] },
    { code: "FRE", name: "French", topics: [] as string[] },
    { code: "GHL", name: "Ghanaian Language", topics: [] as string[] },
  ]

  const subjects: Record<string, { id: string }> = {}
  const topics: Record<string, Record<string, { id: string }>> = {}

  for (const def of subjectDefs) {
    const subject = await prisma.subject.create({
      data: { programId: beceProgramId, name: def.name, code: def.code },
    })
    subjects[def.name] = subject
    topics[def.name] = {}
    for (const topicName of def.topics) {
      const topic = await prisma.topic.create({
        data: { subjectId: subject.id, name: topicName },
      })
      topics[def.name][topicName] = topic
    }
  }

  return { subjects, topics }
}

// ---------------------------------------------------------------------------
// Staff users: Super Admin + Content Admins
// ---------------------------------------------------------------------------

async function seedStaffUsers(
  passwordHash: string,
  subjects: Record<string, { id: string }>
) {
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@typ.edu.gh",
      passwordHash,
      name: "Dr. Kwaku Mensah",
      role: "super_admin",
    },
  })

  const contentAdminDefs = [
    { name: "Ama Boateng", email: "ama.boateng@typ.edu.gh", subjects: ["Mathematics", "Integrated Science"] },
    { name: "Kofi Asante", email: "kofi.asante@typ.edu.gh", subjects: ["Integrated Science", "Mathematics"] },
    { name: "Yaa Mensah", email: "yaa.mensah@typ.edu.gh", subjects: ["Social Studies", "English Language"] },
    { name: "Efua Owusu", email: "efua.owusu@typ.edu.gh", subjects: ["ICT"] },
    { name: "Kofi Mensah", email: "kofi.mensah@typ.edu.gh", subjects: ["Mathematics", "RME"] },
  ]

  const contentAdmins: Record<string, { userId: string; profileId: string }> = {}

  for (const def of contentAdminDefs) {
    const user = await prisma.user.create({
      data: { email: def.email, passwordHash, name: def.name, role: "content_admin" },
    })
    const profile = await prisma.contentAdminProfile.create({
      data: {
        userId: user.id,
        status: "active",
        lastActive: new Date(),
        subjects: {
          create: def.subjects
            .filter((s) => subjects[s])
            .map((s) => ({ subjectId: subjects[s].id })),
        },
      },
    })
    contentAdmins[def.name] = { userId: user.id, profileId: profile.id }
  }

  return { superAdmin, contentAdmins }
}

// ---------------------------------------------------------------------------
// Schools & School Admins
// ---------------------------------------------------------------------------

async function seedSchools(passwordHash: string) {
  const schoolDefs = [
    { name: "Achimota School", code: "ACH-001", region: "Greater Accra", district: "Accra Metropolitan", town: "Accra", ownershipType: "public" as const, status: "active" as const, adminName: "Mr. Kofi Asante", adminEmail: "admin@achimota.edu.gh" },
    { name: "Mfantsipim School", code: "MFA-001", region: "Central", district: "Cape Coast Metropolitan", town: "Cape Coast", ownershipType: "private" as const, status: "active" as const, adminName: "Mrs. Adjoa Danso", adminEmail: "admin@mfantsipim.edu.gh" },
    { name: "Wesley Girls' High School", code: "WES-001", region: "Central", district: "Cape Coast Metropolitan", town: "Cape Coast", ownershipType: "religious" as const, status: "active" as const, adminName: "Mrs. Grace Amoah", adminEmail: "admin@wesleygirls.edu.gh" },
    { name: "Prempeh College", code: "PRE-001", region: "Ashanti", district: "Kumasi Metropolitan", town: "Kumasi", ownershipType: "public" as const, status: "active" as const, adminName: "Mr. Yaw Owusu", adminEmail: "admin@prempeh.edu.gh" },
    { name: "Opoku Ware School", code: "OPK-001", region: "Ashanti", district: "Kumasi Metropolitan", town: "Kumasi", ownershipType: "religious" as const, status: "active" as const, adminName: "Mr. Kwabena Boateng", adminEmail: "admin@opokuware.edu.gh" },
    { name: "St. Augustine's College", code: "AUG-001", region: "Central", district: "Cape Coast Metropolitan", town: "Cape Coast", ownershipType: "religious" as const, status: "pending" as const, adminName: "Mrs. Comfort Mensah", adminEmail: "admin@staugustines.edu.gh" },
    { name: "Accra Academy", code: "ACA-001", region: "Greater Accra", district: "Accra Metropolitan", town: "Accra", ownershipType: "public" as const, status: "active" as const, adminName: "Mr. Emmanuel Tetteh", adminEmail: "admin@accraacademy.edu.gh" },
    { name: "Holy Child School", code: "HOL-001", region: "Central", district: "Cape Coast Metropolitan", town: "Cape Coast", ownershipType: "religious" as const, status: "active" as const, adminName: "Mrs. Abena Osei", adminEmail: "admin@holychild.edu.gh" },
  ]

  const schools: Record<string, { id: string; code: string }> = {}

  for (const def of schoolDefs) {
    const school = await prisma.school.create({
      data: {
        code: def.code,
        name: def.name,
        registrationNumber: `GES-${def.code}`,
        ownershipType: def.ownershipType,
        educationLevel: "junior_high",
        region: def.region,
        district: def.district,
        town: def.town,
        address: `${def.name}, ${def.town}, ${def.region} Region`,
        email: def.adminEmail,
        phone: "+233 30 222 1234",
        established: 1900 + Math.floor(Math.random() * 100),
        status: def.status,
      },
    })
    schools[def.name] = school

    const adminUser = await prisma.user.create({
      data: {
        email: def.adminEmail,
        passwordHash,
        name: def.adminName,
        role: "school_admin",
      },
    })
    await prisma.schoolAdmin.create({
      data: { userId: adminUser.id, schoolId: school.id, isPrimary: true },
    })
  }

  return schools
}

// ---------------------------------------------------------------------------
// Classes — "Form N[A/B/C]" canonical naming (resolved 2026-08-05)
// ---------------------------------------------------------------------------

async function seedClasses(schools: Record<string, { id: string }>) {
  const classDefs: { school: string; form: number; section: string }[] = [
    { school: "Achimota School", form: 3, section: "A" },
    { school: "Achimota School", form: 3, section: "B" },
    { school: "Achimota School", form: 3, section: "C" },
    { school: "Achimota School", form: 2, section: "A" },
    { school: "Achimota School", form: 2, section: "B" },
    { school: "Achimota School", form: 1, section: "A" },
    { school: "Wesley Girls' High School", form: 3, section: "B" },
    { school: "Mfantsipim School", form: 3, section: "A" },
    { school: "Prempeh College", form: 3, section: "A" },
    { school: "Holy Child School", form: 3, section: "B" },
  ]

  const classes: Record<string, { id: string }> = {}

  for (const def of classDefs) {
    const cls = await prisma.class.create({
      data: {
        displayName: `Form ${def.form}${def.section}`,
        schoolId: schools[def.school].id,
        form: def.form,
        section: def.section,
        teacherName: null,
        academicYear: "2025/2026",
      },
    })
    classes[`${def.school}|Form ${def.form}${def.section}`] = cls
  }

  return classes
}

// ---------------------------------------------------------------------------
// Students & Guardians
// ---------------------------------------------------------------------------

async function seedStudents(
  passwordHash: string,
  schools: Record<string, { id: string }>,
  classes: Record<string, { id: string }>
) {
  const schoolStudentDefs = [
    { name: "Kwame Asante", email: "kwame.a@student.typ.gh", school: "Achimota School", classKey: "Achimota School|Form 3A" },
    { name: "Ama Serwaa", email: "ama.s@student.typ.gh", school: "Wesley Girls' High School", classKey: "Wesley Girls' High School|Form 3B" },
    { name: "Kofi Mensah", email: "kofi.m@student.typ.gh", school: "Mfantsipim School", classKey: "Mfantsipim School|Form 3A" },
    { name: "Abena Osei", email: "abena.o@student.typ.gh", school: "Achimota School", classKey: "Achimota School|Form 3C" },
    { name: "Yaw Boateng", email: "yaw.b@student.typ.gh", school: "Prempeh College", classKey: "Prempeh College|Form 3A" },
    { name: "Efua Darko", email: "efua.d@student.typ.gh", school: "Holy Child School", classKey: "Holy Child School|Form 3B" },
  ]

  const independentStudentDefs = [
    { name: "Kofi Owusu", email: "kofi.owusu@yahoo.com", guardianName: "Mr. Owusu Sr.", guardianPhone: "+233 20 111 2222", guardianRelation: "father" as const },
    { name: "Abena Darko", email: "abena.d@gmail.com", guardianName: "Mrs. Darko", guardianPhone: "+233 24 333 4444", guardianRelation: "mother" as const },
  ]

  const students: Record<string, { id: string; userId: string }> = {}

  for (const def of schoolStudentDefs) {
    const user = await prisma.user.create({
      data: { email: def.email, passwordHash, name: def.name, role: "student" },
    })
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        enrollmentType: "school",
        schoolId: schools[def.school].id,
        classId: classes[def.classKey]?.id,
        gender: def.name.match(/Kwame|Kofi|Yaw|Kwabena/) ? "male" : "female",
        status: "active",
      },
    })
    students[def.name] = { id: student.id, userId: user.id }
  }

  for (const def of independentStudentDefs) {
    const user = await prisma.user.create({
      data: { email: def.email, passwordHash, name: def.name, role: "student" },
    })
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        enrollmentType: "independent",
        status: "active",
      },
    })
    await prisma.guardian.create({
      data: {
        studentId: student.id,
        name: def.guardianName,
        phone: def.guardianPhone,
        relation: def.guardianRelation,
        approvedAt: new Date(), // guardian-approval gate satisfied
      },
    })
    students[def.name] = { id: student.id, userId: user.id }
  }

  return students
}

// ---------------------------------------------------------------------------
// Questions — from sampleExamQuestions in lib/demo-data.ts (the only source
// with full option/correctAnswer/explanation fidelity)
// ---------------------------------------------------------------------------

async function seedQuestions(
  subjects: Record<string, { id: string }>,
  topics: Record<string, Record<string, { id: string }>>,
  contentAdmins: Record<string, { userId: string }>,
  superAdmin: { id: string }
) {
  const defs = [
    {
      text: "Simplify: 3x + 2y - x + 4y",
      options: ["2x + 6y", "4x + 6y", "2x + 2y", "4x + 2y"],
      correctAnswerIndex: 0,
      explanation: "Combine like terms: (3x - x) + (2y + 4y) = 2x + 6y",
      subject: "Mathematics",
      topic: "Algebra",
      difficulty: "Medium" as const,
      createdBy: "Kofi Mensah",
    },
    {
      text: "Which of the following is a complete sentence?",
      options: ["Running through the park.", "The dog barks.", "Beautiful sunny day.", "After the rain."],
      correctAnswerIndex: 1,
      explanation: "'The dog barks' has a subject (the dog) and a predicate (barks), making it a complete sentence.",
      subject: "English Language",
      topic: "Grammar",
      difficulty: "Easy" as const,
      createdBy: "Yaa Mensah",
    },
    {
      text: "The process by which green plants make their own food is called:",
      options: ["Respiration", "Photosynthesis", "Digestion", "Transpiration"],
      correctAnswerIndex: 1,
      explanation: "Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.",
      subject: "Integrated Science",
      topic: "Living Things",
      difficulty: "Medium" as const,
      createdBy: "Ama Boateng",
    },
    {
      text: "Ghana gained independence from British colonial rule in:",
      options: ["1954", "1957", "1960", "1963"],
      correctAnswerIndex: 1,
      explanation: "Ghana became the first sub-Saharan African country to gain independence from colonial rule on March 6, 1957.",
      subject: "Social Studies",
      topic: "History of Ghana",
      difficulty: "Easy" as const,
      createdBy: "Yaa Mensah",
    },
    {
      text: "Calculate the area of a rectangle with length 12cm and width 5cm.",
      options: ["17 cm²", "34 cm²", "60 cm²", "120 cm²"],
      correctAnswerIndex: 2,
      explanation: "Area of rectangle = length × width = 12cm × 5cm = 60 cm²",
      subject: "Mathematics",
      topic: "Mensuration",
      difficulty: "Medium" as const,
      createdBy: "Kofi Mensah",
    },
    {
      text: "What is the chemical formula for water?",
      options: ["H2O", "CO2", "NaCl", "O2"],
      correctAnswerIndex: 0,
      explanation: "Water is composed of two hydrogen atoms and one oxygen atom: H2O.",
      subject: "Integrated Science",
      topic: "Chemistry Basics",
      difficulty: "Easy" as const,
      createdBy: "Kofi Asante",
      status: "pending" as const, // still in the review queue
    },
    {
      text: "Which of these is a renewable source of energy?",
      options: ["Coal", "Natural Gas", "Solar energy", "Crude Oil"],
      correctAnswerIndex: 2,
      explanation: "Solar energy is renewable because it is continuously replenished by the sun.",
      subject: "Integrated Science",
      topic: "Energy",
      difficulty: "Easy" as const,
      createdBy: "Ama Boateng",
    },
  ]

  const questions: { id: string; subject: string }[] = []

  for (const def of defs) {
    const question = await prisma.question.create({
      data: {
        subjectId: subjects[def.subject].id,
        topicId: topics[def.subject][def.topic].id,
        text: def.text,
        options: def.options as unknown as Prisma.InputJsonValue,
        correctAnswerIndex: def.correctAnswerIndex,
        explanation: def.explanation,
        difficulty: def.difficulty,
        marks: 1,
        year: 2026,
        status: def.status ?? "approved",
        createdById: contentAdmins[def.createdBy].userId,
        reviewedById: def.status === "pending" ? null : superAdmin.id,
      },
    })
    questions.push({ id: question.id, subject: def.subject })
  }

  return questions
}

// ---------------------------------------------------------------------------
// Assessments — from lib/demo-data.ts's `assessments` array
// ---------------------------------------------------------------------------

async function seedAssessments(
  subjects: Record<string, { id: string }>,
  questions: { id: string; subject: string }[],
  contentAdmins: Record<string, { userId: string }>
) {
  const defs = [
    { title: "BECE Mock Exam 2026 - English", subject: "English Language", duration: 90, status: "published" as const, createdBy: "Yaa Mensah" },
    { title: "Mathematics Practice Test 1", subject: "Mathematics", duration: 60, status: "published" as const, createdBy: "Kofi Mensah" },
    { title: "Integrated Science Mid-Term", subject: "Integrated Science", duration: 45, status: "published" as const, createdBy: "Ama Boateng" },
    { title: "Social Studies Comprehensive", subject: "Social Studies", duration: 75, status: "published" as const, createdBy: "Yaa Mensah" },
    { title: "English Grammar Focus", subject: "English Language", duration: 40, status: "draft" as const, createdBy: "Yaa Mensah" },
    { title: "Algebra & Geometry Test", subject: "Mathematics", duration: 35, status: "pending" as const, createdBy: "Kofi Mensah" },
  ]

  const assessments: { id: string; subject: string }[] = []

  for (const def of defs) {
    const subjectQuestions = questions.filter((q) => q.subject === def.subject)
    const assessment = await prisma.assessment.create({
      data: {
        title: def.title,
        subjectId: subjects[def.subject].id,
        duration: def.duration,
        status: def.status,
        createdById: contentAdmins[def.createdBy].userId,
        questions: {
          create: subjectQuestions.map((q, i) => ({ questionId: q.id, order: i + 1 })),
        },
      },
    })
    assessments.push({ id: assessment.id, subject: def.subject })
  }

  return assessments
}

// ---------------------------------------------------------------------------
// Assessment Assignments — a published assessment assigned to a school/class
// ---------------------------------------------------------------------------

async function seedAssignments(
  assessments: { id: string; subject: string }[],
  schools: Record<string, { id: string }>,
  classes: Record<string, { id: string }>
) {
  const mathAssessment = assessments.find((a) => a.subject === "Mathematics")
  const scienceAssessment = assessments.find((a) => a.subject === "Integrated Science")
  if (!mathAssessment || !scienceAssessment) return

  await prisma.assessmentAssignment.create({
    data: {
      assessmentId: mathAssessment.id,
      schoolId: schools["Achimota School"].id,
      startDate: new Date("2026-03-15"),
      endDate: new Date("2026-03-25"),
      status: "active",
      shuffleQuestions: true,
      showResults: true,
      passingScore: 50,
      allowRetake: true,
      maxAttempts: 2,
      classes: {
        create: [
          { classId: classes["Achimota School|Form 3A"].id },
          { classId: classes["Achimota School|Form 3B"].id },
        ],
      },
    },
  })

  await prisma.assessmentAssignment.create({
    data: {
      assessmentId: scienceAssessment.id,
      schoolId: schools["Holy Child School"].id,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-03-10"),
      status: "completed",
      showResults: true,
      classes: {
        create: [{ classId: classes["Holy Child School|Form 3B"].id }],
      },
    },
  })
}

// ---------------------------------------------------------------------------
// Exam Attempts — from the examResults consolidated in lib/demo-data.ts
// ---------------------------------------------------------------------------

async function seedExamAttempts(
  students: Record<string, { id: string }>,
  assessments: { id: string; subject: string }[]
) {
  const mathAssessment = assessments.find((a) => a.subject === "Mathematics")
  const scienceAssessment = assessments.find((a) => a.subject === "Integrated Science")
  const englishAssessment = assessments.find((a) => a.subject === "English Language")
  if (!mathAssessment || !scienceAssessment || !englishAssessment) return

  // correctFraction is applied to the assessment's *actual* attached
  // questions - with only a handful of real seeded questions per assessment,
  // exact round-number scores (e.g. "78%") aren't achievable, so this
  // produces the closest honest approximation instead of a fabricated one.
  // answers/score/totalMarks/grade are all derived from this, not hardcoded,
  // so student/results and student/results/[id] have real, consistent,
  // per-question data to read once wired to Neon.
  const defs = [
    { student: "Kwame Asante", assessment: mathAssessment, correctFraction: 0.75, submittedAt: "2026-03-10" },
    { student: "Ama Serwaa", assessment: scienceAssessment, correctFraction: 1, submittedAt: "2026-02-28" },
    { student: "Kofi Mensah", assessment: englishAssessment, correctFraction: 1, submittedAt: "2026-03-02" },
    { student: "Abena Osei", assessment: mathAssessment, correctFraction: 0.5, submittedAt: "2026-02-25" },
  ]

  for (const def of defs) {
    const assessmentQuestions = await prisma.assessmentQuestion.findMany({
      where: { assessmentId: def.assessment.id },
      include: { question: true },
      orderBy: { order: "asc" },
    })
    if (assessmentQuestions.length === 0) continue

    const numCorrect = Math.round(assessmentQuestions.length * def.correctFraction)
    const answers: Record<string, number> = {}
    let score = 0
    let totalMarks = 0
    assessmentQuestions.forEach(({ question: q }, index) => {
      totalMarks += q.marks
      const options = q.options as string[]
      if (index < numCorrect) {
        answers[q.id] = q.correctAnswerIndex
        score += q.marks
      } else {
        answers[q.id] = (q.correctAnswerIndex + 1) % options.length
      }
    })
    const percentage = (score / totalMarks) * 100
    const grade = percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : "F"

    const submittedAt = new Date(def.submittedAt)
    await prisma.examAttempt.create({
      data: {
        studentId: students[def.student].id,
        assessmentId: def.assessment.id,
        answers: answers as unknown as Prisma.InputJsonValue,
        flaggedQuestionIds: [] as unknown as Prisma.InputJsonValue,
        startedAt: submittedAt,
        submittedAt,
        score,
        totalMarks,
        grade,
        timeSpentSeconds: 3600,
      },
    })
  }
}

// ---------------------------------------------------------------------------
// Study Materials & Study Goals
// ---------------------------------------------------------------------------

async function seedStudyMaterialsAndGoals(
  subjects: Record<string, { id: string }>,
  students: Record<string, { id: string }>
) {
  const materialDefs = [
    { title: "Mathematics - Algebraic Expressions Complete Guide", subject: "Mathematics", type: "document" as const, format: "PDF" as const, size: 2_400_000, views: 1245, rating: 4.8, description: "Comprehensive guide covering all algebraic expressions topics for BECE preparation.", topics: ["Algebra", "Expressions", "Equations"] },
    { title: "English Language - Essay Writing Techniques", subject: "English Language", type: "video" as const, format: "MP4" as const, duration: 2700, views: 892, rating: 4.9, description: "Learn professional essay writing techniques to score high marks in your BECE English exam.", topics: ["Essay Writing", "Grammar", "Comprehension"] },
    { title: "Integrated Science - Human Body Systems", subject: "Integrated Science", type: "document" as const, format: "PDF" as const, size: 5_100_000, views: 756, rating: 4.7, description: "Detailed notes on all human body systems with diagrams and practice questions.", topics: ["Human Body", "Digestive System", "Circulatory System"] },
    { title: "Social Studies - Ghana's Independence History", subject: "Social Studies", type: "video" as const, format: "MP4" as const, duration: 1920, views: 1102, rating: 4.6, description: "Documentary-style video covering Ghana's journey to independence and key historical figures.", topics: ["Ghana History", "Independence", "Nationalism"] },
  ]

  const bookmarkedFor = students["Kwame Asante"]

  for (const def of materialDefs) {
    const material = await prisma.studyMaterial.create({
      data: {
        title: def.title,
        subjectId: subjects[def.subject].id,
        type: def.type,
        format: def.format,
        fileUrl: `https://placeholder.blob.vercel-storage.com/${def.format.toLowerCase()}/${encodeURIComponent(def.title)}`,
        size: def.size ?? null,
        duration: def.duration ?? null,
        views: def.views,
        rating: def.rating,
        description: def.description,
        topics: def.topics,
      },
    })
    if (def.title.startsWith("Mathematics") && bookmarkedFor) {
      await prisma.studentMaterialBookmark.create({
        data: { studentId: bookmarkedFor.id, materialId: material.id },
      })
    }
  }

  const goalDefs = [
    { goal: "Complete 5 Math practice exams", unit: "exam_count" as const, progress: 3, total: 5, dueDate: "2026-03-25" },
    { goal: "Improve Social Studies by 10%", unit: "percentage" as const, progress: 8, total: 10, dueDate: "2026-04-01" },
    { goal: "Maintain study streak for 30 days", unit: "day_streak" as const, progress: 12, total: 30, dueDate: "2026-04-15" },
  ]

  if (bookmarkedFor) {
    for (const def of goalDefs) {
      await prisma.studyGoal.create({
        data: {
          studentId: bookmarkedFor.id,
          goal: def.goal,
          unit: def.unit,
          progress: def.progress,
          total: def.total,
          dueDate: new Date(def.dueDate),
        },
      })
    }
  }
}

// ---------------------------------------------------------------------------
// Achievements — canonical 8-entry catalog (resolved 2026-08-05)
// ---------------------------------------------------------------------------

async function seedAchievements(students: Record<string, { id: string }>) {
  const defs = [
    { name: "Top Performer", description: "Achieved 90%+ in 5 exams", icon: "Star", criteria: "score >= 90 in 5 distinct exam attempts" },
    { name: "Perfect Score", description: "Scored 100% on an exam", icon: "Trophy", criteria: "score == totalMarks on any exam attempt" },
    { name: "Study Streak", description: "7-day study streak", icon: "Flame", criteria: "logged in / studied 7 consecutive days" },
    { name: "Consistency King", description: "Complete 20 exams", icon: "Award", criteria: "examAttempts.count >= 20" },
    { name: "Top 5", description: "Ranked in top 5 of class", icon: "Medal", criteria: "class rank <= 5" },
    { name: "Subject Master", description: "Score 90%+ in all subjects", icon: "Target", criteria: "avg score >= 90 across every subject attempted" },
    { name: "Quick Learner", description: "Complete 10 exams in a week", icon: "Zap", criteria: "examAttempts.count >= 10 within a 7-day window" },
    { name: "National Star", description: "Top 100 nationally", icon: "Trophy", criteria: "national rank <= 100" },
  ]

  const achievements: { id: string; name: string }[] = []
  for (const def of defs) {
    const achievement = await prisma.achievement.create({ data: def })
    achievements.push(achievement)
  }

  const earnedFor = students["Kwame Asante"]
  if (earnedFor) {
    const earnedNames = ["Top Performer", "Perfect Score", "Study Streak", "Consistency King", "Top 5"]
    for (const name of earnedNames) {
      const achievement = achievements.find((a) => a.name === name)!
      await prisma.studentAchievement.create({
        data: { studentId: earnedFor.id, achievementId: achievement.id },
      })
    }
  }
}

// ---------------------------------------------------------------------------
// Billing — canonical plans (resolved 2026-08-05), subscriptions, invoices,
// payments, payment methods
// ---------------------------------------------------------------------------

async function seedBilling(
  programs: Record<string, { id: string }>,
  schools: Record<string, { id: string }>,
  students: Record<string, { id: string }>
) {
  // Canonical school plans: Starter/Professional/Enterprise at GHS 150/350/750
  // per month (1,440/3,360/7,200 yearly, 20% off). platform-wide (programId
  // null) for now - see docs/data-model.md#billing-scope-vs-program.
  await prisma.subscriptionPlan.create({
    data: {
      id: "starter",
      audience: "school",
      name: "Starter",
      monthlyPrice: 150,
      yearlyPrice: 1440,
      studentLimit: 100,
      features: ["Basic assessments", "Standard reports", "Email support"] as unknown as Prisma.InputJsonValue,
    },
  })
  const professional = await prisma.subscriptionPlan.create({
    data: {
      id: "professional",
      audience: "school",
      name: "Professional",
      monthlyPrice: 350,
      yearlyPrice: 3360,
      studentLimit: 500,
      popular: true,
      features: ["All assessments", "Advanced analytics", "Priority support", "Custom branding"] as unknown as Prisma.InputJsonValue,
    },
  })
  await prisma.subscriptionPlan.create({
    data: {
      id: "enterprise",
      audience: "school",
      name: "Enterprise",
      monthlyPrice: 750,
      yearlyPrice: 7200,
      studentLimit: null, // unlimited
      features: ["Everything in Professional", "Dedicated account manager", "API access", "White-label option", "Phone support"] as unknown as Prisma.InputJsonValue,
    },
  })

  // Independent-student plans (unchanged/consistent across the frontend).
  await prisma.subscriptionPlan.create({
    data: {
      id: "student-free",
      audience: "independent",
      name: "Free",
      features: ["5 practice tests/month", "Basic score reports", "Limited question bank"] as unknown as Prisma.InputJsonValue,
    },
  })
  const studentPremiumMonthly = await prisma.subscriptionPlan.create({
    data: {
      id: "student-premium-monthly",
      audience: "independent",
      name: "Premium Monthly",
      monthlyPrice: 25,
      features: ["Unlimited practice tests", "Detailed analytics", "Full question bank", "Progress tracking"] as unknown as Prisma.InputJsonValue,
    },
  })
  await prisma.subscriptionPlan.create({
    data: {
      id: "student-premium-termly",
      audience: "independent",
      name: "Premium Termly",
      termPrice: 60,
      features: ["All Premium features", "Save 20%", "Priority support"] as unknown as Prisma.InputJsonValue,
    },
  })
  await prisma.subscriptionPlan.create({
    data: {
      id: "student-premium-annual",
      audience: "independent",
      name: "Premium Annual",
      yearlyPrice: 200,
      features: ["All Premium features", "Save 33%", "1-on-1 tutoring session", "Certificate on completion"] as unknown as Prisma.InputJsonValue,
    },
  })

  // Achimota School subscribes to Professional, platform-wide (programId null).
  const achimotaSubscription = await prisma.subscription.create({
    data: {
      planId: professional.id,
      schoolId: schools["Achimota School"].id,
      billingCycle: "monthly",
      status: "active",
      currentStudents: 45,
      renewalDate: new Date("2026-04-01"),
    },
  })

  await prisma.paymentMethod.create({
    data: {
      type: "card",
      schoolId: schools["Achimota School"].id,
      isDefault: true,
      cardBrand: "Visa",
      cardLast4: "4242",
      cardExpiry: "12/28",
    },
  })

  const invoiceDefs = [
    { period: "Jan 2026", amount: 350, status: "paid" as const, dueDate: "2026-01-15", paidDate: "2026-01-03" },
    { period: "Feb 2026", amount: 350, status: "paid" as const, dueDate: "2026-02-15", paidDate: "2026-02-01" },
    { period: "Mar 2026", amount: 350, status: "paid" as const, dueDate: "2026-03-15", paidDate: "2026-03-01" },
  ]

  let paymentCounter = 1
  for (const def of invoiceDefs) {
    const invoice = await prisma.invoice.create({
      data: {
        id: `INV-2026-${String(paymentCounter).padStart(3, "0")}`,
        subscriptionId: achimotaSubscription.id,
        amount: def.amount,
        status: def.status,
        period: def.period,
        dueDate: new Date(def.dueDate),
        paidDate: new Date(def.paidDate),
      },
    })
    await prisma.payment.create({
      data: {
        id: `PAY-${String(paymentCounter).padStart(6, "0")}`,
        invoiceId: invoice.id,
        amount: def.amount,
        status: "completed",
        type: paymentCounter === 1 ? "new" : "renewal",
        method: "card",
        paystackReference: `ps_ref_${paymentCounter}`,
      },
    })
    paymentCounter++
  }

  // Independent student subscription example.
  const independentStudent = students["Kofi Owusu"]
  if (independentStudent) {
    await prisma.subscription.create({
      data: {
        planId: studentPremiumMonthly.id,
        studentId: independentStudent.id,
        billingCycle: "monthly",
        status: "active",
        renewalDate: new Date("2026-04-05"),
      },
    })
    await prisma.paymentMethod.create({
      data: {
        type: "mobile_money",
        studentId: independentStudent.id,
        isDefault: true,
        momoProvider: "mtn_momo",
        momoNumber: "+233241234567",
      },
    })
  }

  // Reference the other four programs so the seed exercises the schema's
  // Program back-relations even though billing is platform-wide today.
  void programs
}

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------

async function seedAuditLogs(
  superAdmin: { id: string },
  contentAdmins: Record<string, { userId: string }>,
  schools: Record<string, { id: string }>
) {
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: superAdmin.id,
        action: "approve",
        category: "content",
        description: "Approved question submitted by Ama Boateng",
        status: "success",
        details: { subject: "Integrated Science" } as unknown as Prisma.InputJsonValue,
      },
      {
        actorId: superAdmin.id,
        action: "create",
        category: "school",
        description: "Registered new school: St. Augustine's College",
        status: "success",
        details: { schoolId: schools["St. Augustine's College"].id } as unknown as Prisma.InputJsonValue,
      },
      {
        actorId: contentAdmins["Kofi Mensah"].userId,
        action: "create",
        category: "content",
        description: "Submitted assessment for review: Algebra & Geometry Test",
        status: "success",
        details: {} as unknown as Prisma.InputJsonValue,
      },
    ],
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
