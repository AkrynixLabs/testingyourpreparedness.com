import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/course.dart';
import '../services/api_client.dart';
import '../theme/app_theme.dart';
import '../widgets/app_dialogs.dart';
import '../widgets/async_state_views.dart';
import '../widgets/star_rating_display.dart';
import 'course_learn_screen.dart';
import 'course_purchase_webview_screen.dart';

/// Mirrors app/student/courses/[id]/course-detail-purchase-view.tsx's
/// content (tutor info, curriculum, reviews) and its enroll/buy action,
/// including review submission/editing (closes the fast-follow flagged when
/// the course marketplace first landed on the Flutter client).
class CourseDetailScreen extends StatefulWidget {
  final String courseId;
  const CourseDetailScreen({super.key, required this.courseId});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  late Future<CourseDetail> _courseFuture;
  bool _enrolling = false;
  String? _enrollError;

  // Review form state - initialized once from course.myReview the first
  // time it loads (see _initReviewFormIfNeeded), then left alone across
  // FutureBuilder rebuilds so the student's in-progress edits aren't lost.
  bool _reviewFormInitialized = false;
  int _reviewRating = 0;
  final _reviewCommentController = TextEditingController();
  bool _reviewSubmitting = false;
  String? _reviewError;
  bool _reviewJustSaved = false;

  @override
  void initState() {
    super.initState();
    _courseFuture = ApiClient.instance.getCourseDetail(widget.courseId);
  }

  @override
  void dispose() {
    _reviewCommentController.dispose();
    super.dispose();
  }

  void _reload() {
    setState(() {
      _courseFuture = ApiClient.instance.getCourseDetail(widget.courseId);
      _enrollError = null;
      _reviewFormInitialized = false;
    });
  }

  Future<void> _onPullRefresh() async {
    _reload();
    // Swallow - the same future is also handed to FutureBuilder below, which
    // already renders ErrorView on a failure; this try/catch only exists so
    // RefreshIndicator's spinner stays visible until the fetch settles,
    // without an unhandled-rejection warning for the same error twice.
    try {
      await _courseFuture;
    } catch (_) {
      // Handled by FutureBuilder's own error branch.
    }
  }

  void _initReviewFormIfNeeded(CourseDetail course) {
    if (_reviewFormInitialized) return;
    _reviewFormInitialized = true;
    _reviewRating = course.myReview?.rating ?? 0;
    _reviewCommentController.text = course.myReview?.comment ?? '';
  }

  Future<void> _submitReview(CourseDetail course) async {
    if (_reviewRating < 1) {
      setState(() => _reviewError = 'Select a star rating.');
      return;
    }

    setState(() {
      _reviewSubmitting = true;
      _reviewError = null;
      _reviewJustSaved = false;
    });

    try {
      await ApiClient.instance.submitCourseReview(
        courseId: course.id,
        rating: _reviewRating,
        comment: _reviewCommentController.text,
      );
      if (!mounted) return;
      setState(() => _reviewJustSaved = true);
      _reload();
    } on ApiException catch (e) {
      setState(() => _reviewError = e.message);
    } catch (_) {
      setState(() => _reviewError = 'Failed to submit review.');
    } finally {
      if (mounted) setState(() => _reviewSubmitting = false);
    }
  }

  Future<void> _handleEnroll(CourseDetail course) async {
    setState(() {
      _enrolling = true;
      _enrollError = null;
    });

    try {
      if (course.price == 0) {
        await ApiClient.instance.enrollInFreeCourse(course.id);
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
              builder: (_) => CourseLearnScreen(courseId: course.id)),
        );
        return;
      }

      final init = await ApiClient.instance.initializeCoursePurchase(course.id);
      if (!mounted) return;
      final reference = await Navigator.of(context).push<String?>(
        MaterialPageRoute(
            builder: (_) => CoursePurchaseWebviewScreen(
                authorizationUrl: init.authorizationUrl)),
      );

      if (reference == null) {
        // Checkout was closed/cancelled before Paystack ever redirected back
        // - nothing to verify, no charge to have happened.
        setState(() => _enrolling = false);
        return;
      }

      final status = await ApiClient.instance.verifyCoursePurchase(reference);
      if (!mounted) return;
      await _showPurchaseOutcome(status);
      _reload();
    } on ApiException catch (e) {
      setState(() => _enrollError = e.message);
    } catch (_) {
      setState(() => _enrollError = 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _enrolling = false);
    }
  }

  Future<void> _joinSession(CourseVirtualSession session) async {
    final url = session.joinUrl;
    if (url == null) return;
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    // Opened externally, same as web's own "Upcoming Sessions" Join button
    // (a plain target="_blank" link, not an embedded call UI) - matches
    // course-detail-purchase-view.tsx's exact behavior rather than adding a
    // native Daily call embed, which wasn't decided/scoped here.
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open this session link.')),
      );
    }
  }

  Future<void> _showPurchaseOutcome(String status) {
    // Same 3 outcomes as the web checkout callback page - the webhook
    // (not this verify call) is the actual source of truth for the
    // Enrollment, so "success" here means "confirmed with Paystack," not
    // "you're enrolled yet" (there can be a short lag either way).
    final (title, message, icon, color) = switch (status) {
      'success' => (
          'Payment Successful',
          'Your enrollment is being activated.',
          Icons.check_circle,
          Theme.of(context).success,
        ),
      'failed' => (
          'Payment Not Completed',
          "You weren't charged. You can try again anytime.",
          Icons.error_outline,
          Theme.of(context).colorScheme.error,
        ),
      _ => (
          'Confirming Payment',
          "We couldn't confirm this payment's status directly - it may still be processing.",
          Icons.hourglass_top,
          Colors.amber,
        ),
    };

    return AppDialogs.info(context,
        title: title, message: message, icon: icon, iconColor: color);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Course')),
      body: FutureBuilder<CourseDetail>(
        future: _courseFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!,
                  fallback: 'Could not load this course.'),
              onRetry: _reload,
            );
          }

          final course = snapshot.data!;
          _initReviewFormIfNeeded(course);
          final totalLessons =
              course.modules.fold<int>(0, (sum, m) => sum + m.lessons.length);

          final colors = Theme.of(context).colorScheme;

          return RefreshIndicator(
            onRefresh: _onPullRefresh,
            child: ListView(
              padding: screenScrollPadding(context),
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                      color: colors.primary.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20)),
                  child: Text(
                    course.category,
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: colors.primary),
                  ),
                ),
                const SizedBox(height: 10),
                Text(course.title,
                    style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 8),
                Text(course.description,
                    style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(Icons.people_outline,
                        size: 15, color: colors.onSurfaceVariant),
                    const SizedBox(width: 4),
                    Text('${course.studentCount} students',
                        style: Theme.of(context).textTheme.bodySmall),
                    const SizedBox(width: 12),
                    Icon(Icons.menu_book_outlined,
                        size: 15, color: colors.onSurfaceVariant),
                    const SizedBox(width: 4),
                    Text(
                        '${course.modules.length} modules · $totalLessons lessons',
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
                if (course.averageRating != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      StarRatingDisplay(rating: course.averageRating!),
                      const SizedBox(width: 6),
                      Text(
                        '${course.averageRating!.toStringAsFixed(1)} (${course.reviews.length} review${course.reviews.length == 1 ? '' : 's'})',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 20),
                if (_enrollError != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Theme.of(context)
                          .colorScheme
                          .error
                          .withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(_enrollError!,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.error)),
                  ),
                  const SizedBox(height: 12),
                ],
                Container(
                  decoration: BoxDecoration(
                    color: colors.primary.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                        color: colors.primary.withValues(alpha: 0.2)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              course.price == 0
                                  ? 'Free'
                                  : 'GHS ${course.price}',
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineSmall
                                  ?.copyWith(color: colors.primary),
                            ),
                            Text('One-time purchase - lifetime access',
                                style: Theme.of(context).textTheme.bodySmall),
                          ],
                        ),
                        if (course.isEnrolled)
                          ElevatedButton.icon(
                            onPressed: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (_) =>
                                      CourseLearnScreen(courseId: course.id)),
                            ),
                            icon: const Icon(Icons.play_circle_outline),
                            label: const Text('Continue'),
                          )
                        else
                          ElevatedButton(
                            onPressed:
                                _enrolling ? null : () => _handleEnroll(course),
                            child: _enrolling
                                ? const SizedBox(
                                    height: 18,
                                    width: 18,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2, color: Colors.white),
                                  )
                                : Text(course.price == 0
                                    ? 'Enroll for Free'
                                    : 'Buy Course'),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('About the Tutor',
                            style: Theme.of(context).textTheme.headlineSmall),
                        const SizedBox(height: 8),
                        Text(course.tutorName,
                            style:
                                const TextStyle(fontWeight: FontWeight.w600)),
                        if (course.tutorHeadline != null)
                          Text(course.tutorHeadline!,
                              style: Theme.of(context).textTheme.bodySmall),
                        if (course.tutorBio != null) ...[
                          const SizedBox(height: 6),
                          Text(course.tutorBio!,
                              style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ],
                    ),
                  ),
                ),
                if (course.virtualSessions.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Upcoming Sessions',
                              style: Theme.of(context).textTheme.headlineSmall),
                          const SizedBox(height: 12),
                          for (final session in course.virtualSessions)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  border: Border.all(color: colors.outlineVariant),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 36,
                                      height: 36,
                                      decoration: BoxDecoration(
                                        color: colors.primary.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      alignment: Alignment.center,
                                      child: Icon(Icons.videocam_outlined,
                                          size: 18, color: colors.primary),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(session.title,
                                              style: const TextStyle(
                                                  fontWeight: FontWeight.w600, fontSize: 13),
                                              overflow: TextOverflow.ellipsis),
                                          const SizedBox(height: 2),
                                          Text(
                                            '${DateFormat.yMMMd().add_jm().format(session.scheduledAt)} · ${session.durationMinutes} min',
                                            style: Theme.of(context).textTheme.bodySmall,
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    if (course.isEnrolled && session.joinUrl != null)
                                      ElevatedButton.icon(
                                        onPressed: () => _joinSession(session),
                                        icon: const Icon(Icons.open_in_new, size: 16),
                                        label: const Text('Join'),
                                      )
                                    else
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 8, vertical: 5),
                                        decoration: BoxDecoration(
                                          color: colors.surfaceContainerHighest,
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(Icons.lock_outline,
                                                size: 12, color: colors.onSurfaceVariant),
                                            const SizedBox(width: 4),
                                            Text('Enrolled only',
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodySmall),
                                          ],
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Curriculum',
                            style: Theme.of(context).textTheme.headlineSmall),
                        const SizedBox(height: 12),
                        for (int i = 0; i < course.modules.length; i++)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                    'Module ${i + 1}: ${course.modules[i].title}',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w600)),
                                const SizedBox(height: 4),
                                for (final lesson in course.modules[i].lessons)
                                  Padding(
                                    padding:
                                        const EdgeInsets.only(left: 8, top: 2),
                                    child: Row(
                                      children: [
                                        Icon(
                                          lesson.type == 'video'
                                              ? Icons.play_circle_outline
                                              : Icons.article_outlined,
                                          size: 16,
                                          color: Theme.of(context)
                                              .colorScheme
                                              .onSurface
                                              .withValues(alpha: 0.6),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(lesson.title,
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Reviews',
                            style: Theme.of(context).textTheme.headlineSmall),
                        const SizedBox(height: 12),
                        if (course.isEnrolled) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              border: Border.all(
                                  color: Theme.of(context)
                                      .colorScheme
                                      .outlineVariant),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  course.myReview != null
                                      ? 'Edit your review'
                                      : 'Leave a review',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13),
                                ),
                                const SizedBox(height: 8),
                                if (_reviewError != null) ...[
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .error
                                          .withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(_reviewError!,
                                        style: TextStyle(
                                            color: Theme.of(context)
                                                .colorScheme
                                                .error,
                                            fontSize: 12)),
                                  ),
                                  const SizedBox(height: 8),
                                ],
                                if (_reviewJustSaved &&
                                    _reviewError == null) ...[
                                  Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context)
                                          .success
                                          .withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text('Review saved.',
                                        style: TextStyle(
                                            color: Theme.of(context).success,
                                            fontSize: 12)),
                                  ),
                                  const SizedBox(height: 8),
                                ],
                                StarRatingInput(
                                  value: _reviewRating,
                                  onChanged: (n) => setState(() {
                                    _reviewRating = n;
                                    _reviewJustSaved = false;
                                  }),
                                ),
                                const SizedBox(height: 8),
                                TextField(
                                  controller: _reviewCommentController,
                                  maxLines: 3,
                                  decoration: const InputDecoration(
                                    hintText:
                                        'What did you think of this course? (optional)',
                                    border: OutlineInputBorder(),
                                    isDense: true,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                SizedBox(
                                  width: double.infinity,
                                  child: OutlinedButton(
                                    onPressed: _reviewSubmitting
                                        ? null
                                        : () => _submitReview(course),
                                    child: Text(
                                      _reviewSubmitting
                                          ? 'Saving...'
                                          : course.myReview != null
                                              ? 'Update Review'
                                              : 'Submit Review',
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],
                        if (course.reviews.isEmpty)
                          Text('No reviews yet.',
                              style: Theme.of(context).textTheme.bodySmall)
                        else
                          for (final review in course.reviews)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        review.isMine
                                            ? '${review.studentName} (you)'
                                            : review.studentName,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 13),
                                      ),
                                      Text(
                                        DateFormat.yMMMd()
                                            .format(review.createdAt),
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall,
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  StarRatingDisplay(rating: review.rating),
                                  if (review.comment != null) ...[
                                    const SizedBox(height: 4),
                                    Text(review.comment!,
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall),
                                  ],
                                ],
                              ),
                            ),
                      ],
                    ),
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
