// ⚠️ PLACEHOLDER FILE - not real Firebase project configuration.
//
// This file exists so the app compiles and `flutter analyze`/`flutter test`
// pass without a real Firebase project - it lets PushNotificationService's
// Firebase.initializeApp() call fail gracefully at *runtime* (caught,
// logged, push silently disabled) instead of the whole app failing to
// *compile* because this file's import doesn't exist.
//
// This is NOT what a real FlutterFire setup looks like. To wire up real
// push notifications:
//   1. Create a Firebase project at https://console.firebase.google.com
//      (enable Cloud Messaging - it's on by default for a new project).
//   2. Add an Android app with package name `com.typ.mobile.typ_mobile`
//      (see mobile/android/app/build.gradle.kts's `applicationId`) and an
//      iOS app with the matching bundle ID (see mobile/ios/Runner.xcodeproj).
//   3. From `mobile/`, run: `dart pub global activate flutterfire_cli` then
//      `flutterfire configure`. This OVERWRITES this file with your real
//      project's values and drops `google-services.json` into
//      `android/app/` (+ `GoogleService-Info.plist` into `ios/Runner/` if
//      you add iOS) - both required for the native SDKs to actually connect.
//   4. Generate a service account key (Project Settings -> Service Accounts
//      -> Generate new private key) and set its JSON as
//      `FIREBASE_SERVICE_ACCOUNT_JSON` in the web app's `.env` (see
//      lib/push/fcm.ts and .env.example) - that's the backend's half, lets
//      it actually send messages through this same project.
//
// Until all of the above happens, PushNotificationService's init is a
// no-op (Firebase.initializeApp() throws against these placeholder values,
// caught and swallowed) - the rest of the app is completely unaffected,
// same "safe to ship without real keys" pattern as every other integration
// in this project (Paystack/Resend/Sentry/Upstash/Brevo).

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) return web;
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
            'FirebaseOptions have not been configured for this platform.');
    }
  }

  static const web = FirebaseOptions(
    apiKey: 'placeholder-not-a-real-key',
    appId: '1:000000000000:web:0000000000000000000000',
    messagingSenderId: '000000000000',
    projectId: 'typ-placeholder-project',
  );

  static const android = FirebaseOptions(
    apiKey: 'placeholder-not-a-real-key',
    appId: '1:000000000000:android:0000000000000000000000',
    messagingSenderId: '000000000000',
    projectId: 'typ-placeholder-project',
  );

  static const ios = FirebaseOptions(
    apiKey: 'placeholder-not-a-real-key',
    appId: '1:000000000000:ios:0000000000000000000000',
    messagingSenderId: '000000000000',
    projectId: 'typ-placeholder-project',
    iosBundleId: 'com.typ.mobile.typMobile',
  );
}
