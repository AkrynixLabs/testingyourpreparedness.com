import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/payment.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../theme/app_theme.dart';
import '../widgets/app_dialogs.dart';
import '../widgets/async_state_views.dart';
import 'settings_screen.dart';

/// Profile display (GET /api/mobile/me) plus two real data-backed tabs added
/// alongside it: Payments (a student's own subscription-payment + course-
/// purchase history, lib/student/payments.ts - no web equivalent exists yet,
/// this is the first client) and Support (the same contact channel/details
/// as the public web /contact page, plus a real "send us a message" form
/// that creates the same ContactMessage row). Account-management actions
/// (Log Out, self-service account deletion) still live on SettingsScreen,
/// not here - unchanged from the 2026-08-16 call that this screen is a
/// read-only identity/data display with a Settings entry point, not where
/// account actions happen.
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Profile'),
            Tab(text: 'Payments'),
            Tab(text: 'Support'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _ProfileTab(),
          _PaymentsTab(),
          _SupportTab(),
        ],
      ),
    );
  }
}

class _ProfileTab extends StatefulWidget {
  const _ProfileTab();

  @override
  State<_ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<_ProfileTab> {
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
    return FutureBuilder<StudentProfile>(
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

class _PaymentsTab extends StatefulWidget {
  const _PaymentsTab();

  @override
  State<_PaymentsTab> createState() => _PaymentsTabState();
}

class _PaymentsTabState extends State<_PaymentsTab> {
  late Future<List<PaymentHistoryEntry>> _paymentsFuture;

  @override
  void initState() {
    super.initState();
    _paymentsFuture = ApiClient.instance.getPaymentHistory();
  }

  void _retry() {
    setState(() => _paymentsFuture = ApiClient.instance.getPaymentHistory());
  }

  Color _statusColor(BuildContext context, String status) {
    final colors = Theme.of(context).colorScheme;
    switch (status) {
      case 'completed':
        return Theme.of(context).success;
      case 'pending':
        return const Color(0xFFFFA000);
      case 'failed':
      case 'refunded':
        return colors.error;
      default:
        return colors.onSurfaceVariant;
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<PaymentHistoryEntry>>(
      future: _paymentsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const LoadingView();
        }
        if (snapshot.hasError) {
          return ErrorView(
            message: errorMessageFor(snapshot.error!,
                fallback: 'Could not load your payment history.'),
            onRetry: _retry,
          );
        }

        final payments = snapshot.data!;
        if (payments.isEmpty) {
          return RefreshIndicator(
            onRefresh: () async => _retry(),
            child: ListView(
              children: const [
                EmptyView(
                  message: 'No payments yet.',
                  icon: Icons.receipt_long_outlined,
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async => _retry(),
          child: ListView.builder(
            padding: screenScrollPadding(context, top: 12),
            itemCount: payments.length,
            itemBuilder: (context, index) {
              final payment = payments[index];
              final colors = Theme.of(context).colorScheme;
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: colors.primaryContainer,
                    child: Icon(
                      payment.isCourse
                          ? Icons.school_outlined
                          : Icons.workspace_premium_outlined,
                      color: colors.onPrimaryContainer,
                      size: 20,
                    ),
                  ),
                  title: Text(payment.description,
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  subtitle: Text(
                      DateFormat.yMMMd().add_jm().format(payment.date.toLocal())),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('GHS ${payment.amount}',
                          style: const TextStyle(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(
                        payment.status,
                        style: TextStyle(
                          color: _statusColor(context, payment.status),
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}

class _SupportTab extends StatefulWidget {
  const _SupportTab();

  @override
  State<_SupportTab> createState() => _SupportTabState();
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

class _SupportTabState extends State<_SupportTab> {
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
    return ListView(
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
    );
  }
}
