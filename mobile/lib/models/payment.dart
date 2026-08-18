/// Mirrors GET /api/mobile/payments's response - lib/student/payments.ts's
/// merged subscription-payment + course-purchase history. No web page shows
/// this data yet; this is the first client.
class PaymentHistoryEntry {
  final String id;
  final String kind; // "subscription" | "course"
  final String description;
  final int amount; // GHS
  final String status; // completed | pending | failed | refunded
  final DateTime date;

  const PaymentHistoryEntry({
    required this.id,
    required this.kind,
    required this.description,
    required this.amount,
    required this.status,
    required this.date,
  });

  bool get isCourse => kind == 'course';

  factory PaymentHistoryEntry.fromJson(Map<String, dynamic> json) => PaymentHistoryEntry(
        id: json['id'] as String,
        kind: json['kind'] as String,
        description: json['description'] as String,
        amount: json['amount'] as int,
        status: json['status'] as String,
        date: DateTime.parse(json['date'] as String),
      );
}
