// Demo data for TYP platform

import { Star, Trophy, Flame, Target, Award, Medal, Zap } from "lucide-react"

// Canonical Achievement catalog — matches prisma/schema.prisma's Achievement model
// (one shared catalog, not per-page lists). Consolidated from the two previously
// divergent lists on student/profile and student/progress.
export const achievements = [
  { name: "Top Performer", description: "Achieved 90%+ in 5 exams", icon: Star, earned: true, date: "Mar 15, 2026" },
  { name: "Perfect Score", description: "Scored 100% on an exam", icon: Trophy, earned: true, date: "Feb 20, 2026" },
  { name: "Study Streak", description: "7-day study streak", icon: Flame, earned: true, date: "Mar 10, 2026" },
  { name: "Consistency King", description: "Complete 20 exams", icon: Award, earned: true, date: "Jan 25, 2026" },
  { name: "Top 5", description: "Ranked in top 5 of class", icon: Medal, earned: true, date: "Mar 8, 2026" },
  { name: "Subject Master", description: "Score 90%+ in all subjects", icon: Target, earned: false, progress: 50 },
  { name: "Quick Learner", description: "Complete 10 exams in a week", icon: Zap, earned: false, progress: 70 },
  { name: "National Star", description: "Top 100 nationally", icon: Trophy, earned: false, progress: 65 },
]

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
    { id: 1, name: "Starter", price: 150, currency: "GHS", period: "month", students: 100, features: ["Basic assessments", "Standard reports", "Email support"] },
    { id: 2, name: "Professional", price: 350, currency: "GHS", period: "month", students: 500, features: ["All assessments", "Advanced analytics", "Priority support", "Custom branding"] },
    { id: 3, name: "Enterprise", price: 750, currency: "GHS", period: "month", students: "Unlimited", features: ["Everything in Professional", "Dedicated account manager", "API access", "White-label option", "Phone support"] },
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

export const examResults = [
  {
    id: 1,
    title: "Mathematics Mock Exam 2",
    subject: "Mathematics",
    score: 78,
    totalMarks: 100,
    date: "Mar 10, 2026",
    duration: "1h 45m",
    rank: 5,
    totalStudents: 45,
    correctAnswers: 39,
    incorrectAnswers: 11,
    totalQuestions: 50,
    trend: "up",
    grade: "B",
    percentile: 89,
    classAverage: 66,
    highestScore: 94,
    lowestScore: 31,
    topicBreakdown: [
      { topic: "Algebra", correct: 12, total: 15, percentage: 80 },
      { topic: "Geometry", correct: 10, total: 14, percentage: 71.4 },
      { topic: "Statistics", correct: 9, total: 11, percentage: 81.8 },
      { topic: "Fractions", correct: 8, total: 10, percentage: 80 },
    ],
    questions: [
      { id: 1, text: "Simplify: 3x + 2y - x + 4y", yourAnswer: "2x + 6y", correctAnswer: "2x + 6y", isCorrect: true, topic: "Algebra" },
      { id: 2, text: "Calculate the area of a rectangle with length 12cm and width 5cm.", yourAnswer: "17 cm²", correctAnswer: "60 cm²", isCorrect: false, topic: "Geometry", explanation: "Area of a rectangle = length × width = 12cm × 5cm = 60 cm²." },
      { id: 3, text: "What is the mean of 4, 8, 6, 5, and 7?", yourAnswer: "6", correctAnswer: "6", isCorrect: true, topic: "Statistics" },
    ],
  },
  {
    id: 2,
    title: "Social Studies Practice Test",
    subject: "Social Studies",
    score: 65,
    totalMarks: 80,
    date: "Mar 8, 2026",
    duration: "1h 20m",
    rank: 12,
    totalStudents: 45,
    correctAnswers: 26,
    incorrectAnswers: 14,
    totalQuestions: 40,
    trend: "down",
    grade: "C",
    percentile: 73,
    classAverage: 70,
    highestScore: 91,
    lowestScore: 38,
    topicBreakdown: [
      { topic: "Governance", correct: 6, total: 10, percentage: 60 },
      { topic: "History of Ghana", correct: 8, total: 10, percentage: 80 },
      { topic: "Culture", correct: 5, total: 10, percentage: 50 },
      { topic: "Economics", correct: 7, total: 10, percentage: 70 },
    ],
    questions: [
      { id: 1, text: "Ghana gained independence from British colonial rule in:", yourAnswer: "1957", correctAnswer: "1957", isCorrect: true, topic: "History of Ghana" },
      { id: 2, text: "Which arm of government makes laws in Ghana?", yourAnswer: "Judiciary", correctAnswer: "Legislature", isCorrect: false, topic: "Governance", explanation: "The Legislature (Parliament) is responsible for making laws; the Judiciary interprets them." },
    ],
  },
  {
    id: 3,
    title: "ICT Assessment",
    subject: "ICT",
    score: 42,
    totalMarks: 50,
    date: "Mar 5, 2026",
    duration: "50m",
    rank: 3,
    totalStudents: 45,
    correctAnswers: 21,
    incorrectAnswers: 4,
    totalQuestions: 25,
    trend: "up",
    grade: "A",
    percentile: 95,
    classAverage: 68,
    highestScore: 96,
    lowestScore: 40,
    topicBreakdown: [
      { topic: "Computer Basics", correct: 8, total: 9, percentage: 88.9 },
      { topic: "Internet & Networking", correct: 7, total: 8, percentage: 87.5 },
      { topic: "Word Processing", correct: 6, total: 8, percentage: 75 },
    ],
    questions: [
      { id: 1, text: "Which device is used to physically point and select items on a screen?", yourAnswer: "Mouse", correctAnswer: "Mouse", isCorrect: true, topic: "Computer Basics" },
      { id: 2, text: "What does 'WWW' stand for?", yourAnswer: "World Wide Web", correctAnswer: "World Wide Web", isCorrect: true, topic: "Internet & Networking" },
    ],
  },
  {
    id: 4,
    title: "English Language Test 2",
    subject: "English",
    score: 72,
    totalMarks: 100,
    date: "Mar 2, 2026",
    duration: "1h 30m",
    rank: 8,
    totalStudents: 45,
    correctAnswers: 36,
    incorrectAnswers: 14,
    totalQuestions: 50,
    trend: "up",
    grade: "B",
    percentile: 82,
    classAverage: 69,
    highestScore: 93,
    lowestScore: 35,
    topicBreakdown: [
      { topic: "Comprehension", correct: 11, total: 13, percentage: 84.6 },
      { topic: "Grammar", correct: 9, total: 13, percentage: 69.2 },
      { topic: "Vocabulary", correct: 8, total: 12, percentage: 66.7 },
      { topic: "Essay Writing", correct: 8, total: 12, percentage: 66.7 },
    ],
    questions: [
      { id: 1, text: "Which of the following is a complete sentence?", yourAnswer: "The dog barks.", correctAnswer: "The dog barks.", isCorrect: true, topic: "Grammar" },
      { id: 2, text: "Choose the correct synonym for 'abundant'.", yourAnswer: "Scarce", correctAnswer: "Plentiful", isCorrect: false, topic: "Vocabulary", explanation: "'Abundant' means existing in large quantities, which matches 'plentiful', not 'scarce'." },
    ],
  },
  {
    id: 5,
    title: "Integrated Science Quiz 4",
    subject: "Science",
    score: 85,
    totalMarks: 100,
    date: "Feb 28, 2026",
    duration: "1h",
    rank: 2,
    totalStudents: 45,
    correctAnswers: 34,
    incorrectAnswers: 6,
    totalQuestions: 40,
    trend: "up",
    grade: "A",
    percentile: 96,
    classAverage: 71,
    highestScore: 92,
    lowestScore: 44,
    topicBreakdown: [
      { topic: "Living Things", correct: 8, total: 10, percentage: 80 },
      { topic: "Energy", correct: 7, total: 8, percentage: 87.5 },
      { topic: "Matter", correct: 9, total: 10, percentage: 90 },
      { topic: "Human Body", correct: 10, total: 12, percentage: 83.3 },
    ],
    questions: [
      { id: 1, text: "The process by which green plants make their own food is called:", yourAnswer: "Photosynthesis", correctAnswer: "Photosynthesis", isCorrect: true, topic: "Living Things" },
      { id: 2, text: "Which gas is needed for photosynthesis to take place?", yourAnswer: "Oxygen", correctAnswer: "Carbon dioxide", isCorrect: false, topic: "Living Things", explanation: "Plants need carbon dioxide (CO2) from the air to perform photosynthesis; they release oxygen as a byproduct." },
    ],
  },
  {
    id: 6,
    title: "Mathematics Mock Exam 1",
    subject: "Mathematics",
    score: 68,
    totalMarks: 100,
    date: "Feb 25, 2026",
    duration: "1h 50m",
    rank: 10,
    totalStudents: 45,
    correctAnswers: 34,
    incorrectAnswers: 16,
    totalQuestions: 50,
    trend: "down",
    grade: "C",
    percentile: 71,
    classAverage: 67,
    highestScore: 90,
    lowestScore: 29,
    topicBreakdown: [
      { topic: "Algebra", correct: 9, total: 15, percentage: 60 },
      { topic: "Geometry", correct: 11, total: 14, percentage: 78.6 },
      { topic: "Statistics", correct: 7, total: 11, percentage: 63.6 },
      { topic: "Fractions", correct: 7, total: 10, percentage: 70 },
    ],
    questions: [
      { id: 1, text: "Solve for x: 2x + 5 = 15", yourAnswer: "x = 5", correctAnswer: "x = 5", isCorrect: true, topic: "Algebra" },
      { id: 2, text: "What is 3/4 expressed as a percentage?", yourAnswer: "34%", correctAnswer: "75%", isCorrect: false, topic: "Fractions", explanation: "3/4 = 0.75 = 75%." },
    ],
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
