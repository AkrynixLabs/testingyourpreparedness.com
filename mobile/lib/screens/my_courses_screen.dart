import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/course.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';
import '../widgets/pagination_controls.dart';
import 'course_catalog_screen.dart';
import 'course_learn_screen.dart';

const _pageSize = 8;

/// Mirrors app/student/courses/my/my-courses-view.tsx. The bottom-nav
/// "Courses" tab's default screen (2026-08-19, user-requested) - the
/// graduation-cap icon reads as "your courses," not a storefront, so this
/// is now the landing view with browsing one tap away via the AppBar
/// action, rather than the other way around (the catalog previously owned
/// the tab and linked down to this screen via its own AppBar icon).
///
/// Card redesigned + paginated 2026-08-19 (user-requested, "the course UI
/// card is a little huge") - a single tappable compact row instead of a
/// large Card with a leading icon block, a full title/subtitle row, a
/// separate metadata line, and a full-width button below it. Paginated
/// client-side (the API already returns the full list; no page/limit
/// params exist yet on either platform, and this app's real course counts
/// don't remotely need server-side paging) - the same PaginationControls
/// widget backs Browse Courses too, not a second copy of the page-state UI.
class MyCoursesScreen extends StatefulWidget {
  const MyCoursesScreen({super.key});

  @override
  State<MyCoursesScreen> createState() => _MyCoursesScreenState();
}

class _MyCoursesScreenState extends State<MyCoursesScreen> {
  late Future<List<MyCourseRow>> _coursesFuture;
  int _page = 0;

  @override
  void initState() {
    super.initState();
    _coursesFuture = ApiClient.instance.getMyCourses();
  }

  Future<void> _refresh() async {
    setState(() {
      _coursesFuture = ApiClient.instance.getMyCourses();
      _page = 0;
    });
    await _coursesFuture;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Courses'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            tooltip: 'Browse Courses',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const CourseCatalogScreen()),
            ),
          ),
        ],
      ),
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
            return EmptyView(
              message: "You haven't enrolled in any courses yet.",
              icon: Icons.school_outlined,
              action: FilledButton.icon(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const CourseCatalogScreen()),
                ),
                icon: const Icon(Icons.search, size: 18),
                label: const Text('Browse Courses'),
              ),
            );
          }

          final totalPages = (courses.length / _pageSize).ceil();
          final page = _page.clamp(0, totalPages - 1);
          final pageCourses = courses.skip(page * _pageSize).take(_pageSize).toList();

          return RefreshIndicator(
            onRefresh: _refresh,
            child: Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: screenScrollPadding(context, bottom: 4),
                    itemCount: pageCourses.length,
                    itemBuilder: (context, index) =>
                        _MyCourseTile(course: pageCourses[index]),
                  ),
                ),
                PaginationControls(
                  page: page,
                  totalPages: totalPages,
                  onPageChanged: (p) => setState(() => _page = p),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _MyCourseTile extends StatelessWidget {
  final MyCourseRow course;
  const _MyCourseTile({required this.course});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: course.courseRemoved
            ? null
            : () => Navigator.of(context).push(
                  MaterialPageRoute(
                      builder: (_) =>
                          CourseLearnScreen(courseId: course.courseId)),
                ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: colors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.school_outlined,
                    color: colors.primary, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(course.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleSmall),
                    const SizedBox(height: 2),
                    Text(
                      '${course.lessonCount} lessons · ${DateFormat.yMMMd().format(course.enrolledAt)}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              if (course.courseRemoved)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
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
                )
              else
                Icon(Icons.chevron_right, color: colors.onSurfaceVariant),
            ],
          ),
        ),
      ),
    );
  }
}
