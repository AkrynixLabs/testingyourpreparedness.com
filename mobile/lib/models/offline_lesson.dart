/// A locally-cached article lesson - the download unit for offline course
/// access (see services/offline_library.dart). Video lessons are never
/// stored here: they're external URLs the tutor pasted in (YouTube/Vimeo/a
/// raw file), not files this app can fetch and cache, so "offline" only
/// ever applies to article-type lessons - scope confirmed with the user
/// 2026-08-17.
class OfflineLesson {
  final String lessonId;
  final String courseId;
  final String courseTitle;
  final String moduleTitle;
  final String lessonTitle;
  final String content;
  final DateTime downloadedAt;

  const OfflineLesson({
    required this.lessonId,
    required this.courseId,
    required this.courseTitle,
    required this.moduleTitle,
    required this.lessonTitle,
    required this.content,
    required this.downloadedAt,
  });

  Map<String, dynamic> toJson() => {
        'lessonId': lessonId,
        'courseId': courseId,
        'courseTitle': courseTitle,
        'moduleTitle': moduleTitle,
        'lessonTitle': lessonTitle,
        'content': content,
        'downloadedAt': downloadedAt.toIso8601String(),
      };

  factory OfflineLesson.fromJson(Map<String, dynamic> json) => OfflineLesson(
        lessonId: json['lessonId'] as String,
        courseId: json['courseId'] as String,
        courseTitle: json['courseTitle'] as String,
        moduleTitle: json['moduleTitle'] as String,
        lessonTitle: json['lessonTitle'] as String,
        content: json['content'] as String,
        downloadedAt: DateTime.parse(json['downloadedAt'] as String),
      );
}
