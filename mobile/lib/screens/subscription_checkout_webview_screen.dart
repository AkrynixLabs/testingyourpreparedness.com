import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

/// Same shape as course_purchase_webview_screen.dart, matching against the
/// subscription checkout's own callback route
/// (app/signup/independent/checkout/callback) instead of the course one -
/// Paystack's own hosted checkout page is the only thing that ever renders
/// here, no raw card entry in this app.
class SubscriptionCheckoutWebviewScreen extends StatefulWidget {
  final String authorizationUrl;
  const SubscriptionCheckoutWebviewScreen({super.key, required this.authorizationUrl});

  @override
  State<SubscriptionCheckoutWebviewScreen> createState() => _SubscriptionCheckoutWebviewScreenState();
}

class _SubscriptionCheckoutWebviewScreenState extends State<SubscriptionCheckoutWebviewScreen> {
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
            if (uri != null && uri.path.endsWith('/signup/independent/checkout/callback')) {
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
            tooltip: 'Close checkout',
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
