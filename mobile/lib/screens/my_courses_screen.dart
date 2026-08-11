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
              message: errorMessageFor(snapshot.error!, fallback: 'Could not load your courses.'),
              onRetry: _refresh,
            );
          }

          final courses = snapshot.data!;
          if (courses.isEmpty) {
            return const EmptyView(message: "You haven't enrolled in any courses yet.");
          }

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: courses.length,
              itemBuilder: (context, index) {
                final course = courses[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Chip(
                              label: Text(course.category, style: const TextStyle(fontSize: 12)),
                              padding: EdgeInsets.zero,
                              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            if (course.courseRemoved)
                              Chip(
                                label: const Text('No longer available', style: TextStyle(fontSize: 12, color: Colors.white)),
                                backgroundColor: Theme.of(context).colorScheme.error,
                                padding: EdgeInsets.zero,
                                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(course.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                        const SizedBox(height: 4),
                        Text('by ${course.tutorName}', style: Theme.of(context).textTheme.bodySmall),
                        Text(
                          '${course.lessonCount} lessons · Enrolled ${DateFormat.yMMMd().format(course.enrolledAt)}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: course.courseRemoved
                                ? null
                                : () => Navigator.of(context).push(
                                      MaterialPageRoute(builder: (_) => CourseLearnScreen(courseId: course.courseId)),
                                    ),
                            icon: const Icon(Icons.play_circle_outline),
                            label: const Text('Continue Learning'),
                          ),
                        ),
                      ],
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
