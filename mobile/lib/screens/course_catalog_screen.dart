import 'package:flutter/material.dart';

import '../models/course.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';
import '../widgets/pagination_controls.dart';
import '../widgets/skeleton.dart';
import '../widgets/star_rating_display.dart';
import 'course_detail_screen.dart';

const _pageSize = 8;

/// Mirrors app/student/courses/course-catalog-view.tsx - search + program
/// filter over the published-course list, a card grid rendered as a list on
/// a phone-width screen. The program filter always shows every real active
/// Program (BECE/WASSCE/Nursing/University Entrance/Digital Skills), not
/// just categories derived from whatever courses happen to exist right now
/// - per the 2026-08-18 course-taxonomy decision (a free-text category could
/// never reliably answer "are there Nursing courses" when there are zero).
///
/// Card redesigned + paginated 2026-08-19 (user-requested, "the course UI
/// card is a little huge") - a compact horizontal row (small thumbnail +
/// stacked info) instead of a full-width 16:8 cover banner followed by a
/// title/description/rating/stats block. Paginated client-side, same
/// PaginationControls widget My Courses uses - the API returns the full
/// filtered list already, no server-side page/limit params exist yet.
class CourseCatalogScreen extends StatefulWidget {
  const CourseCatalogScreen({super.key});

  @override
  State<CourseCatalogScreen> createState() => _CourseCatalogScreenState();
}

class _CourseCatalogScreenState extends State<CourseCatalogScreen> {
  late Future<(List<CourseCatalogRow>, List<ProgramOption>)> _dataFuture;
  String _search = '';
  String _programId = 'all';
  int _page = 0;

  @override
  void initState() {
    super.initState();
    _dataFuture = _load();
  }

  Future<(List<CourseCatalogRow>, List<ProgramOption>)> _load() async {
    final results = await Future.wait(
        [ApiClient.instance.getCourses(), ApiClient.instance.getPrograms()]);
    return (
      results[0] as List<CourseCatalogRow>,
      results[1] as List<ProgramOption>
    );
  }

  Future<void> _refresh() async {
    setState(() {
      _dataFuture = _load();
      _page = 0;
    });
    await _dataFuture;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Browse Courses')),
      body: FutureBuilder<(List<CourseCatalogRow>, List<ProgramOption>)>(
        future: _dataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const CourseListSkeleton();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!,
                  fallback: 'Could not load courses.'),
              onRetry: _refresh,
            );
          }

          final (courses, programs) = snapshot.data!;
          final filtered = courses.where((c) {
            final query = _search.toLowerCase();
            final matchesSearch = query.isEmpty ||
                c.title.toLowerCase().contains(query) ||
                c.tutorName.toLowerCase().contains(query);
            final matchesProgram =
                _programId == 'all' || c.programId == _programId;
            return matchesSearch && matchesProgram;
          }).toList();
          String? selectedProgramName;
          if (_programId != 'all') {
            final matches = programs.where((p) => p.id == _programId);
            selectedProgramName = matches.isEmpty ? null : matches.first.name;
          }

          final totalPages = (filtered.length / _pageSize).ceil();
          final page = totalPages == 0 ? 0 : _page.clamp(0, totalPages - 1);
          final pageCourses =
              filtered.skip(page * _pageSize).take(_pageSize).toList();

          return RefreshIndicator(
            onRefresh: _refresh,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Column(
                    children: [
                      TextField(
                        decoration: const InputDecoration(
                          hintText: 'Search courses or tutors',
                          prefixIcon: Icon(Icons.search),
                        ),
                        onChanged: (value) => setState(() {
                          _search = value;
                          _page = 0;
                        }),
                      ),
                      if (programs.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        SizedBox(
                          height: 34,
                          width: double.infinity,
                          child: ListView(
                            scrollDirection: Axis.horizontal,
                            children: [
                              _CategoryPill(
                                label: 'All',
                                selected: _programId == 'all',
                                onTap: () => setState(() {
                                  _programId = 'all';
                                  _page = 0;
                                }),
                              ),
                              for (final p in programs)
                                _CategoryPill(
                                  label: p.name,
                                  selected: _programId == p.id,
                                  onTap: () => setState(() {
                                    _programId = p.id;
                                    _page = 0;
                                  }),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Expanded(
                  child: filtered.isEmpty
                      ? EmptyView(
                          message: _search.isNotEmpty
                              ? 'No courses match your search.'
                              : selectedProgramName != null
                                  ? 'No $selectedProgramName courses yet - check back soon.'
                                  : 'No courses match your search.',
                          icon: Icons.search_off)
                      : ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 4),
                          itemCount: pageCourses.length,
                          itemBuilder: (context, index) =>
                              _CourseCard(course: pageCourses[index]),
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

class _CategoryPill extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _CategoryPill(
      {required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected ? colors.primary : colors.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: selected ? colors.onPrimary : colors.onSurfaceVariant,
            ),
          ),
        ),
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final CourseCatalogRow course;
  const _CourseCard({required this.course});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
              builder: (_) => CourseDetailScreen(courseId: course.id)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _CourseThumbnail(course: course),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(course.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.titleSmall),
                        ),
                        if (course.isEnrolled) ...[
                          const SizedBox(width: 6),
                          Icon(Icons.check_circle,
                              size: 16, color: colors.primary),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text('by ${course.tutorName}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        if (course.averageRating != null) ...[
                          StarRatingDisplay(
                              rating: course.averageRating!, size: 12),
                          const SizedBox(width: 4),
                          Text(course.averageRating!.toStringAsFixed(1),
                              style: Theme.of(context).textTheme.bodySmall),
                          const SizedBox(width: 10),
                        ],
                        Icon(Icons.people_outline,
                            size: 12, color: colors.onSurfaceVariant),
                        const SizedBox(width: 3),
                        Text('${course.studentCount}',
                            style: Theme.of(context).textTheme.bodySmall),
                        const Spacer(),
                        Text(
                          course.price == 0 ? 'Free' : 'GHS ${course.price}',
                          style: Theme.of(context)
                              .textTheme
                              .labelLarge
                              ?.copyWith(
                                  color: colors.primary,
                                  fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A small square thumbnail - a real image when the tutor provided one,
/// otherwise a colored gradient derived from the course's program name.
/// Replaces the old full-width 16:8 cover banner (2026-08-19 compacting
/// pass) - a card-sized preview, not a hero image, for a scrolling list.
class _CourseThumbnail extends StatelessWidget {
  final CourseCatalogRow course;
  const _CourseThumbnail({required this.course});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final categoryLabel = course.programName ?? 'Uncategorized';
    final hue = (categoryLabel.hashCode % 360).abs().toDouble();
    final gradientColor = HSLColor.fromAHSL(
            1, hue, 0.55, colors.brightness == Brightness.dark ? 0.35 : 0.55)
        .toColor();

    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: SizedBox(
        width: 60,
        height: 60,
        child: course.thumbnailUrl != null
            ? Image.network(
                course.thumbnailUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _gradientFallback(gradientColor),
              )
            : _gradientFallback(gradientColor),
      ),
    );
  }

  Widget _gradientFallback(Color color) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [color, color.withValues(alpha: 0.65)],
        ),
      ),
      alignment: Alignment.center,
      child: Icon(Icons.play_circle_fill,
          size: 24, color: Colors.white.withValues(alpha: 0.85)),
    );
  }
}
