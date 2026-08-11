import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// Renders Paystack's own hosted checkout page for a course purchase - no
/// raw card entry happens in this app, matching the web app's exact rule
/// (see lib/payments/paystack.ts / app/student/courses/actions.ts). Never
/// lets the app/api/mobile/courses/[id]/purchase's real callbackUrl
/// (the same URL the web app itself redirects to) actually finish loading -
/// intercepts navigation to it first, extracts `?reference=`, and pops back
/// to the caller with that reference so a native result can be shown
/// instead of the web app's own HTML confirmation page.
class CoursePurchaseWebviewScreen extends StatefulWidget {
  final String authorizationUrl;
  const CoursePurchaseWebviewScreen({super.key, required this.authorizationUrl});

  @override
  State<CoursePurchaseWebviewScreen> createState() => _CoursePurchaseWebviewScreenState();
}

class _CoursePurchaseWebviewScreenState extends State<CoursePurchaseWebviewScreen> {
  late final WebViewController _controller;
  bool _loading = true;
  bool _resolved = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() => _loading = true);
          },
          onPageFinished: (_) {
            if (mounted) setState(() => _loading = false);
          },
          onNavigationRequest: (request) {
            final uri = Uri.tryParse(request.url);
            // Matches on the path rather than the full host so this keeps
            // working whether ApiClient.baseUrl points at localhost, a LAN
            // IP, or a real deployed domain - the callback route itself
            // (app/student/courses/checkout/callback) is the fixed part.
            if (uri != null && uri.path.endsWith('/student/courses/checkout/callback')) {
              final reference = uri.queryParameters['reference'] ?? uri.queryParameters['trxref'];
              _resolve(reference);
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.authorizationUrl));
  }

  void _resolve(String? reference) {
    if (_resolved) return;
    _resolved = true;
    Navigator.of(context).pop(reference);
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) _resolve(null);
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Checkout'),
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () => _resolve(null),
          ),
        ),
        body: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_loading) const LinearProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
