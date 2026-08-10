/// Mirrors lib/student/exams.ts's AvailableExam, ScheduledExam, and
/// CompletedExam types (returned by GET /api/mobile/exams) - kept as three
/// distinct model classes, same as the server side, rather than one
/// union-ish type with a bunch of nullable fields.

class AvailableExam {
  final String assessmentId;
  final String title;
  final String subjectName;
  final int duration;
  final int questionCount;
  final String? difficulty;
  final DateTime? deadline;
  final int attempts;
  final int? maxAttempts;

  const AvailableExam({
    required this.assessmentId,
    required this.title,
    required this.subjectName,
    required this.duration,
    required this.questionCount,
    this.difficulty,
    this.deadline,
    required this.attempts,
    this.maxAttempts,
  });

  factory AvailableExam.fromJson(Map<String, dynamic> json) => AvailableExam(
        assessmentId: json['assessmentId'] as String,
        title: json['title'] as String,
        subjectName: json['subjectName'] as String,
        duration: json['duration'] as int,
        questionCount: json['questionCount'] as int,
        difficulty: json['difficulty'] as String?,
        deadline: json['deadline'] == null ? null : DateTime.parse(json['deadline'] as String),
        attempts: json['attempts'] as int,
        maxAttempts: json['maxAttempts'] as int?,
      );
}

class ScheduledExam {
  final String assignmentId;
  final String title;
  final String subjectName;
  final int duration;
  final int questionCount;
  final String? difficulty;
  final DateTime startDate;

  const ScheduledExam({
    required this.assignmentId,
    required this.title,
    required this.subjectName,
    required this.duration,
    required this.questionCount,
    this.difficulty,
    required this.startDate,
  });

  factory ScheduledExam.fromJson(Map<String, dynamic> json) => ScheduledExam(
        assignmentId: json['assignmentId'] as String,
        title: json['title'] as String,
        subjectName: json['subjectName'] as String,
        duration: json['duration'] as int,
        questionCount: json['questionCount'] as int,
        difficulty: json['difficulty'] as String?,
        startDate: DateTime.parse(json['startDate'] as String),
      );
}

class CompletedExam {
  final String attemptId;
  final String title;
  final String subjectName;
  final num score;
  final num totalMarks;
  final DateTime submittedAt;
  final int? timeSpentSeconds;

  const CompletedExam({
    required this.attemptId,
    required this.title,
    required this.subjectName,
    required this.score,
    required this.totalMarks,
    required this.submittedAt,
    this.timeSpentSeconds,
  });

  factory CompletedExam.fromJson(Map<String, dynamic> json) => CompletedExam(
        attemptId: json['attemptId'] as String,
        title: json['title'] as String,
        subjectName: json['subjectName'] as String,
        score: json['score'] as num,
        totalMarks: json['totalMarks'] as num,
        submittedAt: DateTime.parse(json['submittedAt'] as String),
        timeSpentSeconds: json['timeSpentSeconds'] as int?,
      );
}

class StudentExams {
  final List<AvailableExam> available;
  final List<ScheduledExam> scheduled;
  final List<CompletedExam> completed;

  const StudentExams({
    required this.available,
    required this.scheduled,
    required this.completed,
  });

  factory StudentExams.fromJson(Map<String, dynamic> json) => StudentExams(
        available: (json['available'] as List<dynamic>)
            .map((e) => AvailableExam.fromJson(e as Map<String, dynamic>))
            .toList(),
        scheduled: (json['scheduled'] as List<dynamic>)
            .map((e) => ScheduledExam.fromJson(e as Map<String, dynamic>))
            .toList(),
        completed: (json['completed'] as List<dynamic>)
            .map((e) => CompletedExam.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
