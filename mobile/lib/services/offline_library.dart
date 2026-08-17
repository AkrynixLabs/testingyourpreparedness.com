import 'dart:convert';
import 'dart:io';

import 'package:path_provider/path_provider.dart';

import '../models/offline_lesson.dart';

/// On-device storage for downloaded article lessons - one JSON file per
/// lesson under the app's own documents directory (sandboxed to this app,
/// not the shared media/downloads folder - no export/share surface, by the
/// user's explicit call, since a course lesson is paid content tied to a
/// real Enrollment and a shareable file would let one paying student
/// redistribute it to non-payers). Deliberately explicit-download-only, not
/// passive caching: an entry only exists here because a student tapped
/// "Download for offline" on it (see course_learn_screen.dart), so what's
/// available offline is always something they chose in advance on a real
/// connection, not whatever happened to load last.
class OfflineLibrary {
  OfflineLibrary._();
  static final OfflineLibrary instance = OfflineLibrary._();

  Future<Directory> _lessonsDir() async {
    final docs = await getApplicationDocumentsDirectory();
    final dir = Directory('${docs.path}/offline_lessons');
    if (!await dir.exists()) await dir.create(recursive: true);
    return dir;
  }

  Future<File> _fileFor(String lessonId) async {
    final dir = await _lessonsDir();
    // Lesson ids are opaque cuids from the backend, already filesystem-safe
    // (no slashes/special chars) - used directly as the filename.
    return File('${dir.path}/$lessonId.json');
  }

  Future<void> download(OfflineLesson lesson) async {
    final file = await _fileFor(lesson.lessonId);
    await file.writeAsString(jsonEncode(lesson.toJson()));
  }

  Future<void> remove(String lessonId) async {
    final file = await _fileFor(lessonId);
    if (await file.exists()) await file.delete();
  }

  Future<void> removeAllForCourse(String courseId) async {
    final all = await listAll();
    for (final lesson in all.where((l) => l.courseId == courseId)) {
      await remove(lesson.lessonId);
    }
  }

  Future<void> removeAll() async {
    final dir = await _lessonsDir();
    if (await dir.exists()) await dir.delete(recursive: true);
  }

  Future<bool> isDownloaded(String lessonId) async {
    final file = await _fileFor(lessonId);
    return file.exists();
  }

  Future<OfflineLesson?> read(String lessonId) async {
    final file = await _fileFor(lessonId);
    if (!await file.exists()) return null;
    try {
      return OfflineLesson.fromJson(
          jsonDecode(await file.readAsString()) as Map<String, dynamic>);
    } catch (_) {
      // A corrupted/partial file (e.g. app killed mid-write) shouldn't crash
      // the library view - treat it as not-downloaded rather than throwing.
      return null;
    }
  }

  /// Every downloaded lesson across every course - backs the offline
  /// library screen's grouped-by-course listing.
  Future<List<OfflineLesson>> listAll() async {
    final dir = await _lessonsDir();
    if (!await dir.exists()) return [];
    final files = await dir
        .list()
        .where((e) => e is File && e.path.endsWith('.json'))
        .toList();

    final lessons = <OfflineLesson>[];
    for (final entity in files) {
      try {
        final content = await File(entity.path).readAsString();
        lessons.add(OfflineLesson.fromJson(
            jsonDecode(content) as Map<String, dynamic>));
      } catch (_) {
        // Skip a corrupted entry rather than failing the whole listing.
      }
    }
    lessons.sort((a, b) => b.downloadedAt.compareTo(a.downloadedAt));
    return lessons;
  }

  /// Real on-disk size, for the "manage downloads" storage indicator -
  /// device storage is finite, so this needs to be a real number, not an
  /// estimate.
  Future<int> totalSizeBytes() async {
    final dir = await _lessonsDir();
    if (!await dir.exists()) return 0;
    var total = 0;
    await for (final entity in dir.list()) {
      if (entity is File) total += await entity.length();
    }
    return total;
  }
}
