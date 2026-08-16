import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// One shared dialog vocabulary for the whole app - confirmations before a
/// destructive/important action (log out, delete account, submit an exam)
/// and simple info/outcome dialogs (a payment result) - instead of each
/// screen hand-rolling its own AlertDialog with slightly different styling.
/// Mirrors this app's existing "one shared X" precedent (async_state_views.dart
/// for loading/error/empty, ErrorBanner for inline form errors).
class AppDialogs {
  AppDialogs._();

  /// Shows a Yes/No confirmation dialog and returns true only if the user
  /// picked the confirm action. `isDestructive` swaps the confirm button to
  /// the theme's error color (log out, delete account) instead of primary
  /// (submit an exam, a routine confirmation).
  static Future<bool> confirm(
    BuildContext context, {
    required String title,
    required String message,
    String confirmLabel = 'Confirm',
    String cancelLabel = 'Cancel',
    bool isDestructive = false,
    IconData? icon,
  }) async {
    final colors = Theme.of(context).colorScheme;
    final accent = isDestructive ? colors.error : colors.primary;

    // A destructive confirmation gets a slightly stronger nudge than a
    // routine one - a small tactile cue that this dialog needs real
    // attention, on top of the existing red/error visual treatment.
    if (isDestructive) {
      HapticFeedback.mediumImpact();
    } else {
      HapticFeedback.lightImpact();
    }

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        icon: icon != null ? Icon(icon, color: accent, size: 30) : null,
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              HapticFeedback.selectionClick();
              Navigator.of(context).pop(false);
            },
            child: Text(cancelLabel),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: accent),
            onPressed: () {
              HapticFeedback.selectionClick();
              Navigator.of(context).pop(true);
            },
            child: Text(confirmLabel),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  /// A single-button info/outcome dialog - a payment result, a completed
  /// background action, anything that just needs acknowledging rather than
  /// a yes/no choice.
  static Future<void> info(
    BuildContext context, {
    required String title,
    required String message,
    IconData icon = Icons.info_outline,
    Color? iconColor,
    String buttonLabel = 'OK',
  }) {
    HapticFeedback.lightImpact();
    return showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        icon: Icon(icon,
            color: iconColor ?? Theme.of(context).colorScheme.primary,
            size: 32),
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(buttonLabel)),
        ],
      ),
    );
  }
}
