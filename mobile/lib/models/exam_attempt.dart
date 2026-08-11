// Mirrors lib/student/exam-attempt.ts's ExamStartResult (returned by
// POST /api/mobile/exams/{assessmentId}/start) - a real sum type in the
// server (timedOut / not-timed-out / not-ok), modeled here as one class with
// a `timedOut` discriminator rather than three, since the caller only ever
// needs a single if-branch on it.

class ExamQuestion {
  final String id;
  final String text;
  final List<String> options;

  const ExamQuestion({required this.id, required this.text, required this.options});

  factory ExamQuestion.fromJson(Map<String, dynamic> json) => ExamQuestion(
        id: json['id'] as String,
        text: json['text'] as String,
        options: (json['options'] as List<dynamic>).cast<String>(),
      );
}

class ExamStart {
  final bool timedOut;
  final String attemptId;
  final String? title;
  final String? subjectName;
  final List<ExamQuestion> questions;
  final int? remainingSeconds;

  const ExamStart({
    required this.timedOut,
    required this.attemptId,
    this.title,
    this.subjectName,
    this.questions = const [],
    this.remainingSeconds,
  });

  factory ExamStart.fromJson(Map<String, dynamic> json) {
    final timedOut = json['timedOut'] as bool;
    if (timedOut) {
      return ExamStart(timedOut: true, attemptId: json['attemptId'] as String);
    }
    return ExamStart(
      timedOut: false,
      attemptId: json['attemptId'] as String,
      title: json['title'] as String,
      subjectName: json['subjectName'] as String,
      questions: (json['questions'] as List<dynamic>)
          .map((e) => ExamQuestion.fromJson(e as Map<String, dynamic>))
          .toList(),
      remainingSeconds: json['remainingSeconds'] as int,
    );
  }
}
