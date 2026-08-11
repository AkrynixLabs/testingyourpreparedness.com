import 'dart:async';

import 'package:flutter/material.dart';

import '../models/exam_attempt.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';
import 'results_screen.dart';

/// Started from HomeScreen's "Available" tab. Mirrors the web app's
/// app/student/exams/[id]/start/exam-taking-client.tsx at the behavior
/// level (one question at a time, a question-number palette to jump around,
/// flag-for-review, countdown timer, auto-submit at zero) - not a literal
/// port, since the widget toolkits differ, but the same student-facing
/// contract: server is the authority on both eligibility/resume and grading.
class ExamTakingScreen extends StatefulWidget {
  final String assessmentId;
  const ExamTakingScreen({super.key, required this.assessmentId});

  @override
  State<ExamTakingScreen> createState() => _ExamTakingScreenState();
}

class _ExamTakingScreenState extends State<ExamTakingScreen> with WidgetsBindingObserver {
  late Future<ExamStart> _startFuture;
  ExamStart? _exam;
  int _currentIndex = 0;
  final Map<String, int> _answers = {};
  final Set<String> _flagged = {};
  int _remainingSeconds = 0;
  Timer? _timer;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _startFuture = _start();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    super.dispose();
  }

  // Mobile's equivalent of the web app's visibilitychange/tab-switch
  // listener - paused/inactive covers backgrounding the app, an incoming
  // call, or switching to another app, same intent as "the student left the
  // exam tab." Only fires while an exam is actually loaded and in progress.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_exam == null || _exam!.timedOut) return;
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      ApiClient.instance.recordTabSwitch(_exam!.attemptId);
    }
  }

  Future<ExamStart> _start() async {
    final result = await ApiClient.instance.startExam(widget.assessmentId);
    if (!mounted) return result;

    if (result.timedOut) {
      // The clock already ran out server-side before this screen even
      // finished loading - go straight to the result, never render an exam
      // UI for an attempt that's already effectively over.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => ResultsScreen(attemptId: result.attemptId)),
        );
      });
      return result;
    }

    setState(() {
      _exam = result;
      _remainingSeconds = result.remainingSeconds!;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _tick());
    return result;
  }

  void _tick() {
    if (!mounted) return;
    if (_remainingSeconds <= 1) {
      _timer?.cancel();
      setState(() => _remainingSeconds = 0);
      _submit(auto: true);
      return;
    }
    setState(() => _remainingSeconds -= 1);
  }

  Future<void> _submit({bool auto = false}) async {
    if (_submitting || _exam == null) return;
    setState(() => _submitting = true);
    _timer?.cancel();

    try {
      final attemptId = await ApiClient.instance.submitAttempt(
        attemptId: _exam!.attemptId,
        answers: _answers,
        flaggedQuestionIds: _flagged.toList(),
      );
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => ResultsScreen(attemptId: attemptId)),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _submitting = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (_) {
      if (!mounted) return;
      setState(() => _submitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not submit. Check your connection and try again.')),
      );
    }
  }

  Future<void> _confirmSubmit() async {
    final unanswered = _exam!.questions.where((q) => !_answers.containsKey(q.id)).length;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Submit exam?'),
        content: Text(
          unanswered == 0
              ? 'You\'ve answered every question. Submit now?'
              : 'You have $unanswered unanswered question${unanswered == 1 ? '' : 's'}. Submit anyway?',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Submit')),
        ],
      ),
    );
    if (confirmed == true) _submit();
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FutureBuilder<ExamStart>(
          future: _startFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LoadingView();
            }
            if (snapshot.hasError) {
              // "Go back" rather than a true retry - a start failure here is
              // typically a real eligibility answer (window closed, attempts
              // used up), not a transient fetch to blindly retry.
              return ErrorView(
                message: errorMessageFor(snapshot.error!, fallback: 'Could not start this exam.'),
                onRetry: () => Navigator.of(context).pop(),
                retryLabel: 'Go back',
              );
            }
            if (_exam == null || _exam!.timedOut) {
              // Already redirecting to ResultsScreen (see _start()) -
              // nothing useful to render here.
              return const LoadingView();
            }

            final exam = _exam!;
            final question = exam.questions[_currentIndex];
            final isLast = _currentIndex == exam.questions.length - 1;
            final lowTime = _remainingSeconds <= 60;

            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          exam.title ?? '',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Icon(Icons.timer_outlined, size: 18, color: lowTime ? Theme.of(context).colorScheme.error : null),
                      const SizedBox(width: 4),
                      Text(
                        _formatTime(_remainingSeconds),
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: lowTime ? Theme.of(context).colorScheme.error : null,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                _QuestionPalette(
                  count: exam.questions.length,
                  currentIndex: _currentIndex,
                  isAnswered: (i) => _answers.containsKey(exam.questions[i].id),
                  isFlagged: (i) => _flagged.contains(exam.questions[i].id),
                  onTap: (i) => setState(() => _currentIndex = i),
                ),
                const Divider(height: 24),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Question ${_currentIndex + 1} of ${exam.questions.length}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(height: 8),
                        Text(question.text, style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 16),
                        RadioGroup<int>(
                          groupValue: _answers[question.id],
                          onChanged: (value) => setState(() => _answers[question.id] = value!),
                          child: Column(
                            children: List.generate(question.options.length, (i) {
                              final selected = _answers[question.id] == i;
                              return Card(
                                margin: const EdgeInsets.only(bottom: 10),
                                color: selected ? Theme.of(context).colorScheme.primary.withValues(alpha: 0.08) : null,
                                child: RadioListTile<int>(
                                  value: i,
                                  title: Text(question.options[i]),
                                ),
                              );
                            }),
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () => setState(() {
                            if (_flagged.contains(question.id)) {
                              _flagged.remove(question.id);
                            } else {
                              _flagged.add(question.id);
                            }
                          }),
                          icon: Icon(
                            _flagged.contains(question.id) ? Icons.flag : Icons.outlined_flag,
                            color: _flagged.contains(question.id) ? Theme.of(context).colorScheme.error : null,
                          ),
                          label: Text(_flagged.contains(question.id) ? 'Flagged for review' : 'Flag for review'),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _currentIndex == 0 ? null : () => setState(() => _currentIndex -= 1),
                          child: const Text('Previous'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: isLast
                            ? ElevatedButton(
                                onPressed: _submitting ? null : _confirmSubmit,
                                child: _submitting
                                    ? const SizedBox(
                                        height: 18,
                                        width: 18,
                                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                      )
                                    : const Text('Submit'),
                              )
                            : ElevatedButton(
                                onPressed: () => setState(() => _currentIndex += 1),
                                child: const Text('Next'),
                              ),
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _QuestionPalette extends StatelessWidget {
  final int count;
  final int currentIndex;
  final bool Function(int) isAnswered;
  final bool Function(int) isFlagged;
  final void Function(int) onTap;

  const _QuestionPalette({
    required this.count,
    required this.currentIndex,
    required this.isAnswered,
    required this.isFlagged,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: count,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final active = i == currentIndex;
          final answered = isAnswered(i);
          final flagged = isFlagged(i);

          Color background;
          if (active) {
            background = scheme.primary;
          } else if (flagged) {
            background = scheme.error.withValues(alpha: 0.15);
          } else if (answered) {
            background = scheme.primary.withValues(alpha: 0.12);
          } else {
            background = scheme.surface;
          }

          return InkWell(
            onTap: () => onTap(i),
            borderRadius: BorderRadius.circular(8),
            child: Container(
              width: 36,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: background,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: scheme.outline.withValues(alpha: 0.3)),
              ),
              child: Text(
                '${i + 1}',
                style: TextStyle(
                  color: active ? scheme.onPrimary : null,
                  fontWeight: active ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
