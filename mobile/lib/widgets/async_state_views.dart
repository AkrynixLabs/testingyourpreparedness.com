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
String errorMessageFor(Object error, {String fallback = 'Something went wrong. Please try again.'}) {
  if (error is ApiException) return error.message;
  return fallback;
}

class LoadingView extends StatelessWidget {
  const LoadingView({super.key});

  @override
  Widget build(BuildContext context) => const Center(child: CircularProgressIndicator());
}

class ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  final String retryLabel;

  const ErrorView({super.key, required this.message, this.onRetry, this.retryLabel = 'Try again'});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 40, color: Theme.of(context).colorScheme.error),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: 16),
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
  const EmptyView({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(
          message,
          textAlign: TextAlign.center,
          style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6)),
        ),
      ),
    );
  }
}
