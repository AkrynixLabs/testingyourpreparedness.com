import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../models/course.dart';
import '../models/dashboard.dart';
import '../models/exam.dart';
import '../models/exam_attempt.dart';
import '../models/result_detail.dart';
import '../models/user.dart';
import '../screens/login_screen.dart';
import 'navigation_service.dart';
import 'token_storage.dart';

/// Thrown for any non-2xx response, carrying the server's own `{ error }`
/// text (or a generic fallback) and the HTTP status - callers decide how to
/// present 401/403/429 differently rather than the client hardcoding UI copy.
class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  /// Configurable at build/run time via `--dart-define=API_BASE_URL=...`
  /// (e.g. `flutter run --dart-define=API_BASE_URL=https://typ.example.com`
  /// once a real deployment exists) rather than hardcoded, so pointing this
  /// app at staging/production never needs a code change. Defaults to this
  /// Next.js app's local dev port for local development.
  ///
  /// Note for local testing on an Android emulator specifically: `localhost`
  /// resolves to the emulator itself, not the host machine running the
  /// Next.js dev server - use `--dart-define=API_BASE_URL=http://10.0.2.2:3000`
  /// there instead (Android emulator's documented alias for the host loopback).
  /// iOS simulator and a real device on the same network don't need this.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );

  // Guards against a redirect-to-login storm when several in-flight calls
  // (e.g. the exams list and a profile fetch) all 401 around the same time
  // off one stale token - only the first one actually navigates.
  bool _handlingUnauthorized = false;

  Future<AppUser> login({required String email, required String password}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/mobile/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    // Deliberately not routed through _authorizedRequest - a 401 here means
    // "wrong password," not "your session expired," and must never trigger
    // the global logout-redirect (we're already on the login screen).
    final body = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, body['error'] as String? ?? 'Login failed.');
    }

    await TokenStorage.instance.saveToken(body['token'] as String);
    return AppUser.fromJson(body['user'] as Map<String, dynamic>);
  }

  /// Step 1 of the school-code join flow - looks up the school so the UI
  /// can show its name/town for confirmation before the student fills in
  /// the rest of the form. Not routed through _authorizedRequest (there's no
  /// token yet at this point in the flow).
  Future<VerifiedSchool> verifySchoolCode(String schoolCode) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/mobile/auth/join/verify'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'schoolCode': schoolCode}),
    );
    final body = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, body['error'] as String? ?? 'Invalid invite code.');
    }
    return VerifiedSchool.fromJson(body);
  }

  /// Step 2 - creates the account and signs the student straight in (same
  /// response shape as login), mirroring app/join's web flow.
  Future<AppUser> joinSchool({
    required String schoolCode,
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/mobile/auth/join'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'schoolCode': schoolCode,
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
      }),
    );
    final body = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, body['error'] as String? ?? 'Could not create your account.');
    }

    await TokenStorage.instance.saveToken(body['token'] as String);
    return AppUser.fromJson(body['user'] as Map<String, dynamic>);
  }

  Future<StudentExams> getExams() async {
    final body = await _authorizedRequest('GET', '/api/mobile/exams', fallback: 'Could not load exams.');
    return StudentExams.fromJson(body);
  }

  Future<StudentProfile> getProfile() async {
    final body = await _authorizedRequest('GET', '/api/mobile/me', fallback: 'Could not load profile.');
    return StudentProfile.fromJson(body);
  }

  Future<StudentDashboard> getDashboard() async {
    final body = await _authorizedRequest('GET', '/api/mobile/dashboard', fallback: 'Could not load your dashboard.');
    return StudentDashboard.fromJson(body);
  }

  Future<ExamStart> startExam(String assessmentId) async {
    final body = await _authorizedRequest(
      'POST',
      '/api/mobile/exams/$assessmentId/start',
      fallback: 'This exam isn\'t available right now.',
    );
    return ExamStart.fromJson(body);
  }

  /// Fire-and-forget by design (matches the server's own contract - always
  /// 200s once authenticated, never blocks the exam) - callers should not
  /// await this inline in a way that stalls the UI. Still routed through
  /// _authorizedRequest so a genuinely expired token bounces to login even
  /// from this background call, per the app-wide 401 rule; the try/catch
  /// here only swallows the *thrown* ApiException so a stale/bad attemptId
  /// never surfaces anything mid-exam, not the redirect side effect itself.
  Future<void> recordTabSwitch(String attemptId) async {
    try {
      await _authorizedRequest('POST', '/api/mobile/attempts/$attemptId/tab-switch', fallback: 'Tab switch not recorded.');
    } catch (_) {
      // Silent by design - see doc comment above.
    }
  }

  Future<String> submitAttempt({
    required String attemptId,
    required Map<String, int> answers,
    required List<String> flaggedQuestionIds,
  }) async {
    final body = await _authorizedRequest(
      'POST',
      '/api/mobile/attempts/$attemptId/submit',
      body: {'answers': answers, 'flaggedQuestionIds': flaggedQuestionIds},
      fallback: 'Could not submit your exam.',
    );
    return body['attemptId'] as String;
  }

  Future<ResultDetail> getResult(String attemptId) async {
    final body = await _authorizedRequest('GET', '/api/mobile/results/$attemptId', fallback: 'Could not load your result.');
    return ResultDetail.fromJson(body);
  }

  Future<List<CourseCatalogRow>> getCourses() async {
    final body = await _authorizedRequest('GET', '/api/mobile/courses', fallback: 'Could not load courses.');
    return (body['courses'] as List<dynamic>).map((e) => CourseCatalogRow.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<MyCourseRow>> getMyCourses() async {
    final body = await _authorizedRequest('GET', '/api/mobile/courses/my', fallback: 'Could not load your courses.');
    return (body['courses'] as List<dynamic>).map((e) => MyCourseRow.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<CourseDetail> getCourseDetail(String courseId) async {
    final body = await _authorizedRequest('GET', '/api/mobile/courses/$courseId', fallback: 'Could not load this course.');
    return CourseDetail.fromJson(body);
  }

  /// Returns `alreadyEnrolled` so a redundant tap (e.g. a double-submit)
  /// doesn't need to be treated as an error by the caller.
  Future<bool> enrollInFreeCourse(String courseId) async {
    final body = await _authorizedRequest(
      'POST',
      '/api/mobile/courses/$courseId/enroll',
      fallback: 'Could not enroll in this course.',
    );
    return body['alreadyEnrolled'] as bool;
  }

  Future<CoursePurchaseInit> initializeCoursePurchase(String courseId) async {
    final body = await _authorizedRequest(
      'POST',
      '/api/mobile/courses/$courseId/purchase',
      fallback: 'Could not start checkout.',
    );
    return CoursePurchaseInit.fromJson(body);
  }

  Future<String> verifyCoursePurchase(String reference) async {
    final body = await _authorizedRequest(
      'GET',
      '/api/mobile/courses/purchase/verify?reference=${Uri.encodeQueryComponent(reference)}',
      fallback: 'Could not confirm your payment.',
    );
    return body['status'] as String;
  }

  Future<LearnCourse> getLearnContent(String courseId) async {
    final body = await _authorizedRequest(
      'GET',
      '/api/mobile/courses/$courseId/learn',
      fallback: 'Could not load this course\'s lessons.',
    );
    return LearnCourse.fromJson(body);
  }

  Future<void> logout() => TokenStorage.instance.clearToken();

  /// Shared path for every authenticated call - decodes the response,
  /// triggers the app-wide "expired session -> back to login" redirect on a
  /// real 401 (never on other statuses; a 403/404/429 is a real, specific
  /// answer from the server, not an auth problem), then throws ApiException
  /// for any non-200 so callers keep their existing try/catch shape.
  Future<Map<String, dynamic>> _authorizedRequest(
    String method,
    String path, {
    Object? body,
    required String fallback,
  }) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = await _authHeaders();
    final response = method == 'GET'
        ? await http.get(uri, headers: headers)
        : await http.post(uri, headers: headers, body: body != null ? jsonEncode(body) : null);

    if (response.statusCode == 401) {
      await _handleUnauthorized();
    }

    final decoded = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, decoded['error'] as String? ?? fallback);
    }
    return decoded;
  }

  Future<void> _handleUnauthorized() async {
    if (_handlingUnauthorized) return;
    _handlingUnauthorized = true;
    try {
      await TokenStorage.instance.clearToken();
      final navigator = rootNavigatorKey.currentState;
      navigator?.pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginScreen(sessionExpired: true)),
        (route) => false,
      );
    } finally {
      _handlingUnauthorized = false;
    }
  }

  Future<Map<String, String>> _authHeaders() async {
    final token = await TokenStorage.instance.readToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Map<String, dynamic> _decode(http.Response response) {
    if (response.body.isEmpty) return {};
    try {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      return {};
    }
  }
}
