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

/// Mirrors POST /api/mobile/auth/join/verify's response - the school a
/// student's invite code resolved to, shown for confirmation before they
/// fill in the rest of the join form.
class VerifiedSchool {
  final String schoolId;
  final String name;
  final String town;
  final String region;

  const VerifiedSchool({
    required this.schoolId,
    required this.name,
    required this.town,
    required this.region,
  });

  factory VerifiedSchool.fromJson(Map<String, dynamic> json) => VerifiedSchool(
        schoolId: json['schoolId'] as String,
        name: json['name'] as String,
        town: json['town'] as String,
        region: json['region'] as String,
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
