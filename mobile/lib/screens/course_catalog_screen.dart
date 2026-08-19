import 'package:flutter/material.dart';

import '../models/course.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';
import '../widgets/skeleton.dart';
import '../widgets/star_rating_display.dart';
import 'course_detail_screen.dart';
import 'my_courses_screen.dart';

/// Mirrors app/student/courses/course-catalog-view.tsx - search + program
/// filter over the published-course list, a card grid rendered as a list on
/// a phone-width screen. The program filter always shows every real active
/// Program (BECE/WASSCE/Nursing/University Entrance/Digital Skills), not
/// just categories derived from whatever courses happen to exist right now
/// - per the 2026-08-18 course-taxonomy decision (a free-text category could
/// never reliably answer "are there Nursing courses" when there are zero).
class CourseCatalogScreen extends StatefulWidget {
  const CourseCatalogScreen({super.key});

  @override
  State<CourseCatalogScreen> createState() => _CourseCatalogScreenState();
}

class _CourseCatalogScreenState extends State<CourseCatalogScreen> {
  late Future<(List<CourseCatalogRow>, List<ProgramOption>)> _dataFuture;
  String _search = '';
  String _programId = 'all';

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
    setState(() => _dataFuture = _load());
    await _dataFuture;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Browse Courses'),
        actions: [
          IconButton(
            icon: const Icon(Icons.school_outlined),
            tooltip: 'My Courses',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const MyCoursesScreen()),
            ),
          ),
        ],
      ),
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
                        onChanged: (value) => setState(() => _search = value),
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
                                onTap: () => setState(() => _programId = 'all'),
                              ),
                              for (final p in programs)
                                _CategoryPill(
                                  label: p.name,
                                  selected: _programId == p.id,
                                  onTap: () =>
                                      setState(() => _programId = p.id),
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
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                          itemCount: filtered.length,
                          itemBuilder: (context, index) =>
                              _CourseCard(course: filtered[index]),
                        ),
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
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Card(
        child: InkWell(
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(
                builder: (_) => CourseDetailScreen(courseId: course.id)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _CourseCover(course: course),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(course.title,
                        style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 6),
                    Text(
                      course.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 8),
                    Text('by ${course.tutorName}',
                        style: Theme.of(context).textTheme.bodySmall),
                    if (course.averageRating != null) ...[
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          StarRatingDisplay(
                              rating: course.averageRating!, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            '${course.averageRating!.toStringAsFixed(1)} (${course.reviewCount})',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Icon(Icons.menu_book_outlined,
                            size: 14, color: colors.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Text('${course.moduleCount} modules',
                            style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(width: 14),
                        Icon(Icons.people_outline,
                            size: 14, color: colors.onSurfaceVariant),
                        const SizedBox(width: 4),
                        Text('${course.studentCount} learners',
                            style: Theme.of(context).textTheme.bodySmall),
                        const Spacer(),
                        Text(
                          course.price == 0 ? 'Free' : 'GHS ${course.price}',
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(color: colors.primary),
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

/// A thumbnail image when the tutor provided one, otherwise a colored
/// gradient "cover" derived from the course's program name so cards never
/// look like a bare list-item even without real course artwork.
class _CourseCover extends StatelessWidget {
  final CourseCatalogRow course;
  const _CourseCover({required this.course});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final categoryLabel = course.programName ?? 'Uncategorized';
    final hue = (categoryLabel.hashCode % 360).abs().toDouble();
    final gradientColor = HSLColor.fromAHSL(
            1, hue, 0.55, colors.brightness == Brightness.dark ? 0.35 : 0.55)
        .toColor();

    return AspectRatio(
      aspectRatio: 16 / 8,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (course.thumbnailUrl != null)
            Image.network(
              course.thumbnailUrl!,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _gradientFallback(gradientColor),
            )
          else
            _gradientFallback(gradientColor),
          Positioned(
            top: 12,
            left: 12,
            child: _Badge(
                label: categoryLabel,
                background: Colors.black.withValues(alpha: 0.45),
                color: Colors.white),
          ),
          if (course.isEnrolled)
            Positioned(
              top: 12,
              right: 12,
              child: _Badge(
                label: 'Enrolled',
                background: colors.primary,
                color: colors.onPrimary,
                icon: Icons.check_circle,
              ),
            ),
        ],
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
          size: 40, color: Colors.white.withValues(alpha: 0.85)),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color background;
  final Color color;
  final IconData? icon;
  const _Badge(
      {required this.label,
      required this.background,
      required this.color,
      this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
          color: background, borderRadius: BorderRadius.circular(20)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: color),
            const SizedBox(width: 4)
          ],
          Text(label,
              style: TextStyle(
                  fontSize: 11.5, fontWeight: FontWeight.w700, color: color)),
        ],
      ),
    );
  }
}
