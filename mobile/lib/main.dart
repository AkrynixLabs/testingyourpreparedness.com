import 'package:flutter/material.dart';

import 'models/user.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'services/api_client.dart';
import 'services/navigation_service.dart';
import 'services/token_storage.dart';
import 'theme/app_theme.dart';
import 'widgets/async_state_views.dart';

void main() {
  runApp(const TypApp());
}

class TypApp extends StatelessWidget {
  const TypApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TYP',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      // Lets ApiClient redirect to LoginScreen on a 401 from anywhere (see
      // services/navigation_service.dart) without a BuildContext of its own.
      navigatorKey: rootNavigatorKey,
      home: const AuthGate(),
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

  Future<void> _check() async {
    final token = await TokenStorage.instance.readToken();
    if (token == null) {
      _goToLogin();
      return;
    }

    try {
      final profile = await ApiClient.instance.getProfile();
      // GET /api/mobile/me doesn't echo `role` back (v1 is student-only by
      // construction - the login endpoint already rejects non-students), so
      // it's safe to fill it in here rather than treat it as unknown.
      final user = AppUser(id: profile.id, name: profile.name, email: profile.email, role: 'student');
      _goToHome(user);
    } catch (_) {
      await ApiClient.instance.logout();
      _goToLogin();
    }
  }

  void _goToLogin() {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  void _goToHome(AppUser user) {
    if (!mounted) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => HomeScreen(user: user)));
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: LoadingView());
  }
}
