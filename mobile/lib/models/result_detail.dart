// Mirrors lib/student/result-detail.ts's ResultDetail (returned by
// GET /api/mobile/results/{attemptId}).

class TopicBreakdownEntry {
  final String topic;
  final int correct;
  final int total;
  final num percentage;

  const TopicBreakdownEntry({
    required this.topic,
    required this.correct,
    required this.total,
    required this.percentage,
  });

  factory TopicBreakdownEntry.fromJson(Map<String, dynamic> json) => TopicBreakdownEntry(
        topic: json['topic'] as String,
        correct: json['correct'] as int,
        total: json['total'] as int,
        percentage: json['percentage'] as num,
      );
}

class ResultQuestion {
  final String id;
  final String text;
  final String topic;
  final String yourAnswer;
  final String correctAnswer;
  final bool isCorrect;
  final String? explanation;

  const ResultQuestion({
    required this.id,
    required this.text,
    required this.topic,
    required this.yourAnswer,
    required this.correctAnswer,
    required this.isCorrect,
    this.explanation,
  });

  factory ResultQuestion.fromJson(Map<String, dynamic> json) => ResultQuestion(
        id: json['id'] as String,
        text: json['text'] as String,
        topic: json['topic'] as String,
        yourAnswer: json['yourAnswer'] as String,
        correctAnswer: json['correctAnswer'] as String,
        isCorrect: json['isCorrect'] as bool,
        explanation: json['explanation'] as String?,
      );
}

class ResultDetail {
  final String attemptId;
  final String title;
  final String subjectName;
  final DateTime submittedAt;
  final num percentage;
  final String grade;
  final int correctAnswers;
  final int incorrectAnswers;
  final int? timeSpentSeconds;
  final int rank;
  final int totalStudents;
  final num percentile;
  final num classAverage;
  final num highestScore;
  final num lowestScore;
  final List<TopicBreakdownEntry> topicBreakdown;
  final List<ResultQuestion> questions;

  const ResultDetail({
    required this.attemptId,
    required this.title,
    required this.subjectName,
    required this.submittedAt,
    required this.percentage,
    required this.grade,
    required this.correctAnswers,
    required this.incorrectAnswers,
    this.timeSpentSeconds,
    required this.rank,
    required this.totalStudents,
    required this.percentile,
    required this.classAverage,
    required this.highestScore,
    required this.lowestScore,
    required this.topicBreakdown,
    required this.questions,
  });

  factory ResultDetail.fromJson(Map<String, dynamic> json) => ResultDetail(
        attemptId: json['attemptId'] as String,
        title: json['title'] as String,
        subjectName: json['subjectName'] as String,
        submittedAt: DateTime.parse(json['submittedAt'] as String),
        percentage: json['percentage'] as num,
        grade: json['grade'] as String,
        correctAnswers: json['correctAnswers'] as int,
        incorrectAnswers: json['incorrectAnswers'] as int,
        timeSpentSeconds: json['timeSpentSeconds'] as int?,
        rank: json['rank'] as int,
        totalStudents: json['totalStudents'] as int,
        percentile: json['percentile'] as num,
        classAverage: json['classAverage'] as num,
        highestScore: json['highestScore'] as num,
        lowestScore: json['lowestScore'] as num,
        topicBreakdown: (json['topicBreakdown'] as List<dynamic>)
            .map((e) => TopicBreakdownEntry.fromJson(e as Map<String, dynamic>))
            .toList(),
        questions:
            (json['questions'] as List<dynamic>).map((e) => ResultQuestion.fromJson(e as Map<String, dynamic>)).toList(),
      );
}
