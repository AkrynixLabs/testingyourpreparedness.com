import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/subscription.dart';
import '../services/api_client.dart';
import '../theme/app_theme.dart';
import '../widgets/app_dialogs.dart';
import '../widgets/async_state_views.dart';
import 'subscription_checkout_webview_screen.dart';

/// Mobile counterpart to app/student/settings/settings-view.tsx's "Plan" tab
/// - same GET /api/mobile/subscription data, same Paystack checkout flow as
/// the course-purchase webview (see subscription_checkout_webview_screen.dart's
/// doc comment). Independent students only; a school-provisioned student
/// hitting this screen gets a dedicated "your school manages this" message
/// instead of the plan list, since GET /api/mobile/subscription 400s for them.
class UpgradePlanScreen extends StatefulWidget {
  const UpgradePlanScreen({super.key});

  @override
  State<UpgradePlanScreen> createState() => _UpgradePlanScreenState();
}

const _cycleLabel = {'monthly': 'month', 'term': 'term', 'yearly': 'year'};

class _UpgradePlanScreenState extends State<UpgradePlanScreen> {
  late Future<SubscriptionInfo> _infoFuture;
  String? _upgradingPlanId;
  String? _upgradeError;

  @override
  void initState() {
    super.initState();
    _infoFuture = ApiClient.instance.getSubscriptionInfo();
  }

  void _retry() {
    setState(() => _infoFuture = ApiClient.instance.getSubscriptionInfo());
  }

  Future<void> _handleUpgrade(SubscriptionPlanOption plan) async {
    final priceAndCycle = plan.priceAndCycle;
    if (priceAndCycle == null) return;
    final (_, cycle) = priceAndCycle;

    setState(() {
      _upgradingPlanId = plan.id;
      _upgradeError = null;
    });

    try {
      final init = await ApiClient.instance
          .initializeSubscriptionCheckout(planId: plan.id, billingCycle: cycle);
      if (!mounted) return;
      final reference = await Navigator.of(context).push<String?>(
        MaterialPageRoute(
          builder: (_) => SubscriptionCheckoutWebviewScreen(
              authorizationUrl: init.authorizationUrl),
        ),
      );

      if (reference == null) {
        setState(() => _upgradingPlanId = null);
        return;
      }

      final status = await ApiClient.instance.verifySubscriptionCheckout(reference);
      if (!mounted) return;
      await _showOutcome(status);
      _retry();
    } on ApiException catch (e) {
      setState(() => _upgradeError = e.message);
    } catch (_) {
      setState(() => _upgradeError = 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _upgradingPlanId = null);
    }
  }

  Future<void> _showOutcome(String status) {
    final (title, message, icon, color) = switch (status) {
      'success' => (
          'Payment Successful',
          'Your subscription is being activated.',
          Icons.check_circle,
          Theme.of(context).success,
        ),
      'failed' => (
          'Payment Not Completed',
          "You weren't charged. You can try again anytime.",
          Icons.error_outline,
          Theme.of(context).colorScheme.error,
        ),
      _ => (
          'Confirming Payment',
          "We couldn't confirm this payment's status directly - it may still be processing.",
          Icons.hourglass_top,
          Colors.amber,
        ),
    };
    return AppDialogs.info(context,
        title: title, message: message, icon: icon, iconColor: color);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upgrade Plan')),
      body: FutureBuilder<SubscriptionInfo>(
        future: _infoFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            final error = snapshot.error;
            if (error is ApiException && error.statusCode == 400) {
              return const _NoPersonalSubscriptionNotice();
            }
            return ErrorView(
              message: errorMessageFor(error!,
                  fallback: 'Could not load your subscription.'),
              onRetry: _retry,
            );
          }

          final info = snapshot.data!;
          return ListView(
            padding: screenScrollPadding(context),
            children: [
              _CurrentPlanCard(info: info),
              if (_upgradeError != null) ...[
                const SizedBox(height: 12),
                Text(_upgradeError!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ],
              if (!info.isPaid) ...[
                const SizedBox(height: 24),
                Text('Upgrade to Premium',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 12),
                for (final plan in info.plans)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _PlanCard(
                      plan: plan,
                      loading: _upgradingPlanId == plan.id,
                      onUpgrade: () => _handleUpgrade(plan),
                    ),
                  ),
              ],
            ],
          );
        },
      ),
    );
  }
}

class _NoPersonalSubscriptionNotice extends StatelessWidget {
  const _NoPersonalSubscriptionNotice();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.school_outlined,
                size: 40, color: Theme.of(context).colorScheme.onSurfaceVariant),
            const SizedBox(height: 12),
            Text(
              'Your school manages your access - there\'s no personal plan to upgrade.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}

class _CurrentPlanCard extends StatelessWidget {
  final SubscriptionInfo info;
  const _CurrentPlanCard({required this.info});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(info.isPaid ? Icons.workspace_premium : Icons.stars_outlined,
                    color: info.isPaid ? colors.primary : colors.onSurfaceVariant),
                const SizedBox(width: 8),
                Text('Your Plan', style: Theme.of(context).textTheme.titleMedium),
              ],
            ),
            const SizedBox(height: 12),
            Text(info.planName,
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.w700)),
            if (info.isPaid && info.renewalDate != null) ...[
              const SizedBox(height: 4),
              Text('Renews ${DateFormat.yMMMd().format(info.renewalDate!.toLocal())}',
                  style: Theme.of(context).textTheme.bodySmall),
            ],
            if (!info.isPaid) ...[
              const SizedBox(height: 4),
              Text(
                '${info.freeTierAttemptsUsed}/${info.freeTierAttemptLimit} practice tests used this month · basic score reports only',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final SubscriptionPlanOption plan;
  final bool loading;
  final VoidCallback onUpgrade;

  const _PlanCard({
    required this.plan,
    required this.loading,
    required this.onUpgrade,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final priceAndCycle = plan.priceAndCycle;

    return Card(
      shape: plan.popular
          ? RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: BorderSide(color: colors.primary, width: 1.5),
            )
          : null,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(plan.name,
                      style: Theme.of(context)
                          .textTheme
                          .titleMedium
                          ?.copyWith(fontWeight: FontWeight.w700)),
                ),
                if (plan.popular)
                  Chip(
                    label: const Text('Popular'),
                    visualDensity: VisualDensity.compact,
                    padding: EdgeInsets.zero,
                    backgroundColor: colors.primary.withValues(alpha: 0.12),
                    labelStyle: TextStyle(color: colors.primary),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              priceAndCycle != null
                  ? 'GHS ${priceAndCycle.$1} / ${_cycleLabel[priceAndCycle.$2]}'
                  : 'Contact us',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(color: colors.primary, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            for (final feature in plan.features)
              Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.check, size: 16, color: Theme.of(context).success),
                    const SizedBox(width: 8),
                    Expanded(
                        child: Text(feature,
                            style: Theme.of(context).textTheme.bodySmall)),
                  ],
                ),
              ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: priceAndCycle == null || loading ? null : onUpgrade,
                child: loading
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Upgrade'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
