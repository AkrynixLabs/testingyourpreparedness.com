// `flutter create`'s own stock counter-app test (referencing a `MyApp`
// widget that never existed in this app) was replaced with a real smoke
// test - the app has no network/DB double to test against in a widget test
// (AuthGate hits the real API), so this only verifies the app boots to its
// initial loading state without throwing, rather than faking a deeper test.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:typ_mobile/main.dart';

void main() {
  testWidgets('App boots to the auth-check loading state', (WidgetTester tester) async {
    await tester.pumpWidget(const TypApp());

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
