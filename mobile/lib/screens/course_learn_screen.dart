import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/course.dart';
import '../models/offline_lesson.dart';
import '../services/api_client.dart';
import '../services/offline_library.dart';
import '../theme/app_theme.dart';
import '../widgets/async_state_views.dart';
import '../widgets/mux_video_player.dart';
import 'offline_library_screen.dart';

/// Mirrors app/student/courses/[id]/learn/lesson-viewer.tsx at the behavior
/// level: a lesson list plus a content pane, video lessons opened externally
/// rather than embedded. The web app itself never embeds a player either
/// (its own lesson-viewer.tsx just links out with target="_blank") - lesson
/// videos can be any external host a tutor pasted in (YouTube, Vimeo, a raw
/// file), so matching the web app's own "open externally" behavior avoids
/// needing a single video package that can play all of them.
///
/// Offline downloads, added 2026-08-17 (scope confirmed with the user via
/// the web session): article-type lessons only - a video lesson is an
/// external URL, not a file this app can fetch and cache. When the live
/// fetch fails (no connectivity) and this course has at least one
/// previously-downloaded lesson, this screen falls back to an offline view
/// built entirely from OfflineLibrary instead of just showing an error.
class CourseLearnScreen extends StatefulWidget {
  final String courseId;
  const CourseLearnScreen({super.key, required this.courseId});

  @override
  State<CourseLearnScreen> createState() => _CourseLearnScreenState();
}

class _CourseLearnScreenState extends State<CourseLearnScreen> {
  late Future<LearnCourse> _courseFuture;
  String? _activeLessonId;
  Set<String> _downloadedLessonIds = {};
  List<OfflineLesson> _cachedLessonsForCourse = [];
  bool _loadingDownloadAction = false;
  Set<String> _completedLessonIds = {};
  bool _completedIdsLoaded = false;
  bool _markingComplete = false;

  @override
  void initState() {
    super.initState();
    _courseFuture = ApiClient.instance.getLearnContent(widget.courseId);
    _loadCachedLessons();
  }

  Future<void> _loadCachedLessons() async {
    final all = await OfflineLibrary.instance.listAll();
    final forThisCourse =
        all.where((l) => l.courseId == widget.courseId).toList();
    if (!mounted) return;
    setState(() {
      _cachedLessonsForCourse = forThisCourse;
      _downloadedLessonIds = forThisCourse.map((l) => l.lessonId).toSet();
    });
  }

  void _retry() {
    setState(() {
      _courseFuture = ApiClient.instance.getLearnContent(widget.courseId);
      _completedIdsLoaded = false;
    });
  }

  // Closes the course marketplace's standing "no lesson-completion tracking"
  // gap (2026-08-18) - also feeds the student dashboard's broadened study
  // streak. Optimistic, same pattern as the download toggle above - a
  // failed request just leaves the lesson unmarked next time this screen
  // reloads, not worth a rollback dance for a low-stakes toggle.
  Future<void> _markComplete(LearnLesson lesson) async {
    if (_markingComplete || _completedLessonIds.contains(lesson.id)) return;
    setState(() {
      _markingComplete = true;
      _completedLessonIds = {..._completedLessonIds, lesson.id};
    });
    HapticFeedback.selectionClick();
    try {
      await ApiClient.instance.markLessonComplete(lesson.id);
    } catch (_) {
      if (!mounted) return;
      setState(() => _completedLessonIds =
          _completedLessonIds.difference({lesson.id}));
    } finally {
      if (mounted) setState(() => _markingComplete = false);
    }
  }

  Future<void> _openVideo(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open this video link.')),
      );
    }
  }

  Future<void> _toggleDownload({
    required LearnCourse course,
    required String moduleTitle,
    required LearnLesson lesson,
  }) async {
    if (_loadingDownloadAction) return;
    setState(() => _loadingDownloadAction = true);
    HapticFeedback.selectionClick();

    final alreadyDownloaded = _downloadedLessonIds.contains(lesson.id);
    if (alreadyDownloaded) {
      await OfflineLibrary.instance.remove(lesson.id);
    } else {
      await OfflineLibrary.instance.download(OfflineLesson(
        lessonId: lesson.id,
        courseId: course.id,
        courseTitle: course.title,
        moduleTitle: moduleTitle,
        lessonTitle: lesson.title,
        content: lesson.content ?? '',
        downloadedAt: DateTime.now(),
      ));
    }

    await _loadCachedLessons();
    if (!mounted) return;
    setState(() => _loadingDownloadAction = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(alreadyDownloaded
            ? 'Removed from downloads'
            : 'Downloaded for offline reading'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Course'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download_done_outlined),
            tooltip: 'Downloaded lessons',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const OfflineLibraryScreen()),
            ),
          ),
        ],
      ),
      // SafeArea (not just scroll padding, unlike this app's other pushed
      // screens) - the lesson list below the video/reading pane is a fixed-
      // height Container, not a scrollable-to-the-bottom-of-content list,
      // so padding inside it wouldn't move the whole thing up above an
      // edge-to-edge device's gesture-nav bar the way it does elsewhere.
      body: SafeArea(
        child: FutureBuilder<LearnCourse>(
          future: _courseFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LoadingView();
            }
            if (snapshot.hasError) {
              if (_cachedLessonsForCourse.isNotEmpty) {
                return _OfflineFallbackView(
                    lessons: _cachedLessonsForCourse, onRetry: _retry);
              }
              return ErrorView(
                message: errorMessageFor(snapshot.error!,
                    fallback: 'Could not load this course.'),
                onRetry: _retry,
              );
            }

            final course = snapshot.data!;
            final allLessons = course.modules.expand((m) => m.lessons).toList();
            if (allLessons.isEmpty) {
              return const EmptyView(
                  message: 'This course has no lessons yet.',
                  icon: Icons.video_library_outlined);
            }
            _activeLessonId ??= allLessons.first.id;
            if (!_completedIdsLoaded) {
              _completedIdsLoaded = true;
              _completedLessonIds = allLessons
                  .where((l) => l.isCompleted)
                  .map((l) => l.id)
                  .toSet();
            }
            final activeLesson = allLessons.firstWhere(
                (l) => l.id == _activeLessonId,
                orElse: () => allLessons.first);
            final activeModule = course.modules.firstWhere(
                (m) => m.lessons.any((l) => l.id == activeLesson.id));
            final colors = Theme.of(context).colorScheme;
            final isArticle = activeLesson.type != 'video';
            final isDownloaded = _downloadedLessonIds.contains(activeLesson.id);

            return Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Text(activeLesson.title,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall),
                            ),
                            if (isArticle) ...[
                              const SizedBox(width: 8),
                              _DownloadButton(
                                downloaded: isDownloaded,
                                loading: _loadingDownloadAction,
                                onTap: () => _toggleDownload(
                                  course: course,
                                  moduleTitle: activeModule.title,
                                  lesson: activeLesson,
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 10),
                        _MarkCompleteButton(
                          completed:
                              _completedLessonIds.contains(activeLesson.id),
                          loading: _markingComplete,
                          onTap: () => _markComplete(activeLesson),
                        ),
                        const SizedBox(height: 16),
                        if (activeLesson.type == 'video' &&
                            activeLesson.isMuxVideo) ...[
                          _MuxLessonVideo(lesson: activeLesson),
                        ] else if (activeLesson.type == 'video' &&
                            activeLesson.videoUrl != null) ...[
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: colors.primary.withValues(alpha: 0.06),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                  color:
                                      colors.primary.withValues(alpha: 0.18)),
                            ),
                            child: Column(
                              children: [
                                Icon(Icons.play_circle_fill,
                                    size: 44, color: colors.primary),
                                const SizedBox(height: 12),
                                Text(
                                  "This lesson's video is hosted externally and needs a connection.",
                                  textAlign: TextAlign.center,
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                                const SizedBox(height: 14),
                                ElevatedButton.icon(
                                  onPressed: () =>
                                      _openVideo(activeLesson.videoUrl!),
                                  icon: const Icon(Icons.open_in_new, size: 18),
                                  label: const Text('Watch Video'),
                                ),
                              ],
                            ),
                          ),
                        ] else
                          Text(activeLesson.content ?? '',
                              style: Theme.of(context).textTheme.bodyMedium),
                      ],
                    ),
                  ),
                ),
                const Divider(height: 1),
                Container(
                  height: 220,
                  color: colors.surfaceContainerHighest.withValues(alpha: 0.3),
                  child: ListView(
                    padding:
                        const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                    children: [
                      for (int i = 0; i < course.modules.length; i++) ...[
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 6),
                          child: Text(
                            'Module ${i + 1}: ${course.modules[i].title}',
                            style: Theme.of(context).textTheme.titleSmall,
                          ),
                        ),
                        for (final lesson in course.modules[i].lessons)
                          _LessonTile(
                            title: lesson.title,
                            icon: lesson.type == 'video'
                                ? Icons.play_circle_outline
                                : Icons.article_outlined,
                            selected: lesson.id == _activeLessonId,
                            downloaded: lesson.type != 'video' &&
                                _downloadedLessonIds.contains(lesson.id),
                            requiresConnection: lesson.type == 'video',
                            completed:
                                _completedLessonIds.contains(lesson.id),
                            onTap: () =>
                                setState(() => _activeLessonId = lesson.id),
                          ),
                      ],
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

/// Shown instead of a plain error screen when the live fetch fails but this
/// course has previously-downloaded lessons to fall back to - a real
/// working offline mode, not just "connection failed."
class _OfflineFallbackView extends StatelessWidget {
  final List<OfflineLesson> lessons;
  final VoidCallback onRetry;
  const _OfflineFallbackView({required this.lessons, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          color: colors.tertiary.withValues(alpha: 0.12),
          child: Row(
            children: [
              Icon(Icons.cloud_off, size: 18, color: colors.onSurfaceVariant),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  "Couldn't reach TYP - showing your downloaded lessons instead.",
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
              TextButton(onPressed: onRetry, child: const Text('Retry')),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: lessons.length,
            itemBuilder: (context, index) {
              final lesson = lessons[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const Icon(Icons.article_outlined),
                  title: Text(lesson.lessonTitle),
                  subtitle: Text(lesson.moduleTitle),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                        builder: (_) =>
                            OfflineLessonReaderScreen(lesson: lesson)),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

/// Platform-hosted (Mux) lesson video, added 2026-08-17 alongside web's Mux
/// integration - branches on `muxStatus` since Mux's transcoding is async
/// (the webhook, not this screen, is the source of truth for "ready").
class _MuxLessonVideo extends StatelessWidget {
  final LearnLesson lesson;
  const _MuxLessonVideo({required this.lesson});

  @override
  Widget build(BuildContext context) {
    if (lesson.isMuxReady) {
      return MuxVideoPlayer(hlsUrl: lesson.muxHlsUrl!);
    }

    final colors = Theme.of(context).colorScheme;
    final errored = lesson.muxStatus == 'errored';
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        decoration: BoxDecoration(
          color: (errored ? colors.error : colors.primary).withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: (errored ? colors.error : colors.primary).withValues(alpha: 0.18)),
        ),
        alignment: Alignment.center,
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(errored ? Icons.error_outline : Icons.hourglass_top,
                size: 34, color: errored ? colors.error : colors.primary),
            const SizedBox(height: 10),
            Text(
              errored
                  ? "This video couldn't be processed. Let the tutor know."
                  : "This video is still processing - check back shortly.",
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}

class _MarkCompleteButton extends StatelessWidget {
  final bool completed;
  final bool loading;
  final VoidCallback onTap;
  const _MarkCompleteButton(
      {required this.completed, required this.loading, required this.onTap});

  @override
  Widget build(BuildContext context) {
    if (completed) {
      return OutlinedButton.icon(
        onPressed: null,
        icon: Icon(Icons.check_circle, size: 18, color: Theme.of(context).success),
        label: const Text('Completed'),
      );
    }
    return OutlinedButton(
      onPressed: loading ? null : onTap,
      child: loading
          ? const SizedBox(
              width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
          : const Text('Mark as complete'),
    );
  }
}

class _DownloadButton extends StatelessWidget {
  final bool downloaded;
  final bool loading;
  final VoidCallback onTap;
  const _DownloadButton(
      {required this.downloaded, required this.loading, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    if (loading) {
      return const Padding(
        padding: EdgeInsets.all(12),
        child: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2)),
      );
    }
    return IconButton(
      icon: Icon(downloaded ? Icons.download_done : Icons.download_outlined),
      color: downloaded ? colors.primary : colors.onSurfaceVariant,
      tooltip: downloaded
          ? 'Downloaded - tap to remove'
          : 'Download for offline reading',
      onPressed: onTap,
    );
  }
}

class _LessonTile extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool selected;
  final bool downloaded;
  final bool requiresConnection;
  final bool completed;
  final VoidCallback onTap;
  const _LessonTile({
    required this.title,
    required this.icon,
    required this.selected,
    required this.downloaded,
    required this.requiresConnection,
    required this.completed,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      child: Material(
        color: selected
            ? colors.primary.withValues(alpha: 0.1)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
            child: Row(
              children: [
                Icon(icon,
                    size: 18,
                    color: selected ? colors.primary : colors.onSurfaceVariant),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                      color: selected ? colors.primary : colors.onSurface,
                    ),
                  ),
                ),
                if (completed)
                  Icon(Icons.check_circle, size: 16, color: Theme.of(context).success)
                else if (downloaded)
                  Icon(Icons.download_done, size: 15, color: colors.primary)
                else if (requiresConnection)
                  Icon(Icons.wifi_off,
                      size: 14,
                      color: colors.onSurfaceVariant.withValues(alpha: 0.6)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
