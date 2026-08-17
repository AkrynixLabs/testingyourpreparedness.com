import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

import '../models/exam.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../services/push_notification_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_dialogs.dart';
import '../widgets/async_state_views.dart';
import '../widgets/skeleton.dart';
import 'course_catalog_screen.dart';
import 'dashboard_screen.dart';
import 'exam_taking_screen.dart';
import 'login_screen.dart';
import 'profile_screen.dart';
import 'results_screen.dart';

/// Top-level shell once logged in - a bottom nav across the exam-prep loop
/// (v1's original scope), the dashboard (added 2026-08-15, closing the
/// standing "no client screen yet" gap for GET /api/mobile/dashboard), and
/// the course marketplace (added 2026-08-10). Each destination keeps its own
/// full Scaffold/AppBar (via IndexedStack) rather than trying to merge
/// differently-shaped AppBars (exams needs a bottom TabBar, courses needs a
/// search/filter row) into one shared one.
class HomeScreen extends StatefulWidget {
  final AppUser user;
  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  int _index = 0;
  DateTime? _lastBackPressAt;
  late final AnimationController _tabFadeController;

  @override
  void initState() {
    super.initState();
    // Drives a quick crossfade on tab switch - deliberately a single
    // persistent IndexedStack underneath (not an AnimatedSwitcher swapping
    // widget instances), since each tab does its own async fetch on
    // initState and would otherwise re-fetch every time it's revisited.
    _tabFadeController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 180))
      ..value = 1;
  }

  @override
  void dispose() {
    _tabFadeController.dispose();
    super.dispose();
  }

  void _selectTab(int i) {
    if (i == _index) return;
    HapticFeedback.selectionClick();
    setState(() => _index = i);
    _tabFadeController.forward(from: 0);
  }

  // HomeScreen sits alone at the root of the navigation stack (AuthGate/
  // LoginScreen both reach it via pushReplacement, never push) - with no
  // nested Navigator for the bottom-nav tabs, a bare hardware/gesture back
  // press here previously had nothing to pop, so Flutter's default behavior
  // killed the Activity outright. Relaunching then cold-started the app from
  // main() again - if that happened to land on AuthGate before the stored
  // token/session was ready to check, or any transient failure hit on that
  // relaunch, it looked exactly like "the back button logged me out," even
  // though the real problem was the app exiting at all, not any lost data.
  // Now: back on a non-Exams tab returns to the first tab; back on the
  // first tab needs a second press within 2s (a "press back again to exit"
  // prompt, the standard Android pattern) before it actually calls
  // SystemNavigator.pop() - so a stray back press never exits/relaunches
  // the app by accident.
  Future<void> _handleBack() async {
    if (_index != 0) {
      _selectTab(0);
      return;
    }

    final now = DateTime.now();
    if (_lastBackPressAt == null ||
        now.difference(_lastBackPressAt!) > const Duration(seconds: 2)) {
      _lastBackPressAt = now;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Press back again to exit'),
            duration: Duration(seconds: 2)),
      );
      return;
    }

    SystemNavigator.pop();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _handleBack();
      },
      child: Scaffold(
        body: FadeTransition(
          opacity: CurvedAnimation(
              parent: _tabFadeController, curve: Curves.easeOut),
          child: IndexedStack(
            index: _index,
            children: [
              _ExamsTab(user: widget.user),
              const DashboardScreen(),
              const CourseCatalogScreen(),
            ],
          ),
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: _selectTab,
          destinations: const [
            NavigationDestination(
                icon: Icon(Icons.quiz_outlined),
                selectedIcon: Icon(Icons.quiz),
                label: 'Exams'),
            NavigationDestination(
                icon: Icon(Icons.dashboard_outlined),
                selectedIcon: Icon(Icons.dashboard),
                label: 'Dashboard'),
            NavigationDestination(
                icon: Icon(Icons.school_outlined),
                selectedIcon: Icon(Icons.school),
                label: 'Courses'),
          ],
        ),
      ),
    );
  }
}

class _ExamsTab extends StatefulWidget {
  final AppUser user;
  const _ExamsTab({required this.user});

  @override
  State<_ExamsTab> createState() => _ExamsTabState();
}

class _ExamsTabState extends State<_ExamsTab>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  late Future<StudentExams> _examsFuture;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _examsFuture = ApiClient.instance.getExams();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _refresh() async {
    setState(() => _examsFuture = ApiClient.instance.getExams());
    await _examsFuture;
  }

  Future<void> _logout() async {
    final confirmed = await AppDialogs.confirm(
      context,
      title: 'Log out?',
      message: "You'll need to log in again to access your exams and courses.",
      confirmLabel: 'Log Out',
      isDestructive: true,
      icon: Icons.logout,
    );
    if (!confirmed || !mounted) return;

    await PushNotificationService.instance.unregisterCurrentDevice();
    await ApiClient.instance.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hi, ${widget.user.name.split(' ').first}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            tooltip: 'Profile',
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const ProfileScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Log out',
            onPressed: _logout,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Available'),
            Tab(text: 'Scheduled'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: FutureBuilder<StudentExams>(
        future: _examsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const ExamListSkeleton();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!,
                  fallback:
                      'Could not load your exams. Pull down to try again.'),
              onRetry: _refresh,
            );
          }

          final exams = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _refresh,
            child: TabBarView(
              controller: _tabController,
              children: [
                _AvailableList(items: exams.available),
                _ScheduledList(items: exams.scheduled),
                _CompletedList(items: exams.completed),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _AvailableList extends StatelessWidget {
  final List<AvailableExam> items;
  const _AvailableList({required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const EmptyView(message: 'No exams available to take right now.');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final exam = items[index];
        final attemptsLabel = exam.maxAttempts == null
            ? '${exam.attempts} attempt${exam.attempts == 1 ? '' : 's'} so far'
            : '${exam.attempts}/${exam.maxAttempts} attempts used';

        return _ExamCard(
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(
                builder: (_) =>
                    ExamTakingScreen(assessmentId: exam.assessmentId)),
          ),
          leadingIcon: Icons.play_circle_outline,
          title: exam.title,
          difficulty: exam.difficulty,
          rows: [
            '${exam.subjectName} · ${exam.questionCount} questions · ${exam.duration} min',
            attemptsLabel,
            if (exam.deadline != null)
              'Deadline ${DateFormat.yMMMd().add_jm().format(exam.deadline!.toLocal())}',
          ],
        );
      },
    );
  }
}

class _ScheduledList extends StatelessWidget {
  final List<ScheduledExam> items;
  const _ScheduledList({required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const EmptyView(message: 'Nothing scheduled yet.');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final exam = items[index];
        return _ExamCard(
          leadingIcon: Icons.schedule_outlined,
          title: exam.title,
          difficulty: exam.difficulty,
          rows: [
            '${exam.subjectName} · ${exam.questionCount} questions · ${exam.duration} min',
            'Opens ${DateFormat.yMMMd().add_jm().format(exam.startDate.toLocal())}',
          ],
        );
      },
    );
  }
}

class _CompletedList extends StatelessWidget {
  final List<CompletedExam> items;
  const _CompletedList({required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const EmptyView(message: 'No completed exams yet.');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final exam = items[index];
        final percent = exam.totalMarks == 0
            ? 0
            : (exam.score / exam.totalMarks * 100).round();
        final minutes = exam.timeSpentSeconds == null
            ? null
            : (exam.timeSpentSeconds! / 60).round();
        final colors = Theme.of(context).colorScheme;
        final scoreColor =
            percent >= 50 ? Theme.of(context).success : colors.error;

        return _ExamCard(
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(
                builder: (_) => ResultsScreen(attemptId: exam.attemptId)),
          ),
          leadingIcon: Icons.check_circle_outline,
          title: exam.title,
          rows: [
            exam.subjectName,
            'Submitted ${DateFormat.yMMMd().add_jm().format(exam.submittedAt.toLocal())}',
            if (minutes != null) 'Time spent $minutes min',
          ],
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '$percent%',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(color: scoreColor, fontWeight: FontWeight.w800),
              ),
              Text('${exam.score}/${exam.totalMarks}',
                  style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        );
      },
    );
  }
}

/// Shared modern list-item shape for all 3 exam tabs - a leading icon badge,
/// title + stacked metadata rows, an optional difficulty chip, and an
/// optional trailing slot (used for the completed tab's score) - replaces
/// the earlier plain Card+ListTile look with real visual hierarchy.
class _ExamCard extends StatelessWidget {
  final VoidCallback? onTap;
  final IconData leadingIcon;
  final String title;
  final String? difficulty;
  final List<String> rows;
  final Widget? trailing;

  const _ExamCard({
    this.onTap,
    required this.leadingIcon,
    required this.title,
    this.difficulty,
    required this.rows,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: colors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(leadingIcon, color: colors.primary, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                              child: Text(title,
                                  style:
                                      Theme.of(context).textTheme.titleMedium)),
                          if (difficulty != null) ...[
                            const SizedBox(width: 8),
                            _DifficultyChip(difficulty: difficulty!),
                          ],
                        ],
                      ),
                      const SizedBox(height: 6),
                      for (final row in rows)
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(row,
                              style: Theme.of(context).textTheme.bodySmall),
                        ),
                    ],
                  ),
                ),
                if (trailing != null) ...[const SizedBox(width: 8), trailing!],
                if (onTap != null && trailing == null) ...[
                  const SizedBox(width: 4),
                  Icon(Icons.chevron_right,
                      color: colors.onSurfaceVariant, size: 20),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DifficultyChip extends StatelessWidget {
  final String difficulty;
  const _DifficultyChip({required this.difficulty});

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(difficulty),
      padding: EdgeInsets.zero,
      visualDensity: VisualDensity.compact,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}
