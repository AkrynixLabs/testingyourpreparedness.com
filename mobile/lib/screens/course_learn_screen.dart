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
    setState(() => _courseFuture = ApiClient.instance.getLearnContent(widget.courseId));
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
      body: FutureBuilder<LearnCourse>(
        future: _courseFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!, fallback: 'Could not load this course.'),
              onRetry: _retry,
            );
          }

          final course = snapshot.data!;
          final allLessons = course.modules.expand((m) => m.lessons).toList();
          if (allLessons.isEmpty) {
            return const EmptyView(message: 'This course has no lessons yet.');
          }
          _activeLessonId ??= allLessons.first.id;
          final activeLesson = allLessons.firstWhere((l) => l.id == _activeLessonId, orElse: () => allLessons.first);

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(activeLesson.title, style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 16),
                      if (activeLesson.type == 'video' && activeLesson.videoUrl != null) ...[
                        Text(
                          "This lesson's video is hosted externally.",
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          onPressed: () => _openVideo(activeLesson.videoUrl!),
                          icon: const Icon(Icons.open_in_new),
                          label: const Text('Watch Video'),
                        ),
                      ] else
                        Text(activeLesson.content ?? '', style: Theme.of(context).textTheme.bodyMedium),
                    ],
                  ),
                ),
              ),
              const Divider(height: 1),
              SizedBox(
                height: 220,
                child: ListView(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  children: [
                    for (int i = 0; i < course.modules.length; i++) ...[
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        child: Text(
                          'Module ${i + 1}: ${course.modules[i].title}',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                      for (final lesson in course.modules[i].lessons)
                        ListTile(
                          dense: true,
                          selected: lesson.id == _activeLessonId,
                          selectedTileColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
                          leading: Icon(lesson.type == 'video' ? Icons.play_circle_outline : Icons.article_outlined),
                          title: Text(lesson.title),
                          onTap: () => setState(() => _activeLessonId = lesson.id),
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
