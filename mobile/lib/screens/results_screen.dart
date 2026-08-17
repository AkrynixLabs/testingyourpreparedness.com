import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/result_detail.dart';
import '../services/api_client.dart';
import '../theme/app_theme.dart';
import '../widgets/async_state_views.dart';

/// Reached either after a real submit or directly when
/// POST /api/mobile/exams/{id}/start reports `timedOut: true` for an
/// already-expired attempt. Mirrors the web app's
/// app/student/results/[id]/page.tsx's content (score/grade, class
/// comparison, topic breakdown, per-question review) in a scrollable list
/// rather than that page's dashboard-grid layout, to fit a phone screen.
class ResultsScreen extends StatefulWidget {
  final String attemptId;
  const ResultsScreen({super.key, required this.attemptId});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  late Future<ResultDetail> _resultFuture;

  @override
  void initState() {
    super.initState();
    _resultFuture = ApiClient.instance.getResult(widget.attemptId);
  }

  void _retry() {
    setState(
        () => _resultFuture = ApiClient.instance.getResult(widget.attemptId));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Result'),
        automaticallyImplyLeading: false,
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.of(context).popUntil((route) => route.isFirst),
            child: const Text('Done'),
          ),
        ],
      ),
      body: FutureBuilder<ResultDetail>(
        future: _resultFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorView(
              message: errorMessageFor(snapshot.error!,
                  fallback: 'Could not load your result.'),
              onRetry: _retry,
            );
          }

          final result = snapshot.data!;
          return ListView(
            padding: screenScrollPadding(context),
            children: [
              _ScoreHeader(result: result),
              const SizedBox(height: 20),
              _StatsGrid(result: result),
              const SizedBox(height: 20),
              Text('Topic breakdown',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              ...result.topicBreakdown.map((t) => _TopicRow(entry: t)),
              const SizedBox(height: 20),
              Text('Question review',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              ...result.questions.asMap().entries.map(
                  (e) => _QuestionReviewCard(index: e.key, question: e.value)),
            ],
          );
        },
      ),
    );
  }
}

class _ScoreHeader extends StatelessWidget {
  final ResultDetail result;
  const _ScoreHeader({required this.result});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final passed = result.percentage >= 50;
    final scoreColor = passed ? Theme.of(context).success : scheme.error;

    return Card(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 28, 20, 20),
        child: Column(
          children: [
            Container(
              width: 108,
              height: 108,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                    color: scoreColor.withValues(alpha: 0.25), width: 8),
              ),
              alignment: Alignment.center,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${result.percentage}%',
                    style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: scoreColor),
                  ),
                  Text('Grade ${result.grade}',
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            const SizedBox(height: 18),
            Text(result.title,
                style: Theme.of(context).textTheme.titleMedium,
                textAlign: TextAlign.center),
            const SizedBox(height: 2),
            Text(result.subjectName,
                style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 14),
            Text(
                '${result.correctAnswers} correct · ${result.incorrectAnswers} incorrect'),
            const SizedBox(height: 4),
            Text(
              'Submitted ${DateFormat.yMMMd().add_jm().format(result.submittedAt.toLocal())}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  final ResultDetail result;
  const _StatsGrid({required this.result});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('Rank', '${result.rank} / ${result.totalStudents}'),
      ('Percentile', '${result.percentile}th'),
      ('Class average', '${result.classAverage}%'),
      ('Highest score', '${result.highestScore}%'),
      ('Lowest score', '${result.lowestScore}%'),
      if (result.timeSpentSeconds != null)
        ('Time spent', '${(result.timeSpentSeconds! / 60).round()} min'),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 2.4,
      children: items
          .map(
            (item) => Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(item.$1, style: Theme.of(context).textTheme.bodySmall),
                    const SizedBox(height: 2),
                    Text(item.$2,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _TopicRow extends StatelessWidget {
  final TopicBreakdownEntry entry;
  const _TopicRow({required this.entry});

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
              Expanded(child: Text(entry.topic)),
              Text(
                  '${entry.correct}/${entry.total} (${entry.percentage.round()}%)'),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: entry.total == 0 ? 0 : entry.correct / entry.total,
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuestionReviewCard extends StatelessWidget {
  final int index;
  final ResultQuestion question;
  const _QuestionReviewCard({required this.index, required this.question});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final color = question.isCorrect ? Theme.of(context).success : scheme.error;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(question.isCorrect ? Icons.check_circle : Icons.cancel,
                    color: color, size: 18),
                const SizedBox(width: 6),
                Expanded(
                  child: Text('Q${index + 1}. ${question.text}',
                      style: Theme.of(context).textTheme.titleSmall),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Your answer: ${question.yourAnswer}',
                style: TextStyle(color: color)),
            if (!question.isCorrect)
              Text('Correct answer: ${question.correctAnswer}',
                  style: TextStyle(color: Theme.of(context).success)),
            if (question.explanation != null) ...[
              const SizedBox(height: 6),
              Text(question.explanation!,
                  style: Theme.of(context).textTheme.bodySmall),
            ],
          ],
        ),
      ),
    );
  }
}
