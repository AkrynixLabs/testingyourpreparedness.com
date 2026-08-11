import 'package:flutter/material.dart';

/// Lets ApiClient (no BuildContext of its own) redirect to LoginScreen from
/// anywhere - e.g. a 401 raised by a background call mid-exam - without
/// threading a context through every screen. Set on MaterialApp.navigatorKey
/// in main.dart; this file exists on its own (rather than living in
/// main.dart or api_client.dart directly) purely to avoid a main.dart <->
/// api_client.dart import cycle.
final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();
