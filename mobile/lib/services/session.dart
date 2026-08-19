import 'package:flutter/material.dart';

import '../screens/login_screen.dart';
import '../widgets/app_dialogs.dart';
import 'api_client.dart';
import 'push_notification_service.dart';

/// Shared "log out" flow - confirm, unregister this device's push token,
/// clear the session, land back on LoginScreen. Two entry points call this
/// (SettingsScreen's existing Log Out row, and ProfileScreen's list, added
/// 2026-08-18 as a second, more discoverable sign-out per the user's
/// request) - one implementation so both stay in sync rather than drifting.
Future<void> confirmAndLogOut(BuildContext context) async {
  final confirmed = await AppDialogs.confirm(
    context,
    title: 'Log out?',
    message: "You'll need to log in again to access your exams and courses.",
    confirmLabel: 'Log Out',
    isDestructive: true,
    icon: Icons.logout,
  );
  if (!confirmed || !context.mounted) return;

  await PushNotificationService.instance.unregisterCurrentDevice();
  await ApiClient.instance.logout();
  if (!context.mounted) return;
  Navigator.of(context).pushAndRemoveUntil(
    MaterialPageRoute(builder: (_) => const LoginScreen()),
    (route) => false,
  );
}
