// Mirrors lib/student/courses.ts's CourseCatalogRow/CourseDetail/MyCourseRow/
// LearnCourse types (returned by GET /api/mobile/courses/**).

/// A real Program (BECE/WASSCE/Nursing/University Entrance/Digital Skills),
/// backing the catalog's program filter - GET /api/mobile/courses/programs.
class ProgramOption {
  final String id;
  final String name;
  const ProgramOption({required this.id, required this.name});

  factory ProgramOption.fromJson(Map<String, dynamic> json) =>
      ProgramOption(id: json['id'] as String, name: json['name'] as String);
}

class CourseCatalogRow {
  final String id;
  final String title;
  final String description;
  final String? programId;
  final String? programName;
  final int price;
  final String? thumbnailUrl;
  final String tutorName;
  final int studentCount;
  final int moduleCount;
  final bool isEnrolled;
  final int reviewCount;
  final num? averageRating;

  const CourseCatalogRow({
    required this.id,
    required this.title,
    required this.description,
    this.programId,
    this.programName,
    required this.price,
    this.thumbnailUrl,
    required this.tutorName,
    required this.studentCount,
    required this.moduleCount,
    required this.isEnrolled,
    required this.reviewCount,
    this.averageRating,
  });

  factory CourseCatalogRow.fromJson(Map<String, dynamic> json) => CourseCatalogRow(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        programId: json['programId'] as String?,
        programName: json['programName'] as String?,
        price: json['price'] as int,
        thumbnailUrl: json['thumbnailUrl'] as String?,
        tutorName: json['tutorName'] as String,
        studentCount: json['studentCount'] as int,
        moduleCount: json['moduleCount'] as int,
        isEnrolled: json['isEnrolled'] as bool,
        reviewCount: json['reviewCount'] as int,
        averageRating: json['averageRating'] as num?,
      );
}

class CourseLesson {
  final String id;
  final String title;
  final String type;
  const CourseLesson({required this.id, required this.title, required this.type});

  factory CourseLesson.fromJson(Map<String, dynamic> json) =>
      CourseLesson(id: json['id'] as String, title: json['title'] as String, type: json['type'] as String);
}

class CourseModule {
  final String id;
  final String title;
  final List<CourseLesson> lessons;
  const CourseModule({required this.id, required this.title, required this.lessons});

  factory CourseModule.fromJson(Map<String, dynamic> json) => CourseModule(
        id: json['id'] as String,
        title: json['title'] as String,
        lessons: (json['lessons'] as List<dynamic>).map((e) => CourseLesson.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

class CourseReview {
  final String id;
  final String studentName;
  final int rating;
  final String? comment;
  final DateTime createdAt;
  final bool isMine;

  const CourseReview({
    required this.id,
    required this.studentName,
    required this.rating,
    this.comment,
    required this.createdAt,
    required this.isMine,
  });

  factory CourseReview.fromJson(Map<String, dynamic> json) => CourseReview(
        id: json['id'] as String,
        studentName: json['studentName'] as String,
        rating: json['rating'] as int,
        comment: json['comment'] as String?,
        createdAt: DateTime.parse(json['createdAt'] as String),
        isMine: json['isMine'] as bool,
      );
}

class MyCourseReview {
  final int rating;
  final String comment;
  const MyCourseReview({required this.rating, required this.comment});

  factory MyCourseReview.fromJson(Map<String, dynamic> json) =>
      MyCourseReview(rating: json['rating'] as int, comment: json['comment'] as String);
}

// Course-scoped group session (every enrolled student can join, not a 1:1
// tutor/student booking) - mirrors lib/student/courses.ts's CourseDetail.virtualSessions.
// dailyRoomUrl/externalMeetingUrl are only meaningful once enrolled - the
// server returns them regardless, same "gate in the view" pattern the web
// app already uses for reviews/myReview.
class CourseVirtualSession {
  final String id;
  final String title;
  final String? description;
  final DateTime scheduledAt;
  final int durationMinutes;
  final String mode;
  final String? dailyRoomUrl;
  final String? externalMeetingUrl;

  const CourseVirtualSession({
    required this.id,
    required this.title,
    this.description,
    required this.scheduledAt,
    required this.durationMinutes,
    required this.mode,
    this.dailyRoomUrl,
    this.externalMeetingUrl,
  });

  String? get joinUrl => mode == 'daily' ? dailyRoomUrl : externalMeetingUrl;

  factory CourseVirtualSession.fromJson(Map<String, dynamic> json) => CourseVirtualSession(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String?,
        scheduledAt: DateTime.parse(json['scheduledAt'] as String),
        durationMinutes: json['durationMinutes'] as int,
        mode: json['mode'] as String,
        dailyRoomUrl: json['dailyRoomUrl'] as String?,
        externalMeetingUrl: json['externalMeetingUrl'] as String?,
      );
}

class CourseDetail {
  final String id;
  final String title;
  final String description;
  final String? programId;
  final String? programName;
  final int price;
  final String tutorName;
  final String? tutorHeadline;
  final String? tutorBio;
  final int studentCount;
  final List<CourseModule> modules;
  final bool isEnrolled;
  final num? averageRating;
  final List<CourseReview> reviews;
  final MyCourseReview? myReview;
  final List<CourseVirtualSession> virtualSessions;

  const CourseDetail({
    required this.id,
    required this.title,
    required this.description,
    this.programId,
    this.programName,
    required this.price,
    required this.tutorName,
    this.tutorHeadline,
    this.tutorBio,
    required this.studentCount,
    required this.modules,
    required this.isEnrolled,
    this.averageRating,
    required this.reviews,
    this.myReview,
    this.virtualSessions = const [],
  });

  factory CourseDetail.fromJson(Map<String, dynamic> json) => CourseDetail(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        programId: json['programId'] as String?,
        programName: json['programName'] as String?,
        price: json['price'] as int,
        tutorName: json['tutorName'] as String,
        tutorHeadline: json['tutorHeadline'] as String?,
        tutorBio: json['tutorBio'] as String?,
        studentCount: json['studentCount'] as int,
        modules: (json['modules'] as List<dynamic>).map((e) => CourseModule.fromJson(e as Map<String, dynamic>)).toList(),
        isEnrolled: json['isEnrolled'] as bool,
        averageRating: json['averageRating'] as num?,
        reviews: (json['reviews'] as List<dynamic>).map((e) => CourseReview.fromJson(e as Map<String, dynamic>)).toList(),
        myReview: json['myReview'] != null ? MyCourseReview.fromJson(json['myReview'] as Map<String, dynamic>) : null,
        virtualSessions: json['virtualSessions'] != null
            ? (json['virtualSessions'] as List<dynamic>)
                .map((e) => CourseVirtualSession.fromJson(e as Map<String, dynamic>))
                .toList()
            : const [],
      );
}

class MyCourseRow {
  final String courseId;
  final String title;
  final String? programName;
  final String tutorName;
  final DateTime enrolledAt;
  final int lessonCount;
  final bool courseRemoved;

  const MyCourseRow({
    required this.courseId,
    required this.title,
    this.programName,
    required this.tutorName,
    required this.enrolledAt,
    required this.lessonCount,
    required this.courseRemoved,
  });

  factory MyCourseRow.fromJson(Map<String, dynamic> json) => MyCourseRow(
        courseId: json['courseId'] as String,
        title: json['title'] as String,
        programName: json['programName'] as String?,
        tutorName: json['tutorName'] as String,
        enrolledAt: DateTime.parse(json['enrolledAt'] as String),
        lessonCount: json['lessonCount'] as int,
        courseRemoved: json['courseRemoved'] as bool,
      );
}

class LearnLesson {
  final String id;
  final String title;
  final String type;
  final String? videoUrl;
  final String? content;
  // Added 2026-08-17 alongside web's Mux integration - null/non-"mux" means
  // this is the original external-URL video path (or an article lesson).
  final String? videoSource;
  final String? muxPlaybackId;
  final String? muxStatus;

  const LearnLesson({
    required this.id,
    required this.title,
    required this.type,
    this.videoUrl,
    this.content,
    this.videoSource,
    this.muxPlaybackId,
    this.muxStatus,
  });

  bool get isMuxVideo => videoSource == 'mux';
  bool get isMuxReady => isMuxVideo && muxStatus == 'ready' && muxPlaybackId != null;
  String? get muxHlsUrl => isMuxReady ? 'https://stream.mux.com/$muxPlaybackId.m3u8' : null;

  factory LearnLesson.fromJson(Map<String, dynamic> json) => LearnLesson(
        id: json['id'] as String,
        title: json['title'] as String,
        type: json['type'] as String,
        videoUrl: json['videoUrl'] as String?,
        content: json['content'] as String?,
        videoSource: json['videoSource'] as String?,
        muxPlaybackId: json['muxPlaybackId'] as String?,
        muxStatus: json['muxStatus'] as String?,
      );
}

class LearnModule {
  final String id;
  final String title;
  final List<LearnLesson> lessons;
  const LearnModule({required this.id, required this.title, required this.lessons});

  factory LearnModule.fromJson(Map<String, dynamic> json) => LearnModule(
        id: json['id'] as String,
        title: json['title'] as String,
        lessons: (json['lessons'] as List<dynamic>).map((e) => LearnLesson.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

class LearnCourse {
  final String id;
  final String title;
  final List<LearnModule> modules;
  const LearnCourse({required this.id, required this.title, required this.modules});

  factory LearnCourse.fromJson(Map<String, dynamic> json) => LearnCourse(
        id: json['id'] as String,
        title: json['title'] as String,
        modules: (json['modules'] as List<dynamic>).map((e) => LearnModule.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

class CoursePurchaseInit {
  final String authorizationUrl;
  final String reference;
  const CoursePurchaseInit({required this.authorizationUrl, required this.reference});

  factory CoursePurchaseInit.fromJson(Map<String, dynamic> json) =>
      CoursePurchaseInit(authorizationUrl: json['authorizationUrl'] as String, reference: json['reference'] as String);
}
