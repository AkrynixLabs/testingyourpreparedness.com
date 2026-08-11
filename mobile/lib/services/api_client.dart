import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/exam.dart';
import '../models/exam_attempt.dart';
import '../models/result_detail.dart';
import '../models/user.dart';
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

  /// This Next.js app's dev port. Swap for the real deployed URL once one
  /// exists - kept as a single const rather than an env-driven config since
  /// there's only one environment to point at so far.
  static const String baseUrl = 'http://localhost:3000';

  Future<AppUser> login({required String email, required String password}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/mobile/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final body = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, body['error'] as String? ?? 'Login failed.');
    }

    await TokenStorage.instance.saveToken(body['token'] as String);
    return AppUser.fromJson(body['user'] as Map<String, dynamic>);
  }

  Future<StudentExams> getExams() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/mobile/exams'),
      headers: await _authHeaders(),
    );

    final body = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, body['error'] as String? ?? 'Could not load exams.');
    }
    return StudentExams.fromJson(body);
  }

  Future<StudentProfile> getProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/mobile/me'),
      headers: await _authHeaders(),
    );

    final body = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, body['error'] as String? ?? 'Could not load profile.');
    }
    return StudentProfile.fromJson(body);
  }

  Future<ExamStart> startExam(String assessmentId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/mobile/exams/$assessmentId/start'),
      headers: await _authHeaders(),
    );

    final body = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, body['error'] as String? ?? 'This exam isn\'t available right now.');
    }
    return ExamStart.fromJson(body);
  }

  /// Fire-and-forget by design (matches the server's own contract - always
  /// 200s, never blocks the exam) - callers should not await this inline in
  /// a way that stalls the UI, and should swallow any transport error since
  /// there's nothing meaningful to show the student mid-exam for it.
  Future<void> recordTabSwitch(String attemptId) async {
    try {
      await http.post(
        Uri.parse('$baseUrl/api/mobile/attempts/$attemptId/tab-switch'),
        headers: await _authHeaders(),
      );
    } catch (_) {
      // Silent by design - see doc comment above.
    }
  }

  Future<String> submitAttempt({
    required String attemptId,
    required Map<String, int> answers,
    required List<String> flaggedQuestionIds,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/mobile/attempts/$attemptId/submit'),
      headers: await _authHeaders(),
      body: jsonEncode({'answers': answers, 'flaggedQuestionIds': flaggedQuestionIds}),
    );

    final body = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, body['error'] as String? ?? 'Could not submit your exam.');
    }
    return body['attemptId'] as String;
  }

  Future<ResultDetail> getResult(String attemptId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/mobile/results/$attemptId'),
      headers: await _authHeaders(),
    );

    final body = _decode(response);
    if (response.statusCode != 200) {
      throw ApiException(response.statusCode, body['error'] as String? ?? 'Could not load your result.');
    }
    return ResultDetail.fromJson(body);
  }

  Future<void> logout() => TokenStorage.instance.clearToken();

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
