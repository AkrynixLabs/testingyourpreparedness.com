import 'package:flutter/material.dart';

/// Mirrors app/student/courses/star-rating.tsx's StarRatingDisplay - read
/// only, rounded to the nearest whole star, no partial-fill stars (the exact
/// number is always shown alongside it instead). Review *submission* isn't
/// part of this mobile pass (flagged as a fast-follow, matching the task's
/// own explicit scope call), so only the display half exists here.
class StarRatingDisplay extends StatelessWidget {
  final num rating;
  final double size;
  const StarRatingDisplay({super.key, required this.rating, this.size = 16});

  @override
  Widget build(BuildContext context) {
    final rounded = rating.round();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        final filled = i < rounded;
        return Icon(
          filled ? Icons.star : Icons.star_border,
          size: size,
          color: filled ? Colors.amber : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3),
        );
      }),
    );
  }
}
