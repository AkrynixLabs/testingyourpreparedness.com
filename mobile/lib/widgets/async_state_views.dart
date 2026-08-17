import 'package:flutter/material.dart';

import '../services/api_client.dart';

/// One shared loading/error/empty vocabulary for every FutureBuilder screen
/// (HomeScreen, ExamTakingScreen, ResultsScreen, ProfileScreen) instead of
/// each screen inventing its own near-identical version - deliberately just
/// three small stateless widgets + one helper function, not a state-
/// management framework, since that's more than this app's size warrants.

/// Prefers an ApiException's own server-provided message; falls back to a
/// screen-supplied generic one for anything else (a network failure, a JSON
/// parse error, etc.) that has no user-facing text of its own.
String errorMessageFor(Object error,
    {String fallback = 'Something went wrong. Please try again.'}) {
  if (error is ApiException) return error.message;
  return fallback;
}

/// Bottom padding for a scrollable screen body that has no
/// bottomNavigationBar of its own (a pushed detail/list screen, as opposed
/// to one of HomeScreen's tabs, which are already physically buffered from
/// the system nav bar by the real NavigationBar widget sitting below them).
/// Without this, the last item in a ListView could render partly under an
/// edge-to-edge device's gesture-nav bar, since Scaffold only auto-insets
/// content around a bottomNavigationBar/bottomSheet, not around the bare
/// system inset for a plain scrollable body. Found and fixed 2026-08-16
/// across every screen that had this gap (results, course detail, course
/// learn, my courses, profile, settings).
EdgeInsets screenScrollPadding(BuildContext context,
    {double horizontal = 16, double top = 16, double bottom = 16}) {
  return EdgeInsets.fromLTRB(horizontal, top, horizontal,
      bottom + MediaQuery.of(context).padding.bottom);
}

/// Inline form-level error banner (as opposed to ErrorView, which replaces
/// an entire screen's body) - shared across login/join-school so both forms
/// present a failed request the same way instead of each rolling its own.
class ErrorBanner extends StatelessWidget {
  final String message;
  const ErrorBanner({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colors.error.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colors.error.withValues(alpha: 0.25)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.error_outline, color: colors.error, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(message,
                style: TextStyle(color: colors.error, fontSize: 13.5)),
          ),
        ],
      ),
    );
  }
}

class LoadingView extends StatelessWidget {
  const LoadingView({super.key});

  @override
  Widget build(BuildContext context) =>
      const Center(child: CircularProgressIndicator());
}

class ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  final String retryLabel;

  /// Optional extra widget shown below the retry button - e.g. an "Upgrade
  /// Plan" button when the error is a specific, actionable known case
  /// (a `code` on the underlying ApiException) rather than a generic
  /// failure a bare retry can fix. Null by default so every existing
  /// ErrorView call site is unaffected.
  final Widget? secondaryAction;

  const ErrorView(
      {super.key,
      required this.message,
      this.onRetry,
      this.retryLabel = 'Try again',
      this.secondaryAction});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                  color: colors.error.withValues(alpha: 0.1),
                  shape: BoxShape.circle),
              child: Icon(Icons.error_outline, size: 28, color: colors.error),
            ),
            const SizedBox(height: 16),
            Text(message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium),
            if (secondaryAction != null) ...[
              const SizedBox(height: 20),
              secondaryAction!,
            ],
            if (onRetry != null) ...[
              SizedBox(height: secondaryAction != null ? 12 : 20),
              OutlinedButton(onPressed: onRetry, child: Text(retryLabel)),
            ],
          ],
        ),
      ),
    );
  }
}

class EmptyView extends StatelessWidget {
  final String message;
  final IconData icon;
  const EmptyView(
      {super.key, required this.message, this.icon = Icons.inbox_outlined});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                  color: colors.surfaceContainerHighest,
                  shape: BoxShape.circle),
              child: Icon(icon, size: 26, color: colors.onSurfaceVariant),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: colors.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }
}
