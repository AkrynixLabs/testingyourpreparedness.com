import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Mirrors app/student/courses/star-rating.tsx's StarRatingDisplay - read
/// only, rounded to the nearest whole star, no partial-fill stars (the exact
/// number is always shown alongside it instead).
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
          color: filled
              ? Colors.amber
              : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3),
        );
      }),
    );
  }
}

/// Mirrors app/student/courses/star-rating.tsx's StarRatingInput - an
/// interactive 1-5 picker for a student submitting/editing their own review.
class StarRatingInput extends StatelessWidget {
  final int value;
  final ValueChanged<int> onChanged;
  const StarRatingInput(
      {super.key, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        final n = i + 1;
        final filled = n <= value;
        return IconButton(
          // Kept at Material's real 48x48 minimum tap target (was shrunk to
          // ~32x32 via VisualDensity.compact/tight constraints, below the
          // accessible minimum and an easy mis-tap between adjacent stars)
          // - fixed in the 2026-08-16 accessibility pass.
          padding: const EdgeInsets.all(2),
          constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
          icon: Icon(
            filled ? Icons.star : Icons.star_border,
            size: 28,
            color: filled
                ? Colors.amber
                : Theme.of(context)
                    .colorScheme
                    .onSurface
                    .withValues(alpha: 0.3),
          ),
          tooltip: '$n star${n == 1 ? '' : 's'}',
          onPressed: () {
            HapticFeedback.selectionClick();
            onChanged(n);
          },
        );
      }),
    );
  }
}
