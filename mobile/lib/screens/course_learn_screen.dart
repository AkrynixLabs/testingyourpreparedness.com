import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/course.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';

/// Mirrors app/student/courses/[id]/learn/lesson-viewer.tsx at the behavior
/// level: a lesson list plus a content pane, video lessons opened externally
/// rather than embedded. The web app itself never embeds a player either
/// (its own lesson-viewer.tsx just links out with target="_blank") - lesson
/// videos can be any external host a tutor pasted in (YouTube, Vimeo, a raw
/// file), so matching the web app's own "open externally" behavior avoids
/// needing a single video package that can play all of them.
class CourseLearnScreen extends StatefulWidget {
  final String courseId;
  const CourseLearnScreen({super.key, required this.courseId});

  @override
  State<CourseLearnScreen> createState() => _CourseLearnScreenState();
}

class _CourseLearnScreenState extends State<CourseLearnScreen> {
  late Future<LearnCourse> _courseFuture;
  String? _activeLessonId;

  @override
  void initState() {
    super.initState();
    _courseFuture = ApiClient.instance.getLearnContent(widget.courseId);
  }

  void _retry() {
    setState(() =>
        _courseFuture = ApiClient.instance.getLearnContent(widget.courseId));
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Course')),
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
            final activeLesson = allLessons.firstWhere(
                (l) => l.id == _activeLessonId,
                orElse: () => allLessons.first);
            final colors = Theme.of(context).colorScheme;

            return Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(activeLesson.title,
                            style: Theme.of(context).textTheme.headlineSmall),
                        const SizedBox(height: 16),
                        if (activeLesson.type == 'video' &&
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
                                  "This lesson's video is hosted externally.",
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

class _LessonTile extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  const _LessonTile(
      {required this.title,
      required this.icon,
      required this.selected,
      required this.onTap});

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
              ],
            ),
          ),
        ),
      ),
    );
  }
}
