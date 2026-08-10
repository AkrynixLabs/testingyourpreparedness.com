/// Mirrors the `user` object returned by POST /api/mobile/auth/login.
class AppUser {
  final String id;
  final String name;
  final String email;
  final String role;

  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['id'] as String,
        name: json['name'] as String,
        email: json['email'] as String,
        role: json['role'] as String,
      );
}

/// Mirrors GET /api/mobile/me's response. Not required for v1 but built
/// alongside the other models since the endpoint already exists.
class StudentProfile {
  final String id;
  final String name;
  final String email;
  final String enrollmentType;
  final String? schoolName;
  final String? className;

  const StudentProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.enrollmentType,
    this.schoolName,
    this.className,
  });

  factory StudentProfile.fromJson(Map<String, dynamic> json) => StudentProfile(
        id: json['id'] as String,
        name: json['name'] as String,
        email: json['email'] as String,
        enrollmentType: json['enrollmentType'] as String,
        schoolName: json['schoolName'] as String?,
        className: json['className'] as String?,
      );
}
