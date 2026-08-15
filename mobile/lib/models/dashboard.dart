// Mirrors lib/student/dashboard-stats.ts's StudentDashboard (returned by
// GET /api/mobile/dashboard).

class ClassRank {
  final int rank;
  final int totalStudents;

  const ClassRank({required this.rank, required this.totalStudents});

  factory ClassRank.fromJson(Map<String, dynamic> json) => ClassRank(
        rank: json['rank'] as int,
        totalStudents: json['totalStudents'] as int,
      );
}

class DashboardStats {
  final int examsCompleted;
  final int? averageScore;
  final ClassRank? classRank;
  final num studyHours;
  final int currentStreak;

  const DashboardStats({
    required this.examsCompleted,
    this.averageScore,
    this.classRank,
    required this.studyHours,
    required this.currentStreak,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) => DashboardStats(
        examsCompleted: json['examsCompleted'] as int,
        averageScore: json['averageScore'] as int?,
        classRank: json['classRank'] != null ? ClassRank.fromJson(json['classRank'] as Map<String, dynamic>) : null,
        studyHours: json['studyHours'] as num,
        currentStreak: json['currentStreak'] as int,
      );
}

class PerformanceTrendPoint {
  final String month;
  final num score;

  const PerformanceTrendPoint({required this.month, required this.score});

  factory PerformanceTrendPoint.fromJson(Map<String, dynamic> json) => PerformanceTrendPoint(
        month: json['month'] as String,
        score: json['score'] as num,
      );
}

class SubjectStrength {
  final String subject;
  final num score;

  const SubjectStrength({required this.subject, required this.score});

  factory SubjectStrength.fromJson(Map<String, dynamic> json) => SubjectStrength(
        subject: json['subject'] as String,
        score: json['score'] as num,
      );
}

class DashboardRecentResult {
  final String attemptId;
  final String title;
  final DateTime submittedAt;
  final num score;
  final num totalMarks;
  final int rank;
  final int totalStudents;

  const DashboardRecentResult({
    required this.attemptId,
    required this.title,
    required this.submittedAt,
    required this.score,
    required this.totalMarks,
    required this.rank,
    required this.totalStudents,
  });

  factory DashboardRecentResult.fromJson(Map<String, dynamic> json) => DashboardRecentResult(
        attemptId: json['attemptId'] as String,
        title: json['title'] as String,
        submittedAt: DateTime.parse(json['submittedAt'] as String),
        score: json['score'] as num,
        totalMarks: json['totalMarks'] as num,
        rank: json['rank'] as int,
        totalStudents: json['totalStudents'] as int,
      );
}

class StudentDashboard {
  final DashboardStats stats;
  final List<PerformanceTrendPoint> performanceTrend;
  final List<SubjectStrength> subjectStrengths;
  final List<DashboardRecentResult> recentResults;

  const StudentDashboard({
    required this.stats,
    required this.performanceTrend,
    required this.subjectStrengths,
    required this.recentResults,
  });

  factory StudentDashboard.fromJson(Map<String, dynamic> json) => StudentDashboard(
        stats: DashboardStats.fromJson(json['stats'] as Map<String, dynamic>),
        performanceTrend: (json['performanceTrend'] as List<dynamic>)
            .map((e) => PerformanceTrendPoint.fromJson(e as Map<String, dynamic>))
            .toList(),
        subjectStrengths: (json['subjectStrengths'] as List<dynamic>)
            .map((e) => SubjectStrength.fromJson(e as Map<String, dynamic>))
            .toList(),
        recentResults: (json['recentResults'] as List<dynamic>)
            .map((e) => DashboardRecentResult.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
