/// Mirrors GET /api/mobile/subscription's response - the same
/// lib/student/entitlement.ts getStudentTier() call and SubscriptionPlan
/// query the web Settings "Plan" tab already uses, so mobile shows the
/// exact same tier/plans data.
class SubscriptionInfo {
  final String tier; // "free" | "paid"
  final String planName;
  final DateTime? renewalDate;
  final int freeTierAttemptsUsed;
  final int freeTierAttemptLimit;
  final List<SubscriptionPlanOption> plans;

  const SubscriptionInfo({
    required this.tier,
    required this.planName,
    this.renewalDate,
    required this.freeTierAttemptsUsed,
    required this.freeTierAttemptLimit,
    required this.plans,
  });

  bool get isPaid => tier == 'paid';

  factory SubscriptionInfo.fromJson(Map<String, dynamic> json) => SubscriptionInfo(
        tier: json['tier'] as String,
        planName: json['planName'] as String,
        renewalDate: json['renewalDate'] != null ? DateTime.parse(json['renewalDate'] as String) : null,
        freeTierAttemptsUsed: json['freeTierAttemptsUsed'] as int,
        freeTierAttemptLimit: json['freeTierAttemptLimit'] as int,
        plans: (json['plans'] as List<dynamic>)
            .map((p) => SubscriptionPlanOption.fromJson(p as Map<String, dynamic>))
            .toList(),
      );
}

class SubscriptionPlanOption {
  final String id;
  final String name;
  final int? monthlyPrice;
  final int? termPrice;
  final int? yearlyPrice;
  final List<String> features;
  final bool popular;

  const SubscriptionPlanOption({
    required this.id,
    required this.name,
    this.monthlyPrice,
    this.termPrice,
    this.yearlyPrice,
    required this.features,
    required this.popular,
  });

  /// Same "first non-null price wins" precedence as web's planPriceAndCycle
  /// (app/student/settings/settings-view.tsx) - every current independent
  /// plan only ever sets one of the three.
  (int, String)? get priceAndCycle {
    if (monthlyPrice != null) return (monthlyPrice!, 'monthly');
    if (termPrice != null) return (termPrice!, 'term');
    if (yearlyPrice != null) return (yearlyPrice!, 'yearly');
    return null;
  }

  factory SubscriptionPlanOption.fromJson(Map<String, dynamic> json) => SubscriptionPlanOption(
        id: json['id'] as String,
        name: json['name'] as String,
        monthlyPrice: json['monthlyPrice'] as int?,
        termPrice: json['termPrice'] as int?,
        yearlyPrice: json['yearlyPrice'] as int?,
        features: (json['features'] as List<dynamic>).map((f) => f as String).toList(),
        popular: json['popular'] as bool,
      );
}

class SubscriptionCheckoutInit {
  final String authorizationUrl;
  const SubscriptionCheckoutInit({required this.authorizationUrl});

  factory SubscriptionCheckoutInit.fromJson(Map<String, dynamic> json) =>
      SubscriptionCheckoutInit(authorizationUrl: json['authorizationUrl'] as String);
}
