import 'package:flutter/material.dart';

/// Shared prev/next pagination bar - used by any list screen that paginates
/// an already-fetched list client-side (My Courses, Browse Courses) rather
/// than duplicating the same page-state UI in each screen. Purely dumb/
/// stateless: the caller owns the current page and slices its own list.
class PaginationControls extends StatelessWidget {
  final int page; // 0-indexed
  final int totalPages;
  final ValueChanged<int> onPageChanged;

  const PaginationControls({
    super.key,
    required this.page,
    required this.totalPages,
    required this.onPageChanged,
  });

  @override
  Widget build(BuildContext context) {
    if (totalPages <= 1) {
      return const SizedBox.shrink();
    }
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          IconButton(
            onPressed: page > 0 ? () => onPageChanged(page - 1) : null,
            icon: const Icon(Icons.chevron_left),
          ),
          Text(
            'Page ${page + 1} of $totalPages',
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: colors.onSurfaceVariant),
          ),
          IconButton(
            onPressed:
                page < totalPages - 1 ? () => onPageChanged(page + 1) : null,
            icon: const Icon(Icons.chevron_right),
          ),
        ],
      ),
    );
  }
}
