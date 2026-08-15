import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/dashboard.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';
import 'results_screen.dart';

/// Mirrors the web app's student dashboard (app/student/page.tsx) via
/// GET /api/mobile/dashboard - stat tiles, a 6-month performance trend,
/// per-subject strengths, and the most recent results. Deliberately no
/// "upcoming exams" section here, same as the web/API side - the Exams tab
/// already owns that. No chart package added for the trend; a plain bar
/// row keeps this screen dependency-free, matching this app's existing
/// "no new package for a small visual" precedent (see async_state_views.dart).
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<StudentDashboard> _dashboardFuture;

  @override
  void initState() {
    super.initState();
    _dashboardFuture = ApiClient.instance.getDashboard();
  }

  Future<void> _refresh() async {
    setState(() => _dashboardFuture = ApiClient.instance.getDashboard());
    await _dashboardFuture;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: FutureBuilder<StudentDashboard>(
        future: _dashboardFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!, fallback: 'Could not load your dashboard.'),
              onRetry: _refresh,
            );
          }

          final dashboard = snapshot.data!;
          if (dashboard.stats.examsCompleted == 0) {
            return RefreshIndicator(
              onRefresh: _refresh,
              child: ListView(
                children: const [EmptyView(message: 'Take your first exam to see your progress here.')],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _StatsGrid(stats: dashboard.stats),
                if (dashboard.performanceTrend.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  const _SectionTitle('Performance trend'),
                  const SizedBox(height: 8),
                  _TrendChart(points: dashboard.performanceTrend),
                ],
                if (dashboard.subjectStrengths.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  const _SectionTitle('Subject strengths'),
                  const SizedBox(height: 8),
                  ...dashboard.subjectStrengths.map((s) => _SubjectBar(strength: s)),
                ],
                if (dashboard.recentResults.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  const _SectionTitle('Recent results'),
                  const SizedBox(height: 8),
                  ...dashboard.recentResults.map((r) => _RecentResultTile(result: r)),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600));
  }
}

class _StatsGrid extends StatelessWidget {
  final DashboardStats stats;
  const _StatsGrid({required this.stats});

  @override
  Widget build(BuildContext context) {
    final tiles = <_StatTile>[
      _StatTile(label: 'Exams completed', value: '${stats.examsCompleted}', icon: Icons.fact_check_outlined),
      _StatTile(
        label: 'Average score',
        value: stats.averageScore != null ? '${stats.averageScore}%' : '—',
        icon: Icons.trending_up,
      ),
      _StatTile(
        label: 'Current streak',
        value: '${stats.currentStreak} day${stats.currentStreak == 1 ? '' : 's'}',
        icon: Icons.local_fire_department_outlined,
      ),
      _StatTile(
        label: 'Class rank',
        value: stats.classRank != null ? '#${stats.classRank!.rank} of ${stats.classRank!.totalStudents}' : 'N/A',
        icon: Icons.leaderboard_outlined,
      ),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: tiles,
    );
  }
}

class _StatTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  const _StatTile({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 2),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _TrendChart extends StatelessWidget {
  final List<PerformanceTrendPoint> points;
  const _TrendChart({required this.points});

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
        child: SizedBox(
          height: 120,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: points
                .map(
                  (p) => Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Text('${p.score.round()}', style: Theme.of(context).textTheme.bodySmall),
                          const SizedBox(height: 4),
                          Container(
                            height: (p.score.clamp(0, 100) / 100) * 70 + 4,
                            decoration: BoxDecoration(
                              color: primary,
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(p.month, style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        ),
      ),
    );
  }
}

class _SubjectBar extends StatelessWidget {
  final SubjectStrength strength;
  const _SubjectBar({required this.strength});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(strength.subject, style: const TextStyle(fontWeight: FontWeight.w500)),
              Text('${strength.score.round()}%', style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (strength.score.clamp(0, 100)) / 100,
              minHeight: 8,
              backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
            ),
          ),
        ],
      ),
    );
  }
}

class _RecentResultTile extends StatelessWidget {
  final DashboardRecentResult result;
  const _RecentResultTile({required this.result});

  @override
  Widget build(BuildContext context) {
    final percent = result.totalMarks == 0 ? 0 : (result.score / result.totalMarks * 100).round();
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: Text(result.title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 6),
          child: Text(
            'Rank #${result.rank} of ${result.totalStudents} · ${DateFormat.yMMMd().format(result.submittedAt.toLocal())}',
          ),
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '$percent%',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Theme.of(context).colorScheme.primary),
            ),
            Text('${result.score}/${result.totalMarks}', style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => ResultsScreen(attemptId: result.attemptId)),
          );
        },
      ),
    );
  }
}
