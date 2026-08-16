import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';

/// Wraps the whole app (see main.dart's MaterialApp.builder) with a slim,
/// dismissable-by-reconnecting banner whenever the device has no network
/// connection at all - distinct from the per-screen "Could not reach TYP"
/// error messages, which only ever show up after an actual failed request
/// and say nothing while the user is just sitting on an already-loaded
/// screen with no signal. This is a real, always-visible "you're offline"
/// signal instead, sourced from the OS's own connectivity state rather than
/// inferred from a failed API call.
///
/// Deliberately reports on/off connectivity to the local network/radio
/// only, not real internet reachability (a captive portal or a fully dead
/// upstream link can't be told apart from this) - matches what every other
/// app checks this same way, and the per-screen error messages already
/// cover the "connected but can't actually reach the server" case.
class ConnectivityBanner extends StatefulWidget {
  final Widget child;
  const ConnectivityBanner({super.key, required this.child});

  @override
  State<ConnectivityBanner> createState() => _ConnectivityBannerState();
}

class _ConnectivityBannerState extends State<ConnectivityBanner> {
  bool _offline = false;

  @override
  void initState() {
    super.initState();
    // Best-effort: a platform without this plugin wired up (or a transient
    // channel error) should never crash the app over a "you're offline"
    // banner - it just doesn't show one, same fail-open spirit as this
    // app's other non-essential integrations.
    Connectivity().checkConnectivity().then(_onResult).catchError((_) {});
    Connectivity().onConnectivityChanged.listen(_onResult, onError: (_) {});
  }

  void _onResult(List<ConnectivityResult> results) {
    if (!mounted) return;
    setState(() => _offline = results.every((r) => r == ConnectivityResult.none));
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AnimatedSize(
          duration: const Duration(milliseconds: 200),
          child: _offline ? _OfflineBar(top: MediaQuery.paddingOf(context).top) : const SizedBox.shrink(),
        ),
        Expanded(child: widget.child),
      ],
    );
  }
}

class _OfflineBar extends StatelessWidget {
  final double top;
  const _OfflineBar({required this.top});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Semantics(
      liveRegion: true,
      label: "You're offline. Some features may not work.",
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.fromLTRB(16, top + 8, 16, 8),
        color: colors.error,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.wifi_off, size: 16, color: colors.onError),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                "You're offline. Some features may not work.",
                style: TextStyle(color: colors.onError, fontSize: 12.5, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
