import 'package:flutter/material.dart';

import '../models/user.dart';
import '../services/api_client.dart';
import '../services/session.dart';
import '../widgets/async_state_views.dart';
import 'legal_screen.dart';
import 'payments_screen.dart';
import 'settings_screen.dart';
import 'support_screen.dart';

/// Profile display (GET /api/mobile/me) plus a single flat menu list -
/// Settings, Payments, Support, and Privacy & Legal each moved to their own
/// standalone screen (2026-08-18, was a 3-tab layout with Payments/Support
/// nested here and Privacy & Legal nested inside Settings) since a tab bar
/// inside a tab-like bottom-nav destination, with another tab bar nested
/// inside *that* screen's Settings tab, was two levels deeper than this
/// content needs - a flat list of destinations is the simpler, more
/// discoverable pattern (mirrors the standard iOS/Android "Profile" grouped-
/// list convention). Sign Out is repeated here as its own isolated action
/// (separate from the navigation items above it, and still also present on
/// SettingsScreen) since it's the single most-needed account action and
/// nesting it one screen deeper than necessary was real, reported friction.
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late Future<StudentProfile> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = ApiClient.instance.getProfile();
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: FutureBuilder<StudentProfile>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!,
                  fallback: 'Could not load your profile.'),
              onRetry: _retry,
            );
          }

          final profile = snapshot.data!;
          final colors = Theme.of(context).colorScheme;
          final initials = profile.name.trim().isEmpty
              ? '?'
              : profile.name
                  .trim()
                  .split(RegExp(r'\s+'))
                  .take(2)
                  .map((p) => p[0].toUpperCase())
                  .join();

          return RefreshIndicator(
            onRefresh: _onPullRefresh,
            child: ListView(
              padding: screenScrollPadding(context),
              children: [
                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 84,
                        height: 84,
                        decoration: BoxDecoration(
                            color: colors.primary, shape: BoxShape.circle),
                        alignment: Alignment.center,
                        child: Text(
                          initials,
                          style: TextStyle(
                              color: colors.onPrimary,
                              fontSize: 28,
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(profile.name,
                          style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 2),
                      Text(profile.email,
                          style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
                const SizedBox(height: 28),
                Card(
                  child: Column(
                    children: [
                      _ProfileRow(
                        icon: Icons.badge_outlined,
                        label: 'Enrollment',
                        value: profile.enrollmentType == 'independent'
                            ? 'Independent learner'
                            : 'School-provisioned',
                      ),
                      if (profile.schoolName != null)
                        _ProfileRow(
                            icon: Icons.apartment_outlined,
                            label: 'School',
                            value: profile.schoolName!),
                      if (profile.className != null)
                        _ProfileRow(
                            icon: Icons.class_outlined,
                            label: 'Class',
                            value: profile.className!,
                            isLast: true),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Card(
                  child: Column(
                    children: [
                      _MenuTile(
                        icon: Icons.settings_outlined,
                        title: 'Settings',
                        subtitle: 'Appearance, downloads, and your account',
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const SettingsScreen()),
                        ),
                      ),
                      const Divider(height: 1),
                      _MenuTile(
                        icon: Icons.receipt_long_outlined,
                        title: 'Payments',
                        subtitle: 'Your subscription and course purchases',
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const PaymentsScreen()),
                        ),
                      ),
                      const Divider(height: 1),
                      _MenuTile(
                        icon: Icons.support_agent_outlined,
                        title: 'Support',
                        subtitle: 'Contact us or send a message',
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const SupportScreen()),
                        ),
                      ),
                      const Divider(height: 1),
                      _MenuTile(
                        icon: Icons.privacy_tip_outlined,
                        title: 'Privacy & Legal',
                        subtitle: 'Terms, privacy policy, and cookies',
                        onTap: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => const LegalScreen()),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                // Isolated in its own card, no trailing chevron - visually
                // distinct from the navigation items above (this triggers an
                // action right away rather than pushing another screen).
                Card(
                  child: ListTile(
                    leading: Icon(Icons.logout, color: colors.error),
                    title: Text('Sign Out',
                        style: TextStyle(
                            color: colors.error, fontWeight: FontWeight.w600)),
                    onTap: () => confirmAndLogOut(context),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isLast;
  const _ProfileRow(
      {required this.icon,
      required this.label,
      required this.value,
      this.isLast = false});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: isLast
          ? null
          : BoxDecoration(
              border: Border(bottom: BorderSide(color: colors.outline))),
      child: Row(
        children: [
          Icon(icon, size: 20, color: colors.onSurfaceVariant),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 2),
                Text(value, style: Theme.of(context).textTheme.titleMedium),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// One row in the Profile menu list - a navigation destination (icon +
/// title + subtitle + chevron), as opposed to the Sign Out card below it
/// which is a direct action with no chevron.
class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  const _MenuTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.onSurfaceVariant),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
