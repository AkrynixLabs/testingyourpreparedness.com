// Demo data for TYP platform

export const subjects = [
  { id: 1, name: "English Language", code: "ENG", questionCount: 450, topicCount: 12 },
  { id: 2, name: "Mathematics", code: "MAT", questionCount: 520, topicCount: 15 },
  { id: 3, name: "Integrated Science", code: "SCI", questionCount: 380, topicCount: 10 },
  { id: 4, name: "Social Studies", code: "SOC", questionCount: 410, topicCount: 14 },
]

export const topics = {
  1: ["Comprehension", "Grammar", "Vocabulary", "Essay Writing", "Summary", "Letter Writing", "Creative Writing", "Punctuation", "Parts of Speech", "Sentence Structure", "Figures of Speech", "Oral English"],
  2: ["Algebra", "Geometry", "Statistics", "Trigonometry", "Number Theory", "Fractions", "Percentages", "Probability", "Mensuration", "Sets", "Vectors", "Functions", "Sequences", "Ratios", "Indices"],
  3: ["Living Things", "Ecology", "Human Body", "Energy", "Matter", "Forces", "Electricity", "Chemistry Basics", "Earth Science", "Scientific Method"],
  4: ["Governance", "History of Ghana", "Culture", "Economics", "Environment", "Human Rights", "National Symbols", "International Relations", "Social Issues", "Citizenship", "Tourism", "Agriculture", "Industry", "Family"],
}

export const schools = [
  { id: 1, name: "Achimota School", location: "Accra", students: 1240, plan: "Premium", status: "active", avgScore: 78 },
  { id: 2, name: "Mfantsipim School", location: "Cape Coast", students: 980, plan: "Standard", status: "active", avgScore: 82 },
  { id: 3, name: "Wesley Girls' High School", location: "Cape Coast", students: 1100, plan: "Premium", status: "active", avgScore: 85 },
  { id: 4, name: "Prempeh College", location: "Kumasi", students: 890, plan: "Standard", status: "active", avgScore: 76 },
  { id: 5, name: "Opoku Ware School", location: "Kumasi", students: 1050, plan: "Premium", status: "active", avgScore: 79 },
  { id: 6, name: "St. Augustine's College", location: "Cape Coast", students: 920, plan: "Starter", status: "pending", avgScore: 0 },
  { id: 7, name: "Accra Academy", location: "Accra", students: 780, plan: "Standard", status: "active", avgScore: 74 },
  { id: 8, name: "Holy Child School", location: "Cape Coast", students: 860, plan: "Premium", status: "active", avgScore: 81 },
]

export const students = [
  { id: 1, name: "Kwame Asante", email: "kwame.a@student.typ.gh", school: "Achimota School", class: "Form 3A", avgScore: 82, assessmentsTaken: 15 },
  { id: 2, name: "Ama Serwaa", email: "ama.s@student.typ.gh", school: "Wesley Girls' High School", class: "Form 3B", avgScore: 91, assessmentsTaken: 18 },
  { id: 3, name: "Kofi Mensah", email: "kofi.m@student.typ.gh", school: "Mfantsipim School", class: "Form 3A", avgScore: 78, assessmentsTaken: 12 },
  { id: 4, name: "Abena Osei", email: "abena.o@student.typ.gh", school: "Achimota School", class: "Form 3C", avgScore: 85, assessmentsTaken: 16 },
  { id: 5, name: "Yaw Boateng", email: "yaw.b@student.typ.gh", school: "Prempeh College", class: "Form 3A", avgScore: 72, assessmentsTaken: 10 },
  { id: 6, name: "Efua Darko", email: "efua.d@student.typ.gh", school: "Holy Child School", class: "Form 3B", avgScore: 88, assessmentsTaken: 14 },
]

export const assessments = [
  { id: 1, title: "BECE Mock Exam 2024 - English", subject: "English Language", questions: 50, duration: 90, status: "published", attempts: 2450, avgScore: 68 },
  { id: 2, title: "Mathematics Practice Test 1", subject: "Mathematics", questions: 40, duration: 60, status: "published", attempts: 1890, avgScore: 62 },
  { id: 3, title: "Integrated Science Mid-Term", subject: "Integrated Science", questions: 35, duration: 45, status: "published", attempts: 1560, avgScore: 71 },
  { id: 4, title: "Social Studies Comprehensive", subject: "Social Studies", questions: 45, duration: 75, status: "published", attempts: 1340, avgScore: 74 },
  { id: 5, title: "English Grammar Focus", subject: "English Language", questions: 30, duration: 40, status: "draft", attempts: 0, avgScore: 0 },
  { id: 6, title: "Algebra & Geometry Test", subject: "Mathematics", questions: 25, duration: 35, status: "pending", attempts: 0, avgScore: 0 },
]

export const questions = [
  { id: 1, subject: "Mathematics", topic: "Algebra", difficulty: "Medium", year: 2023, marks: 2, status: "approved" },
  { id: 2, subject: "Mathematics", topic: "Geometry", difficulty: "Hard", year: 2023, marks: 3, status: "approved" },
  { id: 3, subject: "English Language", topic: "Grammar", difficulty: "Easy", year: 2024, marks: 1, status: "approved" },
  { id: 4, subject: "English Language", topic: "Comprehension", difficulty: "Medium", year: 2024, marks: 2, status: "pending" },
  { id: 5, subject: "Integrated Science", topic: "Human Body", difficulty: "Medium", year: 2023, marks: 2, status: "approved" },
  { id: 6, subject: "Social Studies", topic: "Governance", difficulty: "Easy", year: 2024, marks: 1, status: "draft" },
]

export const subscriptionPlans = {
  school: [
    { id: 1, name: "Starter", price: 500, currency: "GHS", period: "term", students: 100, features: ["Basic assessments", "Standard reports", "Email support"] },
    { id: 2, name: "Standard", price: 1200, currency: "GHS", period: "term", students: 300, features: ["All assessments", "Advanced analytics", "Priority support", "Custom branding"] },
    { id: 3, name: "Premium", price: 2500, currency: "GHS", period: "term", students: "Unlimited", features: ["Everything in Standard", "Dedicated account manager", "API access", "White-label option", "Phone support"] },
  ],
  student: [
    { id: 1, name: "Free", price: 0, features: ["5 practice tests/month", "Basic score reports", "Limited question bank"] },
    { id: 2, name: "Premium Monthly", price: 25, currency: "GHS", period: "month", features: ["Unlimited practice tests", "Detailed analytics", "Full question bank", "Progress tracking"] },
    { id: 3, name: "Premium Termly", price: 60, currency: "GHS", period: "term", features: ["All Premium features", "Save 20%", "Priority support"] },
    { id: 4, name: "Premium Annual", price: 200, currency: "GHS", period: "year", features: ["All Premium features", "Save 33%", "1-on-1 tutoring session", "Certificate on completion"] },
  ]
}

export const platformStats = {
  totalSchools: 127,
  totalStudents: 45680,
  activeSubscriptions: 98,
  assessmentsTaken: 284500,
  averagePlatformScore: 72,
  totalQuestions: 8750,
  monthlyRevenue: 156000,
  revenueGrowth: 12.5,
}

export const recentActivity = [
  { id: 1, action: "New school registered", entity: "St. Augustine's College", time: "2 hours ago" },
  { id: 2, action: "Assessment published", entity: "BECE Mock Exam 2024", time: "4 hours ago" },
  { id: 3, action: "Subscription renewed", entity: "Achimota School - Premium", time: "1 day ago" },
  { id: 4, action: "Bulk questions uploaded", entity: "Mathematics - 50 questions", time: "1 day ago" },
  { id: 5, action: "New content admin added", entity: "Dr. Kwaku Mensah", time: "2 days ago" },
]

export const sampleExamQuestions = [
  {
    id: 1,
    question: "Simplify: 3x + 2y - x + 4y",
    options: ["2x + 6y", "4x + 6y", "2x + 2y", "4x + 2y"],
    correctAnswer: 0,
    explanation: "Combine like terms: (3x - x) + (2y + 4y) = 2x + 6y",
    topic: "Algebra",
    subject: "Mathematics"
  },
  {
    id: 2,
    question: "Which of the following is a complete sentence?",
    options: ["Running through the park.", "The dog barks.", "Beautiful sunny day.", "After the rain."],
    correctAnswer: 1,
    explanation: "'The dog barks' has a subject (the dog) and a predicate (barks), making it a complete sentence.",
    topic: "Grammar",
    subject: "English Language"
  },
  {
    id: 3,
    question: "The process by which green plants make their own food is called:",
    options: ["Respiration", "Photosynthesis", "Digestion", "Transpiration"],
    correctAnswer: 1,
    explanation: "Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.",
    topic: "Living Things",
    subject: "Integrated Science"
  },
  {
    id: 4,
    question: "Ghana gained independence from British colonial rule in:",
    options: ["1954", "1957", "1960", "1963"],
    correctAnswer: 1,
    explanation: "Ghana became the first sub-Saharan African country to gain independence from colonial rule on March 6, 1957.",
    topic: "History of Ghana",
    subject: "Social Studies"
  },
  {
    id: 5,
    question: "Calculate the area of a rectangle with length 12cm and width 5cm.",
    options: ["17 cm²", "34 cm²", "60 cm²", "120 cm²"],
    correctAnswer: 2,
    explanation: "Area of rectangle = length × width = 12cm × 5cm = 60 cm²",
    topic: "Mensuration",
    subject: "Mathematics"
  },
]

export const studentProgress = {
  overallScore: 76,
  scoreChange: 8,
  assessmentsCompleted: 24,
  studyStreak: 12,
  weakTopics: ["Algebra", "Trigonometry", "Essay Writing"],
  strongTopics: ["Comprehension", "History of Ghana", "Human Body"],
  recentScores: [
    { assessment: "Mathematics Practice Test", score: 72, date: "Mar 15" },
    { assessment: "English Grammar Quiz", score: 85, date: "Mar 12" },
    { assessment: "Science Mid-Term", score: 78, date: "Mar 10" },
    { assessment: "Social Studies Test", score: 82, date: "Mar 8" },
  ],
  subjectPerformance: [
    { subject: "English Language", score: 82 },
    { subject: "Mathematics", score: 68 },
    { subject: "Integrated Science", score: 78 },
    { subject: "Social Studies", score: 80 },
  ]
}
