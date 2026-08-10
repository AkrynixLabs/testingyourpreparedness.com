import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/exam.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import 'login_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  final AppUser user;
  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
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
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return _ErrorState(
              message: snapshot.error is ApiException
                  ? (snapshot.error as ApiException).message
                  : 'Could not load your exams. Pull down to try again.',
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

class _ErrorState extends StatelessWidget {
  final String message;
  final Future<void> Function() onRetry;
  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 40, color: Theme.of(context).colorScheme.error),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            OutlinedButton(onPressed: () => onRetry(), child: const Text('Try again')),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final String message;
  const _EmptyState({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(
          message,
          textAlign: TextAlign.center,
          style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6)),
        ),
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
      return const _EmptyState(message: 'No exams available to take right now.');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final exam = items[index];
        final attemptsLabel = exam.maxAttempts == null
            ? '${exam.attempts} attempt${exam.attempts == 1 ? '' : 's'} so far'
            : '${exam.attempts}/${exam.maxAttempts} attempts used';

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            title: Text(exam.title, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${exam.subjectName} · ${exam.questionCount} questions · ${exam.duration} min'),
                  const SizedBox(height: 4),
                  Text(attemptsLabel),
                  if (exam.deadline != null)
                    Text('Deadline: ${DateFormat.yMMMd().add_jm().format(exam.deadline!.toLocal())}'),
                ],
              ),
            ),
            trailing: exam.difficulty != null ? _DifficultyChip(difficulty: exam.difficulty!) : null,
            // Exam-taking flow isn't wired yet - the backend session's
            // attempt-start/submit endpoints don't exist yet. Tapping just
            // shows that, rather than a silently-dead button.
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Taking exams from the app is coming soon.')),
              );
            },
          ),
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
      return const _EmptyState(message: 'Nothing scheduled yet.');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final exam = items[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            title: Text(exam.title, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('${exam.subjectName} · ${exam.questionCount} questions · ${exam.duration} min'),
                  const SizedBox(height: 4),
                  Text('Opens: ${DateFormat.yMMMd().add_jm().format(exam.startDate.toLocal())}'),
                ],
              ),
            ),
            trailing: exam.difficulty != null ? _DifficultyChip(difficulty: exam.difficulty!) : null,
          ),
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
      return const _EmptyState(message: 'No completed exams yet.');
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final exam = items[index];
        final percent = exam.totalMarks == 0 ? 0 : (exam.score / exam.totalMarks * 100).round();
        final minutes = exam.timeSpentSeconds == null ? null : (exam.timeSpentSeconds! / 60).round();

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            title: Text(exam.title, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(exam.subjectName),
                  const SizedBox(height: 4),
                  Text('Submitted: ${DateFormat.yMMMd().add_jm().format(exam.submittedAt.toLocal())}'),
                  if (minutes != null) Text('Time spent: $minutes min'),
                ],
              ),
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '$percent%',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
                Text('${exam.score}/${exam.totalMarks}', style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _DifficultyChip extends StatelessWidget {
  final String difficulty;
  const _DifficultyChip({required this.difficulty});

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(difficulty, style: const TextStyle(fontSize: 12)),
      padding: EdgeInsets.zero,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}
