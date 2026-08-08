// Shared between client-side preview and the bulkCreateQuestions server action.
// The server re-runs this independently on the raw rows it receives - client-side
// validation is a UX preview only, never trusted as the source of truth.

export type SubjectWithTopics = {
  id: string
  name: string
  topics: { id: string; name: string }[]
}

export type ParsedRow = {
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  subject: string
  topic: string
  difficulty: string
  explanation: string
}

export type ValidatedRow = {
  row: number
  parsed: ParsedRow
  status: "valid" | "warning" | "error"
  issues: string[]
  resolvedSubjectId: string | null
  resolvedSubjectName: string | null
  resolvedTopicId: string | null
  resolvedTopicName: string | null
  correctAnswerIndex: number | null
  difficulty: "Easy" | "Medium" | "Hard"
}

const ANSWER_LETTERS = ["A", "B", "C", "D"]

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_")
}

export function validateRow(
  row: number,
  parsed: ParsedRow,
  subjects: SubjectWithTopics[],
  defaultSubjectId: string | null
): ValidatedRow {
  const issues: string[] = []
  let status: "valid" | "warning" | "error" = "valid"

  const options = [parsed.option_a, parsed.option_b, parsed.option_c, parsed.option_d]

  if (!parsed.question.trim()) {
    issues.push("Question text is empty.")
    status = "error"
  }
  options.forEach((opt, i) => {
    if (!opt.trim()) {
      issues.push(`Option ${ANSWER_LETTERS[i]} is empty. All options are required.`)
      status = "error"
    }
  })

  const answerLetter = parsed.correct_answer.trim().toUpperCase()
  const correctAnswerIndex = ANSWER_LETTERS.indexOf(answerLetter)
  if (correctAnswerIndex === -1) {
    issues.push(`correct_answer must be A, B, C, or D (got "${parsed.correct_answer}").`)
    status = "error"
  }

  // Resolve subject: explicit column wins, otherwise fall back to the default.
  let resolvedSubjectId: string | null = null
  let resolvedSubjectName: string | null = null
  const subjectText = parsed.subject.trim()
  if (subjectText) {
    const match = subjects.find((s) => s.name.toLowerCase() === subjectText.toLowerCase())
    if (match) {
      resolvedSubjectId = match.id
      resolvedSubjectName = match.name
    } else {
      issues.push(`Subject "${subjectText}" doesn't match any known subject.`)
      status = "error"
    }
  } else if (defaultSubjectId) {
    const match = subjects.find((s) => s.id === defaultSubjectId)
    if (match) {
      resolvedSubjectId = match.id
      resolvedSubjectName = match.name
    }
  } else {
    issues.push("No subject in this row and no default subject selected.")
    status = "error"
  }

  // Resolve topic under the resolved subject: exact match reuses the existing
  // topic, otherwise a new topic is created under that subject at insert time.
  let resolvedTopicId: string | null = null
  let resolvedTopicName: string | null = null
  const topicText = parsed.topic.trim()
  if (resolvedSubjectId) {
    if (topicText) {
      const subject = subjects.find((s) => s.id === resolvedSubjectId)
      const match = subject?.topics.find((t) => t.name.toLowerCase() === topicText.toLowerCase())
      if (match) {
        resolvedTopicId = match.id
        resolvedTopicName = match.name
      } else {
        resolvedTopicName = topicText
        if (status !== "error") {
          issues.push(`Topic "${topicText}" doesn't exist yet under this subject - it will be created.`)
          status = "warning"
        }
      }
    } else {
      issues.push("No topic in this row - a topic is required to create a question.")
      status = "error"
    }
  }

  let difficulty: "Easy" | "Medium" | "Hard" = "Medium"
  const difficultyText = parsed.difficulty.trim().toLowerCase()
  if (difficultyText) {
    if (difficultyText === "easy") difficulty = "Easy"
    else if (difficultyText === "medium") difficulty = "Medium"
    else if (difficultyText === "hard") difficulty = "Hard"
    else {
      if (status === "valid") status = "warning"
      issues.push(`Difficulty "${parsed.difficulty}" is not Easy/Medium/Hard - defaulting to Medium.`)
    }
  }

  return {
    row,
    parsed,
    status,
    issues,
    resolvedSubjectId,
    resolvedSubjectName,
    resolvedTopicId,
    resolvedTopicName,
    correctAnswerIndex: correctAnswerIndex === -1 ? null : correctAnswerIndex,
    difficulty,
  }
}
