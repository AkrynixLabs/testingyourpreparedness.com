import 'package:flutter/material.dart';

import '../models/user.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';
import 'settings_screen.dart';

/// Basic profile display off GET /api/mobile/me - not required for v1, but
/// cheap to include since the endpoint already exists. Account-management
/// actions (Log Out, self-service account deletion) deliberately live on
/// SettingsScreen instead, not here - the user's own call (2026-08-16) that
/// this screen should stay a read-only identity display, with a Settings
/// entry point linking out to the account-actions screen.
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
                            ? 'Independent student'
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
                const SizedBox(height: 16),
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.settings_outlined),
                    title: const Text('Settings'),
                    subtitle: const Text('Log out, delete your account'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const SettingsScreen()),
                    ),
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
