// Mirrors lib/student/courses.ts's CourseCatalogRow/CourseDetail/MyCourseRow/
// LearnCourse types (returned by GET /api/mobile/courses/**).

class CourseCatalogRow {
  final String id;
  final String title;
  final String description;
  final String category;
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
    required this.category,
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
        category: json['category'] as String,
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

class CourseDetail {
  final String id;
  final String title;
  final String description;
  final String category;
  final int price;
  final String tutorName;
  final String? tutorHeadline;
  final String? tutorBio;
  final int studentCount;
  final List<CourseModule> modules;
  final bool isEnrolled;
  final num? averageRating;
  final List<CourseReview> reviews;

  const CourseDetail({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.price,
    required this.tutorName,
    this.tutorHeadline,
    this.tutorBio,
    required this.studentCount,
    required this.modules,
    required this.isEnrolled,
    this.averageRating,
    required this.reviews,
  });

  factory CourseDetail.fromJson(Map<String, dynamic> json) => CourseDetail(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String,
        category: json['category'] as String,
        price: json['price'] as int,
        tutorName: json['tutorName'] as String,
        tutorHeadline: json['tutorHeadline'] as String?,
        tutorBio: json['tutorBio'] as String?,
        studentCount: json['studentCount'] as int,
        modules: (json['modules'] as List<dynamic>).map((e) => CourseModule.fromJson(e as Map<String, dynamic>)).toList(),
        isEnrolled: json['isEnrolled'] as bool,
        averageRating: json['averageRating'] as num?,
        reviews: (json['reviews'] as List<dynamic>).map((e) => CourseReview.fromJson(e as Map<String, dynamic>)).toList(),
      );
}

class MyCourseRow {
  final String courseId;
  final String title;
  final String category;
  final String tutorName;
  final DateTime enrolledAt;
  final int lessonCount;
  final bool courseRemoved;

  const MyCourseRow({
    required this.courseId,
    required this.title,
    required this.category,
    required this.tutorName,
    required this.enrolledAt,
    required this.lessonCount,
    required this.courseRemoved,
  });

  factory MyCourseRow.fromJson(Map<String, dynamic> json) => MyCourseRow(
        courseId: json['courseId'] as String,
        title: json['title'] as String,
        category: json['category'] as String,
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

  const LearnLesson({required this.id, required this.title, required this.type, this.videoUrl, this.content});

  factory LearnLesson.fromJson(Map<String, dynamic> json) => LearnLesson(
        id: json['id'] as String,
        title: json['title'] as String,
        type: json['type'] as String,
        videoUrl: json['videoUrl'] as String?,
        content: json['content'] as String?,
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
