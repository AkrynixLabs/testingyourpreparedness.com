import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/exam.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';
import 'exam_taking_screen.dart';
import 'login_screen.dart';
import 'profile_screen.dart';
import 'results_screen.dart';

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
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!, fallback: 'Could not load your exams. Pull down to try again.'),
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
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => ExamTakingScreen(assessmentId: exam.assessmentId)),
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
      return const EmptyView(message: 'Nothing scheduled yet.');
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
      return const EmptyView(message: 'No completed exams yet.');
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
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => ResultsScreen(attemptId: exam.attemptId)),
              );
            },
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
