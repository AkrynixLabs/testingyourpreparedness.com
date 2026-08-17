import 'package:flutter/material.dart';

import '../models/offline_lesson.dart';
import '../services/offline_library.dart';
import '../widgets/app_dialogs.dart';
import '../widgets/async_state_views.dart';

/// Every lesson downloaded for offline reading, grouped by course - the
/// "manage downloads" screen device storage being finite makes worthwhile
/// to have from the start (confirmed with the user 2026-08-17), not just an
/// unbounded cache with no way to see or clear what's actually stored.
/// Reachable from a course's lesson-viewer app bar and from Settings.
class OfflineLibraryScreen extends StatefulWidget {
  const OfflineLibraryScreen({super.key});

  @override
  State<OfflineLibraryScreen> createState() => _OfflineLibraryScreenState();
}

class _OfflineLibraryScreenState extends State<OfflineLibraryScreen> {
  late Future<List<OfflineLesson>> _lessonsFuture;
  int _totalBytes = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _lessonsFuture = OfflineLibrary.instance.listAll();
    OfflineLibrary.instance.totalSizeBytes().then((bytes) {
      if (mounted) setState(() => _totalBytes = bytes);
    });
  }

  Future<void> _removeLesson(String lessonId) async {
    await OfflineLibrary.instance.remove(lessonId);
    setState(_load);
  }

  Future<void> _clearAll() async {
    final confirmed = await AppDialogs.confirm(
      context,
      title: 'Remove all downloads?',
      message:
          'Every downloaded lesson will be deleted from this device. You can download them again anytime you have a connection.',
      confirmLabel: 'Remove All',
      isDestructive: true,
      icon: Icons.delete_outline,
    );
    if (!confirmed) return;
    await OfflineLibrary.instance.removeAll();
    setState(_load);
  }

  String _formatBytes(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Downloaded Lessons')),
      body: FutureBuilder<List<OfflineLesson>>(
        future: _lessonsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          final lessons = snapshot.data ?? [];
          if (lessons.isEmpty) {
            return const EmptyView(
              message:
                  'No lessons downloaded yet.\nOpen a course and tap the download icon on an article lesson.',
              icon: Icons.download_outlined,
            );
          }

          final byCourse = <String, List<OfflineLesson>>{};
          for (final lesson in lessons) {
            byCourse.putIfAbsent(lesson.courseTitle, () => []).add(lesson);
          }

          return Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                color: colors.surfaceContainerHighest.withValues(alpha: 0.4),
                child: Row(
                  children: [
                    Icon(Icons.sd_storage_outlined,
                        size: 18, color: colors.onSurfaceVariant),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        '${lessons.length} lesson${lessons.length == 1 ? '' : 's'} · ${_formatBytes(_totalBytes)} on this device',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                    TextButton(
                        onPressed: _clearAll, child: const Text('Remove All')),
                  ],
                ),
              ),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    for (final entry in byCourse.entries) ...[
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8, top: 8),
                        child: Text(entry.key,
                            style: Theme.of(context).textTheme.titleMedium),
                      ),
                      for (final lesson in entry.value)
                        Card(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: ListTile(
                            leading: const Icon(Icons.article_outlined),
                            title: Text(lesson.lessonTitle),
                            subtitle: Text(lesson.moduleTitle),
                            trailing: IconButton(
                              icon: Icon(Icons.delete_outline,
                                  color: colors.error),
                              tooltip: 'Remove download',
                              onPressed: () => _removeLesson(lesson.lessonId),
                            ),
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (_) => OfflineLessonReaderScreen(
                                      lesson: lesson)),
                            ),
                          ),
                        ),
                    ],
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

/// Reads a single downloaded lesson's cached content - reachable both from
/// the offline library and from CourseLearnScreen's offline fallback view.
class OfflineLessonReaderScreen extends StatelessWidget {
  final OfflineLesson lesson;
  const OfflineLessonReaderScreen({super.key, required this.lesson});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(lesson.courseTitle)),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(lesson.moduleTitle,
                  style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 4),
              Text(lesson.lessonTitle,
                  style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 16),
              Text(lesson.content,
                  style: Theme.of(context).textTheme.bodyMedium),
            ],
          ),
        ),
      ),
    );
  }
}
