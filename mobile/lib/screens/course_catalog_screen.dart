import 'package:flutter/material.dart';

import '../models/course.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';
import '../widgets/star_rating_display.dart';
import 'course_detail_screen.dart';
import 'my_courses_screen.dart';

/// Mirrors app/student/courses/course-catalog-view.tsx - search + category
/// filter over the published-course list, a card grid rendered as a list on
/// a phone-width screen.
class CourseCatalogScreen extends StatefulWidget {
  const CourseCatalogScreen({super.key});

  @override
  State<CourseCatalogScreen> createState() => _CourseCatalogScreenState();
}

class _CourseCatalogScreenState extends State<CourseCatalogScreen> {
  late Future<List<CourseCatalogRow>> _coursesFuture;
  String _search = '';
  String _category = 'all';

  @override
  void initState() {
    super.initState();
    _coursesFuture = ApiClient.instance.getCourses();
  }

  Future<void> _refresh() async {
    setState(() => _coursesFuture = ApiClient.instance.getCourses());
    await _coursesFuture;
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
      body: FutureBuilder<List<CourseCatalogRow>>(
        future: _coursesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!, fallback: 'Could not load courses.'),
              onRetry: _refresh,
            );
          }

          final courses = snapshot.data!;
          final categories = courses.map((c) => c.category).toSet().toList()..sort();
          final filtered = courses.where((c) {
            final query = _search.toLowerCase();
            final matchesSearch = query.isEmpty || c.title.toLowerCase().contains(query) || c.tutorName.toLowerCase().contains(query);
            final matchesCategory = _category == 'all' || c.category == _category;
            return matchesSearch && matchesCategory;
          }).toList();

          return RefreshIndicator(
            onRefresh: _refresh,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      TextField(
                        decoration: const InputDecoration(
                          hintText: 'Search courses or tutors...',
                          prefixIcon: Icon(Icons.search),
                        ),
                        onChanged: (value) => setState(() => _search = value),
                      ),
                      if (categories.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        SizedBox(
                          width: double.infinity,
                          child: DropdownButtonFormField<String>(
                            initialValue: _category,
                            items: [
                              const DropdownMenuItem(value: 'all', child: Text('All Categories')),
                              ...categories.map((c) => DropdownMenuItem(value: c, child: Text(c))),
                            ],
                            onChanged: (value) => setState(() => _category = value ?? 'all'),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Expanded(
                  child: filtered.isEmpty
                      ? const EmptyView(message: 'No courses match your search.')
                      : ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                          itemCount: filtered.length,
                          itemBuilder: (context, index) => _CourseCard(course: filtered[index]),
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

class _CourseCard extends StatelessWidget {
  final CourseCatalogRow course;
  const _CourseCard({required this.course});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => CourseDetailScreen(courseId: course.id)),
        ),
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
                  if (course.isEnrolled)
                    Chip(
                      avatar: const Icon(Icons.check_circle, size: 14, color: Colors.white),
                      label: const Text('Enrolled', style: TextStyle(fontSize: 12, color: Colors.white)),
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      padding: EdgeInsets.zero,
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Text(course.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
              const SizedBox(height: 6),
              Text(
                course.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 4),
              Text('by ${course.tutorName}', style: Theme.of(context).textTheme.bodySmall),
              if (course.averageRating != null) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    StarRatingDisplay(rating: course.averageRating!, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      '${course.averageRating!.toStringAsFixed(1)} (${course.reviewCount})',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.menu_book_outlined, size: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6)),
                      const SizedBox(width: 4),
                      Text('${course.moduleCount} modules', style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                  Row(
                    children: [
                      Icon(Icons.people_outline, size: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6)),
                      const SizedBox(width: 4),
                      Text('${course.studentCount} students', style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                course.price == 0 ? 'Free' : 'GHS ${course.price}',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Theme.of(context).colorScheme.primary),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
