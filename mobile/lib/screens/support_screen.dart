import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/api_client.dart';
import '../widgets/app_dialogs.dart';
import '../widgets/async_state_views.dart';
import '../theme/app_theme.dart';

/// Extracted out of profile_screen.dart's old "Support" tab (2026-08-18) so
/// it's a standalone screen reached from ProfileScreen's list, not a tab
/// nested inside another screen - the same contact channel/details as the
/// public web /contact page, plus a real "send us a message" form that
/// creates the same ContactMessage row.
class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportContactOption {
  final IconData icon;
  final String title;
  final String value;
  final String url;
  const _SupportContactOption(
      {required this.icon,
      required this.title,
      required this.value,
      required this.url});
}

// Same channels/values as the public web /contact page (app/contact/page.tsx)
// - that page's own comment notes these are still hardcoded there too, not
// yet backed by PlatformSettings, so mirroring them literally keeps both
// surfaces in sync until that changes.
const _supportContactOptions = [
  _SupportContactOption(
    icon: Icons.email_outlined,
    title: 'Email',
    value: 'support@typ.edu.gh',
    url: 'mailto:support@typ.edu.gh',
  ),
  _SupportContactOption(
    icon: Icons.phone_outlined,
    title: 'Call',
    value: '+233 30 240 1234',
    url: 'tel:+233302401234',
  ),
];

const _supportSubjects = [
  {'value': 'general', 'label': 'General Inquiry'},
  {'value': 'technical', 'label': 'Technical Support'},
  {'value': 'billing', 'label': 'Billing Question'},
  {'value': 'feedback', 'label': 'Feedback'},
];

class _SupportScreenState extends State<SupportScreen> {
  final _messageController = TextEditingController();
  String _subject = _supportSubjects.first['value']!;
  bool _sending = false;
  String? _error;

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _openContact(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!launched && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open this.')),
      );
    }
  }

  Future<void> _send() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) {
      setState(() => _error = 'Please enter a message.');
      return;
    }
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      await ApiClient.instance
          .sendSupportMessage(subject: _subject, message: message);
      if (!mounted) return;
      _messageController.clear();
      await AppDialogs.info(
        context,
        title: 'Message sent',
        message: "We've received your message and will get back to you soon.",
        icon: Icons.check_circle_outline,
        iconColor: Theme.of(context).success,
      );
    } catch (err) {
      setState(() => _error = errorMessageFor(err, fallback: 'Could not send your message.'));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Support')),
      body: ListView(
        padding: screenScrollPadding(context, top: 16),
        children: [
          Text('Get in touch', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 10),
          Card(
            child: Column(
              children: [
                for (var i = 0; i < _supportContactOptions.length; i++)
                  Column(
                    children: [
                      ListTile(
                        leading: Icon(_supportContactOptions[i].icon,
                            color: colors.primary),
                        title: Text(_supportContactOptions[i].title),
                        subtitle: Text(_supportContactOptions[i].value),
                        trailing: const Icon(Icons.open_in_new, size: 18),
                        onTap: () =>
                            _openContact(_supportContactOptions[i].url),
                      ),
                      if (i != _supportContactOptions.length - 1)
                        const Divider(height: 1),
                    ],
                  ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text('Send us a message',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 10),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_error != null) ...[
                    ErrorBanner(message: _error!),
                    const SizedBox(height: 14),
                  ],
                  DropdownButtonFormField<String>(
                    initialValue: _subject,
                    decoration: const InputDecoration(
                      labelText: 'Subject',
                      border: OutlineInputBorder(),
                    ),
                    items: _supportSubjects
                        .map((s) => DropdownMenuItem(
                              value: s['value'],
                              child: Text(s['label']!),
                            ))
                        .toList(),
                    onChanged: (value) {
                      if (value != null) setState(() => _subject = value);
                    },
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: _messageController,
                    minLines: 4,
                    maxLines: 8,
                    decoration: const InputDecoration(
                      labelText: 'Message',
                      alignLabelWithHint: true,
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: _sending ? null : _send,
                      icon: _sending
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child:
                                  CircularProgressIndicator(strokeWidth: 2))
                          : const Icon(Icons.send_outlined),
                      label: Text(_sending ? 'Sending...' : 'Send Message'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
