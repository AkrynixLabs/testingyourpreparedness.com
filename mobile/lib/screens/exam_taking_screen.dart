import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/exam_attempt.dart';
import '../services/api_client.dart';
import '../widgets/app_dialogs.dart';
import '../widgets/async_state_views.dart';
import 'results_screen.dart';
import 'upgrade_plan_screen.dart';

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

class _ExamTakingScreenState extends State<ExamTakingScreen>
    with WidgetsBindingObserver {
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
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive) {
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
          MaterialPageRoute(
              builder: (_) => ResultsScreen(attemptId: result.attemptId)),
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
      HapticFeedback.mediumImpact();
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => ResultsScreen(attemptId: attemptId)),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _submitting = false);
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.message)));
    } catch (_) {
      if (!mounted) return;
      setState(() => _submitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content:
                Text('Could not submit. Check your connection and try again.')),
      );
    }
  }

  Future<void> _confirmSubmit() async {
    final unanswered =
        _exam!.questions.where((q) => !_answers.containsKey(q.id)).length;
    final confirmed = await AppDialogs.confirm(
      context,
      title: 'Submit exam?',
      message: unanswered == 0
          ? 'You\'ve answered every question. Submit now?'
          : 'You have $unanswered unanswered question${unanswered == 1 ? '' : 's'}. Submit anyway?',
      confirmLabel: 'Submit',
      isDestructive: unanswered > 0,
      icon: unanswered > 0
          ? Icons.warning_amber_rounded
          : Icons.check_circle_outline,
    );
    if (confirmed) _submit();
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  // Hardware/gesture back press previously popped this screen with zero
  // warning and zero anti-cheat trail while an exam was genuinely in
  // progress - the attempt stayed resumable server-side (no clock reset,
  // per startOrResumeExam), but a student could silently walk away with no
  // log at all, unlike backgrounding the app (which the lifecycle observer
  // above already logs as a tab switch). Found during a 2026-08-18
  // anti-cheat audit alongside the matching web gap (browser back button).
  // Same "log it, don't block it" design as every other anti-cheat
  // mechanism here - this only confirms + logs, it never prevents leaving.
  Future<void> _handleBackPressed() async {
    if (_exam == null || _exam!.timedOut || _submitting) {
      Navigator.of(context).pop();
      return;
    }
    final confirmed = await AppDialogs.confirm(
      context,
      title: 'Leave this exam?',
      message: 'Your exam is still in progress and the timer keeps running. '
          'If you leave now, your answers so far are saved and you can '
          'resume later, but you won\'t get extra time back.',
      confirmLabel: 'Leave Exam',
      isDestructive: true,
      icon: Icons.warning_amber_rounded,
    );
    if (!confirmed || !mounted) return;
    ApiClient.instance.recordTabSwitch(_exam!.attemptId);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _handleBackPressed();
      },
      child: Scaffold(
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
              final error = snapshot.error;
              final isFreeTierLimit =
                  error is ApiException && error.code == 'free_tier_limit';
              return ErrorView(
                message: errorMessageFor(error!,
                    fallback: 'Could not start this exam.'),
                onRetry: () => Navigator.of(context).pop(),
                retryLabel: 'Go back',
                secondaryAction: isFreeTierLimit
                    ? FilledButton.icon(
                        onPressed: () => Navigator.of(context).pushReplacement(
                            MaterialPageRoute(
                                builder: (_) => const UpgradePlanScreen())),
                        icon: const Icon(Icons.workspace_premium_outlined),
                        label: const Text('Upgrade Plan'),
                      )
                    : null,
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
                          style: Theme.of(context).textTheme.titleMedium,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: lowTime
                              ? Theme.of(context)
                                  .colorScheme
                                  .error
                                  .withValues(alpha: 0.12)
                              : Theme.of(context)
                                  .colorScheme
                                  .surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.timer_outlined,
                                size: 16,
                                color: lowTime
                                    ? Theme.of(context).colorScheme.error
                                    : null),
                            const SizedBox(width: 5),
                            Text(
                              _formatTime(_remainingSeconds),
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: lowTime
                                    ? Theme.of(context).colorScheme.error
                                    : null,
                              ),
                            ),
                          ],
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
                        Text(question.text,
                            style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 16),
                        RadioGroup<int>(
                          groupValue: _answers[question.id],
                          onChanged: (value) {
                            HapticFeedback.selectionClick();
                            setState(() => _answers[question.id] = value!);
                          },
                          child: Column(
                            children:
                                List.generate(question.options.length, (i) {
                              final selected = _answers[question.id] == i;
                              final colors = Theme.of(context).colorScheme;
                              return Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                decoration: BoxDecoration(
                                  color: selected
                                      ? colors.primary.withValues(alpha: 0.08)
                                      : colors.surface,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                      color: selected
                                          ? colors.primary
                                          : colors.outline,
                                      width: selected ? 1.5 : 1),
                                ),
                                child: RadioListTile<int>(
                                  value: i,
                                  title: Text(
                                    question.options[i],
                                    style: TextStyle(
                                        fontWeight: selected
                                            ? FontWeight.w600
                                            : FontWeight.normal),
                                  ),
                                ),
                              );
                            }),
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () {
                            HapticFeedback.lightImpact();
                            setState(() {
                              if (_flagged.contains(question.id)) {
                                _flagged.remove(question.id);
                              } else {
                                _flagged.add(question.id);
                              }
                            });
                          },
                          icon: Icon(
                            _flagged.contains(question.id)
                                ? Icons.flag
                                : Icons.outlined_flag,
                            color: _flagged.contains(question.id)
                                ? Theme.of(context).colorScheme.error
                                : null,
                          ),
                          label: Text(_flagged.contains(question.id)
                              ? 'Flagged for review'
                              : 'Flag for review'),
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
                          onPressed: _currentIndex == 0
                              ? null
                              : () => setState(() => _currentIndex -= 1),
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
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            color: Colors.white),
                                      )
                                    : const Text('Submit'),
                              )
                            : ElevatedButton(
                                onPressed: () =>
                                    setState(() => _currentIndex += 1),
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
            borderRadius: BorderRadius.circular(22),
            // The visible circle stays 36x36 for the palette's density, but
            // the actual tap target is expanded to fill the full 44-height
            // row (accessibility pass, 2026-08-16) - closer to the 48dp
            // recommended minimum than the bare visible circle was.
            child: Container(
              width: 44,
              height: 44,
              alignment: Alignment.center,
              child: Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: background,
                  shape: BoxShape.circle,
                  border: Border.all(
                      color: active ? scheme.primary : scheme.outline),
                ),
                child: Text(
                  '${i + 1}',
                  style: TextStyle(
                    color: active ? scheme.onPrimary : null,
                    fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
