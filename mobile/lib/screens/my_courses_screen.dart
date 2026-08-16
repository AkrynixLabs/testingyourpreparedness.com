import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/course.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';
import 'course_learn_screen.dart';

/// Mirrors app/student/courses/my/my-courses-view.tsx.
class MyCoursesScreen extends StatefulWidget {
  const MyCoursesScreen({super.key});

  @override
  State<MyCoursesScreen> createState() => _MyCoursesScreenState();
}

class _MyCoursesScreenState extends State<MyCoursesScreen> {
  late Future<List<MyCourseRow>> _coursesFuture;

  @override
  void initState() {
    super.initState();
    _coursesFuture = ApiClient.instance.getMyCourses();
  }

  Future<void> _refresh() async {
    setState(() => _coursesFuture = ApiClient.instance.getMyCourses());
    await _coursesFuture;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Courses')),
      body: FutureBuilder<List<MyCourseRow>>(
        future: _coursesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!,
                  fallback: 'Could not load your courses.'),
              onRetry: _refresh,
            );
          }

          final courses = snapshot.data!;
          if (courses.isEmpty) {
            return const EmptyView(
              message: "You haven't enrolled in any courses yet.",
              icon: Icons.school_outlined,
            );
          }

          final colors = Theme.of(context).colorScheme;

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: screenScrollPadding(context),
              itemCount: courses.length,
              itemBuilder: (context, index) {
                final course = courses[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: colors.primary.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(Icons.school_outlined,
                                    color: colors.primary, size: 22),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(course.title,
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleMedium),
                                    const SizedBox(height: 2),
                                    Text('by ${course.tutorName}',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall),
                                  ],
                                ),
                              ),
                              if (course.courseRemoved)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: colors.error,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'Unavailable',
                                    style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: colors.onError),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            '${course.lessonCount} lessons · Enrolled ${DateFormat.yMMMd().format(course.enrolledAt)}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const SizedBox(height: 14),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: course.courseRemoved
                                  ? null
                                  : () => Navigator.of(context).push(
                                        MaterialPageRoute(
                                            builder: (_) => CourseLearnScreen(
                                                courseId: course.courseId)),
                                      ),
                              icon: const Icon(Icons.play_circle_outline,
                                  size: 18),
                              label: const Text('Continue Learning'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
