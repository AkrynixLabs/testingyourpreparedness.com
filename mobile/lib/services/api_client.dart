import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../models/course.dart';
import '../models/dashboard.dart';
import '../models/exam.dart';
import '../models/exam_attempt.dart';
import '../models/result_detail.dart';
import '../models/subscription.dart';
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

  /// The server's own machine-readable `code` field, when it sends one
  /// (e.g. `"pending_approval"` from a 403 on login) - lets callers branch
  /// on a specific known error rather than string-matching `message`.
  final String? code;
  ApiException(this.statusCode, this.message, {this.code});

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  /// Configurable at build/run time via `--dart-define=API_BASE_URL=...`
  /// rather than hardcoded, so pointing this app at a different environment
  /// never needs a code change. Defaults to the real, live deployment - a
  /// plain `flutter build apk --release` with no extra flags produces a
  /// working app, not one silently pointed at localhost (a real bug this
  /// project shipped with until 2026-08-16: `localhost` on a real device
  /// means the device itself, so every API call would just fail to
  /// connect, with no obvious error explaining why).
  ///
  /// For local development against a Next.js dev server instead, override
  /// this explicitly:
  /// - Real device / iOS simulator on the same network: `--dart-define=API_BASE_URL=http://<your-machine-LAN-IP>:3000`
  /// - Android emulator specifically: `--dart-define=API_BASE_URL=http://10.0.2.2:3000`
  ///   (the emulator's documented alias for the host's own loopback - plain
  ///   `localhost` there resolves to the emulator itself, not the host).
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://testingyourpreparedness.com',
  );

  // Guards against a redirect-to-login storm when several in-flight calls
  // (e.g. the exams list and a profile fetch) all 401 around the same time
  // off one stale token - only the first one actually navigates.
  bool _handlingUnauthorized = false;

  Future<AppUser> login(
      {required String email, required String password}) async {
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
      throw ApiException(
        response.statusCode,
        body['error'] as String? ?? 'Login failed.',
        code: body['code'] as String?,
      );
    }

    await TokenStorage.instance.saveToken(body['token'] as String);
    final user = AppUser.fromJson(body['user'] as Map<String, dynamic>);
    await TokenStorage.instance
        .saveCachedUser(id: user.id, name: user.name, email: user.email);
    return user;
  }

  /// Reachable from LoginScreen's "email_not_verified" error state - no
  /// token exists yet at this point, so not routed through
  /// _authorizedRequest. Always resolves the same way regardless of whether
  /// the address exists or is already verified (matches the web action's
  /// account-enumeration-safe shape).
  Future<void> resendVerificationEmail(String email) async {
    await http.post(
      Uri.parse('$baseUrl/api/mobile/auth/resend-verification'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );
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
      throw ApiException(response.statusCode,
          body['error'] as String? ?? 'Invalid invite code.');
    }
    return VerifiedSchool.fromJson(body);
  }

  /// Step 2 - creates the account. `agreeTerms` is required server-side
  /// (matches the web join page's disabled-until-checked submit button).
  /// Updated 2026-08-16: no longer signs the student in - joining now
  /// always lands "pending" until a school admin approves it, so this
  /// returns a confirmation message instead of a token/user.
  Future<JoinSchoolResult> joinSchool({
    required String schoolCode,
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required bool agreeTerms,
    required bool subscribeNewsletter,
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
        'agreeTerms': agreeTerms,
        'subscribeNewsletter': subscribeNewsletter,
      }),
    );
    final body = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode,
          body['error'] as String? ?? 'Could not create your account.');
    }

    return JoinSchoolResult.fromJson(body);
  }

  Future<StudentExams> getExams() async {
    final body = await _authorizedRequest('GET', '/api/mobile/exams',
        fallback: 'Could not load exams.');
    return StudentExams.fromJson(body);
  }

  Future<StudentProfile> getProfile() async {
    final body = await _authorizedRequest('GET', '/api/mobile/me',
        fallback: 'Could not load profile.');
    return StudentProfile.fromJson(body);
  }

  Future<StudentDashboard> getDashboard() async {
    final body = await _authorizedRequest('GET', '/api/mobile/dashboard',
        fallback: 'Could not load your dashboard.');
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
      await _authorizedRequest(
          'POST', '/api/mobile/attempts/$attemptId/tab-switch',
          fallback: 'Tab switch not recorded.');
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
    final body = await _authorizedRequest(
        'GET', '/api/mobile/results/$attemptId',
        fallback: 'Could not load your result.');
    return ResultDetail.fromJson(body);
  }

  Future<List<CourseCatalogRow>> getCourses() async {
    final body = await _authorizedRequest('GET', '/api/mobile/courses',
        fallback: 'Could not load courses.');
    return (body['courses'] as List<dynamic>)
        .map((e) => CourseCatalogRow.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<MyCourseRow>> getMyCourses() async {
    final body = await _authorizedRequest('GET', '/api/mobile/courses/my',
        fallback: 'Could not load your courses.');
    return (body['courses'] as List<dynamic>)
        .map((e) => MyCourseRow.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<CourseDetail> getCourseDetail(String courseId) async {
    final body = await _authorizedRequest(
        'GET', '/api/mobile/courses/$courseId',
        fallback: 'Could not load this course.');
    return CourseDetail.fromJson(body);
  }

  /// Upsert, not a one-time submission - matches submitCourseReviewForStudent's
  /// own contract (a student can revise their rating/comment later).
  Future<void> submitCourseReview(
      {required String courseId,
      required int rating,
      required String comment}) async {
    await _authorizedRequest(
      'POST',
      '/api/mobile/courses/$courseId/review',
      body: {'rating': rating, 'comment': comment},
      fallback: 'Failed to submit review.',
    );
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

  /// Mirrors app/student/settings/page.tsx's subscriptionInfo - throws a 400
  /// ApiException for a school-provisioned student (no personal billing),
  /// which UpgradePlanScreen shows as a dedicated message rather than a
  /// generic error.
  Future<SubscriptionInfo> getSubscriptionInfo() async {
    final body = await _authorizedRequest(
      'GET',
      '/api/mobile/subscription',
      fallback: 'Could not load your subscription.',
    );
    return SubscriptionInfo.fromJson(body);
  }

  Future<SubscriptionCheckoutInit> initializeSubscriptionCheckout({
    required String planId,
    required String billingCycle,
  }) async {
    final body = await _authorizedRequest(
      'POST',
      '/api/mobile/subscription/checkout',
      body: {'planId': planId, 'billingCycle': billingCycle},
      fallback: 'Could not start checkout.',
    );
    return SubscriptionCheckoutInit.fromJson(body);
  }

  Future<String> verifySubscriptionCheckout(String reference) async {
    final body = await _authorizedRequest(
      'GET',
      '/api/mobile/subscription/verify?reference=${Uri.encodeQueryComponent(reference)}',
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

  /// Mirrors the web Settings page's "Delete My Account" action - same
  /// 30-day grace period, same confirmation email, via the shared
  /// lib/account-deletion.ts function underneath. Returns the scheduled
  /// deletion date so the caller can update its UI without a second fetch.
  Future<DateTime> requestAccountDeletion() async {
    final body = await _authorizedRequest(
      'POST',
      '/api/mobile/account/delete',
      fallback: 'Could not schedule account deletion.',
    );
    return DateTime.parse(body['scheduledDeletionAt'] as String);
  }

  Future<void> cancelAccountDeletion() async {
    await _authorizedRequest(
      'POST',
      '/api/mobile/account/delete/cancel',
      fallback: 'Could not cancel account deletion.',
    );
  }

  /// Registers/refreshes this device's FCM token against the signed-in
  /// student - called on login and on every cold start (see
  /// PushNotificationService), not just once, since FCM can reissue a token
  /// (reinstall, rotation) and a stale token would otherwise silently stop
  /// receiving push forever.
  Future<void> registerPushToken(
      {required String token, required String platform}) async {
    await _authorizedRequest(
      'POST',
      '/api/mobile/push/register',
      body: {'token': token, 'platform': platform},
      fallback: 'Could not register for notifications.',
    );
  }

  /// Best-effort, called just before logout clears the local session - a
  /// signed-out device shouldn't keep receiving push for the account it
  /// just left. Not routed through the throwing _authorizedRequest failure
  /// path in a way that could block logout itself; callers should swallow
  /// any error here (logging out must always succeed even if this doesn't).
  Future<void> unregisterPushToken(String token) async {
    await _authorizedRequest(
      'POST',
      '/api/mobile/push/unregister',
      body: {'token': token},
      fallback: 'Could not unregister this device.',
    );
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
        : await http.post(uri,
            headers: headers, body: body != null ? jsonEncode(body) : null);

    if (response.statusCode == 401) {
      await _handleUnauthorized();
    }

    final decoded = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(
        response.statusCode,
        decoded['error'] as String? ?? fallback,
        code: decoded['code'] as String?,
      );
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
        MaterialPageRoute(
            builder: (_) => const LoginScreen(sessionExpired: true)),
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
