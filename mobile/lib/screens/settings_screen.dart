import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../models/user.dart';
import '../services/api_client.dart';
import '../services/push_notification_service.dart';
import '../services/theme_controller.dart';
import '../widgets/app_dialogs.dart';
import '../widgets/async_state_views.dart';
import 'login_screen.dart';

/// Mirrors the web app's app/student/settings - Log Out and the Danger Zone
/// (self-service account deletion) live here, not on ProfileScreen, per the
/// user's explicit call (2026-08-16) that these are settings/account-
/// management actions, not profile display. Reuses GET /api/mobile/me for
/// scheduledDeletionAt rather than adding a second endpoint - same data
/// ProfileScreen already fetches, just a separate screen showing a
/// different slice of it.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late Future<StudentProfile> _profileFuture;
  bool _deletionActionLoading = false;
  String? _deletionError;
  String? _appVersion;

  @override
  void initState() {
    super.initState();
    _profileFuture = ApiClient.instance.getProfile();
    _loadAppVersion();
  }

  Future<void> _loadAppVersion() async {
    // Real installed version/build number (from the native platform, not a
    // hand-typed copy of pubspec.yaml's `version:` field that would drift
    // out of sync the first time someone bumps one but forgets the other).
    final info = await PackageInfo.fromPlatform();
    if (!mounted) return;
    setState(
        () => _appVersion = 'Version ${info.version} (${info.buildNumber})');
  }

  void _retry() {
    setState(() => _profileFuture = ApiClient.instance.getProfile());
  }

  Future<void> _onPullRefresh() async {
    _retry();
    try {
      await _profileFuture;
    } catch (_) {
      // Handled by FutureBuilder's own error branch.
    }
  }

  Future<void> _logout() async {
    final confirmed = await AppDialogs.confirm(
      context,
      title: 'Log out?',
      message: "You'll need to log in again to access your exams and courses.",
      confirmLabel: 'Log Out',
      isDestructive: true,
      icon: Icons.logout,
    );
    if (!confirmed || !mounted) return;

    await PushNotificationService.instance.unregisterCurrentDevice();
    await ApiClient.instance.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  Future<void> _confirmDeleteAccount() async {
    final confirmed = await AppDialogs.confirm(
      context,
      title: 'Delete your account?',
      message:
          'This schedules your account for deletion in 30 days. You\'ll get a confirmation email now '
          'and can cancel any time before then from this page. After 30 days, your name, email, and '
          'password are permanently removed.',
      confirmLabel: 'Delete My Account',
      isDestructive: true,
      icon: Icons.warning_amber_rounded,
    );
    if (!confirmed) return;

    setState(() {
      _deletionActionLoading = true;
      _deletionError = null;
    });
    try {
      await ApiClient.instance.requestAccountDeletion();
      _retry();
    } on ApiException catch (e) {
      setState(() => _deletionError = e.message);
    } catch (_) {
      setState(() => _deletionError =
          'Could not schedule account deletion. Check your connection and try again.');
    } finally {
      if (mounted) setState(() => _deletionActionLoading = false);
    }
  }

  Future<void> _cancelDeleteAccount() async {
    setState(() {
      _deletionActionLoading = true;
      _deletionError = null;
    });
    try {
      await ApiClient.instance.cancelAccountDeletion();
      _retry();
    } on ApiException catch (e) {
      setState(() => _deletionError = e.message);
    } catch (_) {
      setState(() => _deletionError =
          'Could not cancel account deletion. Check your connection and try again.');
    } finally {
      if (mounted) setState(() => _deletionActionLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: FutureBuilder<StudentProfile>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!,
                  fallback: 'Could not load your settings.'),
              onRetry: _retry,
            );
          }

          final profile = snapshot.data!;

          return RefreshIndicator(
            onRefresh: _onPullRefresh,
            child: ListView(
              padding: screenScrollPadding(context),
              children: [
                const _AppearanceSection(),
                const SizedBox(height: 24),
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.logout),
                    title: const Text('Log Out'),
                    onTap: _logout,
                  ),
                ),
                const SizedBox(height: 24),
                _DangerZone(
                  scheduledDeletionAt: profile.scheduledDeletionAt,
                  loading: _deletionActionLoading,
                  error: _deletionError,
                  onDelete: _confirmDeleteAccount,
                  onCancel: _cancelDeleteAccount,
                ),
                if (_appVersion != null) ...[
                  const SizedBox(height: 24),
                  Center(
                    child: Text(
                      _appVersion!,
                      style: Theme.of(context).textTheme.bodySmall,
                      semanticsLabel: 'App $_appVersion',
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _DangerZone extends StatelessWidget {
  final DateTime? scheduledDeletionAt;
  final bool loading;
  final String? error;
  final VoidCallback onDelete;
  final VoidCallback onCancel;

  const _DangerZone({
    required this.scheduledDeletionAt,
    required this.loading,
    required this.error,
    required this.onDelete,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final scheduled = scheduledDeletionAt;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: colors.error.withValues(alpha: 0.35)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.warning_amber_rounded,
                    size: 18, color: colors.error),
                const SizedBox(width: 8),
                Text('Danger Zone',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(color: colors.error)),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Permanently delete your account and personal information.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 14),
            if (error != null) ...[
              Text(error!, style: TextStyle(color: colors.error, fontSize: 13)),
              const SizedBox(height: 10),
            ],
            if (scheduled != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: colors.error.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(10),
                  border:
                      Border.all(color: colors.error.withValues(alpha: 0.25)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.warning_amber_rounded,
                        size: 16, color: colors.error),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text.rich(
                        TextSpan(
                          style: TextStyle(color: colors.error, fontSize: 13),
                          children: [
                            const TextSpan(
                                text:
                                    'Your account is scheduled for deletion on '),
                            TextSpan(
                              text: DateFormat('d MMMM y')
                                  .format(scheduled.toLocal()),
                              style:
                                  const TextStyle(fontWeight: FontWeight.w700),
                            ),
                            const TextSpan(
                                text:
                                    '. You can still cancel this before then.'),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else
              Text(
                'Deleting your account gives you a 30-day window to change your mind. After that, your name, '
                'email, and password are permanently removed and you won\'t be able to log in again.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            const SizedBox(height: 14),
            if (scheduled != null)
              OutlinedButton(
                onPressed: loading ? null : onCancel,
                child: loading
                    ? const _InlineSpinner()
                    : const Text('Cancel Deletion'),
              )
            else
              FilledButton(
                style: FilledButton.styleFrom(
                    backgroundColor: colors.error,
                    foregroundColor: colors.onError),
                onPressed: loading ? null : onDelete,
                child: loading
                    ? const _InlineSpinner()
                    : const Text('Delete My Account'),
              ),
          ],
        ),
      ),
    );
  }
}

/// Light/Dark/System picker, user-requested 2026-08-16 - previously the
/// app had no explicit `themeMode` at all, so it silently followed the
/// device's system setting with no way to override it, which is why a
/// phone already in system dark mode made the app look "dark" with no
/// visible way to change it.
class _AppearanceSection extends StatelessWidget {
  const _AppearanceSection();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.palette_outlined,
                    size: 18,
                    color: Theme.of(context).colorScheme.onSurfaceVariant),
                const SizedBox(width: 8),
                Text('Appearance',
                    style: Theme.of(context).textTheme.titleMedium),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Choose how TYP looks on this device.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 14),
            ListenableBuilder(
              listenable: ThemeController.instance,
              builder: (context, _) {
                return SegmentedButton<ThemeMode>(
                  // Icon + selection-checkmark + label for all 3 segments
                  // can crowd a narrow phone width - dropping the separate
                  // checkmark icon (the segment's own icon already changes
                  // color/weight when selected via the theme) keeps this
                  // comfortably fitting without wrapping.
                  showSelectedIcon: false,
                  segments: const [
                    ButtonSegment(
                        value: ThemeMode.light,
                        icon: Icon(Icons.light_mode_outlined),
                        label: Text('Light')),
                    ButtonSegment(
                        value: ThemeMode.dark,
                        icon: Icon(Icons.dark_mode_outlined),
                        label: Text('Dark')),
                    ButtonSegment(
                        value: ThemeMode.system,
                        icon: Icon(Icons.smartphone_outlined),
                        label: Text('System')),
                  ],
                  selected: {ThemeController.instance.mode},
                  onSelectionChanged: (selected) =>
                      ThemeController.instance.setMode(selected.first),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _InlineSpinner extends StatelessWidget {
  const _InlineSpinner();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
        height: 18,
        width: 18,
        child: CircularProgressIndicator(strokeWidth: 2));
  }
}
