import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/api_client.dart';
import '../widgets/async_state_views.dart';

/// Extracted out of settings_screen.dart's old "Privacy & Legal" tab
/// (2026-08-18) so it can be reached from both SettingsScreen and
/// ProfileScreen's list, per the user's request - a standalone screen is
/// simpler to link to twice than a tab embedded in another screen's TabBar.
/// Links out to the real web pages (opened externally, not rendered
/// natively - same precedent as JoinSchoolScreen's terms links) rather than
/// duplicating their content in Dart, since /terms and /privacy are
/// explicitly still first-draft/pending-legal-review text that changes
/// independently of the app (see CLAUDE.md) - a native copy would drift.
class LegalScreen extends StatelessWidget {
  const LegalScreen({super.key});

  Future<void> _openLegalPage(BuildContext context, String path) async {
    final uri = Uri.parse('${ApiClient.baseUrl}$path');
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open this page.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final links = [
      (
        icon: Icons.description_outlined,
        title: 'Terms of Service',
        path: '/terms',
      ),
      (
        icon: Icons.privacy_tip_outlined,
        title: 'Privacy Policy',
        path: '/privacy',
      ),
      (
        icon: Icons.cookie_outlined,
        title: 'Cookie Policy',
        path: '/cookies',
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Privacy & Legal')),
      body: ListView(
        padding: screenScrollPadding(context),
        children: [
          Text(
            'Legal documents open in your browser, since they\'re kept up to '
            'date on the TYP website.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                for (var i = 0; i < links.length; i++)
                  Column(
                    children: [
                      ListTile(
                        leading: Icon(links[i].icon, color: colors.primary),
                        title: Text(links[i].title),
                        trailing: const Icon(Icons.open_in_new, size: 18),
                        onTap: () => _openLegalPage(context, links[i].path),
                      ),
                      if (i != links.length - 1) const Divider(height: 1),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
