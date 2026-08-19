import 'package:flutter/material.dart';

/// Hand-rolled shimmer effect (no new dependency, same "no package for a
/// small visual" precedent as the dashboard's own bar chart) - a
/// `ShaderMask` sweeping a lighter gradient band across its child on a
/// loop. Wraps a static arrangement of `SkeletonBox`es that mimic the real
/// content's shape, shown in place of a bare spinner while a screen's
/// first fetch is in flight - the actual layout, so the swap to real
/// content on load doesn't visually jolt as much as a spinner-then-content
/// transition would.
class Shimmer extends StatefulWidget {
  final Widget child;
  const Shimmer({super.key, required this.child});

  @override
  State<Shimmer> createState() => _ShimmerState();
}

class _ShimmerState extends State<Shimmer> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1300))
      ..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final base = colors.surfaceContainerHighest;
    final highlight = colors.brightness == Brightness.dark
        ? Color.lerp(base, Colors.white, 0.14)!
        : Color.lerp(base, Colors.white, 0.8)!;

    return AnimatedBuilder(
      animation: _controller,
      child: widget.child,
      builder: (context, child) {
        final t = _controller.value;
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: [base, highlight, base],
              stops: const [0.4, 0.5, 0.6],
              begin: Alignment(-1 - 3 * t, 0),
              end: Alignment(1 - 3 * t, 0),
            ).createShader(bounds);
          },
          child: child,
        );
      },
    );
  }
}

/// A single solid placeholder block - the shimmer sweep above is what
/// makes a row of these read as "loading" rather than just gray boxes.
class SkeletonBox extends StatelessWidget {
  final double? width;
  final double height;
  final BorderRadius borderRadius;
  const SkeletonBox({
    super.key,
    this.width,
    this.height = 14,
    this.borderRadius = const BorderRadius.all(Radius.circular(6)),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: borderRadius,
      ),
    );
  }
}

/// Mimics home_screen.dart's `_ExamCard` / my_courses_screen.dart's card
/// shape - an icon-badge placeholder, a title bar, and 2 metadata lines.
class ExamCardSkeleton extends StatelessWidget {
  const ExamCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SkeletonBox(
                  width: 44,
                  height: 44,
                  borderRadius: BorderRadius.all(Radius.circular(12))),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SkeletonBox(
                        width: MediaQuery.sizeOf(context).width * 0.5,
                        height: 16),
                    const SizedBox(height: 10),
                    const SkeletonBox(height: 11),
                    const SizedBox(height: 6),
                    SkeletonBox(
                        width: MediaQuery.sizeOf(context).width * 0.35,
                        height: 11),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Repeats ExamCardSkeleton, wrapped in one Shimmer so the sweep is
/// synchronized across every card instead of each animating separately.
class ExamListSkeleton extends StatelessWidget {
  final int count;
  const ExamListSkeleton({super.key, this.count = 5});

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        physics: const NeverScrollableScrollPhysics(),
        itemCount: count,
        itemBuilder: (context, index) => const ExamCardSkeleton(),
      ),
    );
  }
}

/// Mirrors course_catalog_screen.dart's `_CourseCard` compact-row shape
/// (2026-08-19 compacting pass) - a small square thumbnail placeholder +
/// stacked text bars, not the old full-width banner shape, so the loading
/// state doesn't look jarringly different from the real loaded cards.
class CourseCardSkeleton extends StatelessWidget {
  const CourseCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SkeletonBox(
                  width: 60, height: 60, borderRadius: BorderRadius.all(Radius.circular(10))),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SkeletonBox(
                        width: MediaQuery.sizeOf(context).width * 0.5,
                        height: 16),
                    const SizedBox(height: 8),
                    SkeletonBox(
                        width: MediaQuery.sizeOf(context).width * 0.3,
                        height: 12),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        const SkeletonBox(width: 50, height: 12),
                        const Spacer(),
                        SkeletonBox(
                            width: 50,
                            height: 14,
                            borderRadius: BorderRadius.circular(4)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CourseListSkeleton extends StatelessWidget {
  final int count;
  const CourseListSkeleton({super.key, this.count = 4});

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        physics: const NeverScrollableScrollPhysics(),
        itemCount: count,
        itemBuilder: (context, index) => const CourseCardSkeleton(),
      ),
    );
  }
}

/// Mimics dashboard_screen.dart's layout: a 2x2 stat-tile grid, a trend
/// chart block, and a couple of subject-strength bars.
class DashboardSkeleton extends StatelessWidget {
  const DashboardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer(
      child: ListView(
        padding: const EdgeInsets.all(16),
        physics: const NeverScrollableScrollPhysics(),
        children: [
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: List.generate(
              4,
              (_) => const Card(
                margin: EdgeInsets.zero,
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SkeletonBox(
                          width: 34,
                          height: 34,
                          borderRadius: BorderRadius.all(Radius.circular(9))),
                      SizedBox(height: 10),
                      SkeletonBox(width: 48, height: 20),
                      SizedBox(height: 6),
                      SkeletonBox(width: 70, height: 11),
                    ],
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          const SkeletonBox(width: 160, height: 20),
          const SizedBox(height: 10),
          const Card(
            margin: EdgeInsets.zero,
            child: SizedBox(
                height: 130,
                child: SkeletonBox(borderRadius: BorderRadius.zero)),
          ),
          const SizedBox(height: 24),
          const SkeletonBox(width: 140, height: 20),
          const SizedBox(height: 12),
          Card(
            margin: EdgeInsets.zero,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: List.generate(
                  3,
                  (_) => const Padding(
                    padding: EdgeInsets.only(bottom: 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SkeletonBox(width: 100, height: 12),
                        SizedBox(height: 6),
                        SkeletonBox(height: 8),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
