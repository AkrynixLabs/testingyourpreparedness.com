import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';

import 'models/user.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_client.dart' show ApiClient, ApiException;
import 'services/navigation_service.dart';
import 'services/theme_controller.dart';
import 'services/token_storage.dart';
import 'theme/app_theme.dart';
import 'widgets/async_state_views.dart';
import 'widgets/connectivity_banner.dart';

void main() {
  final widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  // Holds the native splash on screen past Flutter's first frame - without
  // this, the native splash is dismissed the instant AuthGate renders its
  // (near-instant) loading Scaffold, which is why it was "gone in a flash"
  // even after the icon-animation-speed fix. Removed by AuthGate once its
  // own auth check AND a minimum 3s elapsed delay have both finished, so a
  // fast check doesn't cut the splash short and a slow one doesn't hold it
  // artificially longer.
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  runApp(const TypApp());
}

class TypApp extends StatelessWidget {
  const TypApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Rebuilds MaterialApp whenever the user changes their theme preference
    // (see services/theme_controller.dart's Settings-screen picker) -
    // ListenableBuilder is the one place this needs to live, since
    // `themeMode` is a MaterialApp constructor argument, not something a
    // descendant widget could change on its own.
    return ListenableBuilder(
      listenable: ThemeController.instance,
      builder: (context, _) {
        return MaterialApp(
          title: 'TYP',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          themeMode: ThemeController.instance.mode,
          // Lets ApiClient redirect to LoginScreen on a 401 from anywhere
          // (see services/navigation_service.dart) without a BuildContext
          // of its own.
          navigatorKey: rootNavigatorKey,
          // Wraps every screen with a real "you're offline" banner, sourced
          // from the OS's own connectivity state - not just the per-screen
          // error messages that only ever appear after a request has
          // already failed. `builder` is the one place this can wrap the
          // whole routed app (including every pushed screen) without
          // touching each screen individually.
          builder: (context, child) => ConnectivityBanner(child: child!),
          home: const AuthGate(),
        );
      },
    );
  }
}

/// Decides Login vs. Home on cold start based on whether a stored token
/// exists and is still valid - re-verified against GET /api/mobile/me
/// rather than trusted blindly, since a stored token could have expired or
/// been revoked server-side since the last session.
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  @override
  void initState() {
    super.initState();
    _check();
  }

  static const _minSplashDuration = Duration(seconds: 3);

  Future<void> _check() async {
    final started = DateTime.now();
    AppUser? user;
    try {
      final token = await TokenStorage.instance.readToken();
      if (token != null) {
        final profile = await ApiClient.instance.getProfile();
        // GET /api/mobile/me doesn't echo `role` back (v1 is student-only by
        // construction - the login endpoint already rejects non-students),
        // so it's safe to fill it in here rather than treat it as unknown.
        user = AppUser(
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: 'student');
        await TokenStorage.instance
            .saveCachedUser(id: user.id, name: user.name, email: user.email);
      }
    } on ApiException catch (e) {
      // A real 401 means the token itself is invalid/expired/revoked - that
      // one case genuinely needs a fresh login. Anything else from this
      // catch clause (429, a 5xx, a malformed response) falls through to
      // the generic handler below rather than being treated the same way.
      if (e.statusCode == 401) {
        await ApiClient.instance.logout();
        user = null;
      } else {
        user = await _fallBackToCachedUser();
      }
    } catch (_) {
      // Not an ApiException at all - a real network failure (no
      // connectivity, DNS, timeout). This used to unconditionally clear the
      // stored token and force a fresh login on *any* error here, which
      // meant a single flaky connection right after the app resumed (e.g.
      // immediately after Android brings the app back from the background)
      // looked exactly like being logged out, even though the token itself
      // was still perfectly valid. Now: fall back to the last-confirmed
      // cached user instead of wiping the session over a connectivity blip.
      user = await _fallBackToCachedUser();
    }

    final elapsed = DateTime.now().difference(started);
    final remaining = _minSplashDuration - elapsed;
    if (remaining > Duration.zero) {
      await Future.delayed(remaining);
    }
    FlutterNativeSplash.remove();

    if (user != null) {
      _goToHome(user);
    } else {
      _goToLogin();
    }
  }

  /// Only used when the token itself couldn't be verified due to something
  /// other than a real 401 - reconstructs AppUser from the local cache
  /// (see TokenStorage.saveCachedUser) so the session survives a transient
  /// failure. Returns null (falls through to the login screen, same as
  /// before) only when there's truly nothing cached to fall back on, e.g.
  /// the very first launch after installing the app.
  Future<AppUser?> _fallBackToCachedUser() async {
    final cached = await TokenStorage.instance.readCachedUser();
    if (cached == null) return null;
    return AppUser(
        id: cached['id']!,
        name: cached['name']!,
        email: cached['email']!,
        role: 'student');
  }

  void _goToLogin() {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  void _goToHome(AppUser user) {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => HomeScreen(user: user)));
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: LoadingView());
  }
}
