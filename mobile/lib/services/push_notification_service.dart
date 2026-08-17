import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../firebase_options.dart';
import 'api_client.dart';
import 'navigation_service.dart';

/// Handles push-notification setup end to end: Firebase init, permission
/// request, token registration with the backend, and reacting to a
/// notification tap. Scope confirmed with the user 2026-08-16: exam-related
/// only for v1 ("new exam assigned," "your results are ready" - see
/// lib/push/fcm.ts on the backend for exactly where each fires).
///
/// Every step here is best-effort and fails open - `firebase_options.dart`
/// is a placeholder until a real Firebase project exists (see that file's
/// own doc comment), so `Firebase.initializeApp()` is expected to fail in
/// this state. That failure is caught right here and the whole class
/// becomes a no-op; nothing else in the app depends on push working.
class PushNotificationService {
  PushNotificationService._();
  static final PushNotificationService instance = PushNotificationService._();

  String? _currentToken;
  bool _initialized = false;

  /// Call once, after a successful login/cold-start auth check (not from
  /// main() before there's a signed-in student to register the token
  /// against). Safe to call more than once - a second call just re-checks/
  /// re-registers the current token.
  Future<void> initAndRegister() async {
    try {
      if (!_initialized) {
        await Firebase.initializeApp(
            options: DefaultFirebaseOptions.currentPlatform);
        _initialized = true;
        _wireMessageListeners();
      }

      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.requestPermission(
          alert: true, badge: true, sound: true);
      if (settings.authorizationStatus == AuthorizationStatus.denied) return;

      final token = await messaging.getToken();
      if (token == null) return;
      _currentToken = token;
      await ApiClient.instance.registerPushToken(
          token: token, platform: Platform.isIOS ? 'ios' : 'android');

      // A token can rotate at any point during the app's lifetime, not just
      // at startup - re-register whenever FCM reissues one.
      messaging.onTokenRefresh.listen((newToken) {
        _currentToken = newToken;
        ApiClient.instance
            .registerPushToken(
                token: newToken, platform: Platform.isIOS ? 'ios' : 'android')
            .catchError(
              (_) {},
            );
      });
    } catch (e, stack) {
      // Unconfigured Firebase project (placeholder firebase_options.dart),
      // permission denied, or a genuine transient failure - push is
      // additive, never allowed to affect the rest of the app.
      debugPrint(
          '[push] init/register failed (expected until a real Firebase project is configured): $e');
      if (kDebugMode) debugPrintStack(stackTrace: stack);
    }
  }

  /// Called right before logout clears the session - best-effort, never
  /// blocks logout itself even if this fails.
  Future<void> unregisterCurrentDevice() async {
    final token = _currentToken;
    if (token == null) return;
    try {
      await ApiClient.instance.unregisterPushToken(token);
    } catch (_) {
      // Best-effort - see doc comment above.
    }
    _currentToken = null;
  }

  void _wireMessageListeners() {
    // Foreground: the OS does NOT show a system notification while the app
    // is open (standard platform behavior) - show a simple in-app banner
    // instead, via the root ScaffoldMessenger, rather than adding a second
    // notification-plugin dependency just to force a system-tray entry.
    FirebaseMessaging.onMessage.listen((message) {
      final title = message.notification?.title;
      final body = message.notification?.body;
      if (title == null && body == null) return;

      final context = rootNavigatorKey.currentState?.overlay?.context;
      if (context == null) return;
      // Not actually an async gap - this whole callback runs synchronously
      // from the stream event; the lint can't see that `context` was just
      // freshly obtained on the line above, not carried across an `await`.
      // ignore: use_build_context_synchronously
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(body != null ? '$title\n$body' : title!),
          duration: const Duration(seconds: 4),
        ),
      );
    });

    // Background (app backgrounded, tapped from system tray) and terminated
    // (app was fully closed, tapped from system tray, cold-starts the app)
    // both land here / via getInitialMessage() - deliberately just logged
    // for now rather than deep-linking to a specific screen. A real
    // "open the right exam/result" tap-through is a natural fast-follow,
    // not built in this pass to keep the scope to what was actually asked
    // for (send + receive a notification), not a full deep-linking system.
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      debugPrint('[push] notification tapped, data: ${message.data}');
    });
  }
}
