import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/payment.dart';
import '../services/api_client.dart';
import '../theme/app_theme.dart';
import '../widgets/async_state_views.dart';

/// Extracted out of profile_screen.dart's old "Payments" tab (2026-08-18) so
/// it's a standalone screen reached from ProfileScreen's list, not a tab
/// nested inside another screen - a student's own subscription-payment +
/// course-purchase history (lib/student/payments.ts - no web equivalent
/// exists yet, this is the first client).
class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
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
    return Scaffold(
      appBar: AppBar(title: const Text('Payments')),
      body: FutureBuilder<List<PaymentHistoryEntry>>(
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
      ),
    );
  }
}
