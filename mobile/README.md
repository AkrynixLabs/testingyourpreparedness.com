# TYP Mobile (Flutter)

v1 scope: **student-only** — login → see assigned exams → take a timed exam → results. The full loop
is real: exam-taking (timer, tab-switch anti-cheat logging, idempotent submit) and the results screen
are both wired against real backend endpoints, not stubbed. Course marketplace and other roles are a
later scope expansion, not part of this app yet.

Talks to the existing Next.js app's REST routes under `app/api/mobile/**` — no separate backend, no
duplicated business logic (the mobile routes call the same `lib/student/*.ts` functions the web app's
own student pages use).

## Structure

```
lib/
  main.dart                    — app entrypoint; AuthGate re-verifies a stored token against
                                  GET /api/mobile/me on cold start rather than trusting it blindly
  screens/
    login_screen.dart          — email/password, shows a "session expired" banner when redirected
                                  here by ApiClient's app-wide 401 handling
    home_screen.dart           — 3-tab exams list (available / scheduled / completed)
    exam_taking_screen.dart    — timer seeded from the server's remainingSeconds, question
                                  navigator, flag-for-review, WidgetsBindingObserver-driven
                                  tab-switch logging on paused/inactive, auto-submit at zero
    results_screen.dart        — score/grade/rank/topic-breakdown/question-review detail
    profile_screen.dart        — GET /api/mobile/me
  services/
    api_client.dart            — every mobile API call; _authorizedRequest is the shared path
                                  that triggers the app-wide 401 → logout → LoginScreen redirect
    navigation_service.dart    — rootNavigatorKey, so api_client.dart (no BuildContext of its
                                  own) can navigate on a 401 without threading context through
                                  every screen
    token_storage.dart         — flutter_secure_storage wrapper for the bearer token
  models/                      — AppUser, StudentProfile, AvailableExam/ScheduledExam/
                                  CompletedExam, ExamStart, ResultDetail
  widgets/async_state_views.dart — shared LoadingView/ErrorView/EmptyView used by every
                                  FutureBuilder screen instead of each one inventing its own
  theme/app_theme.dart          — light/dark ColorScheme, converted from the web app's real
                                  app/globals.css OKLCH tokens (not a separately-invented palette)
android/, ios/                  — real flutter create scaffolding (not empty placeholders),
                                  with real launcher icons + splash screen generated from the
                                  web app's own public/icon.svg mark
```

## Running

```
cd mobile
flutter pub get
flutter analyze
flutter test
flutter run
```

The Flutter SDK isn't preinstalled in most sandboxes this project has been developed in — grab a
current stable release from https://docs.flutter.dev/get-started/install if `flutter` isn't on your
PATH. CI (`.github/workflows/mobile-ci.yml`) is pinned to 3.44.9 stable; match that locally if you
want to reproduce a CI result exactly.

### Pointing at a real backend

`ApiClient.baseUrl` defaults to `http://localhost:3000` (this repo's Next.js dev server) and is
configurable via `--dart-define` without touching code:

```
flutter run --dart-define=API_BASE_URL=https://your-deployed-url.example.com
```

Testing on an **Android emulator** against a local `npm run dev`: `localhost` resolves to the
emulator itself, not your host machine — use the emulator's documented host-loopback alias instead:

```
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000
```

iOS simulator and a physical device on the same LAN don't need this — `localhost` (simulator) or
your machine's LAN IP (physical device) work as expected.

## What's not built yet

- Course marketplace (browse/purchase/watch) and any role other than Student.
- Push notifications — needs a real vendor decision (FCM/APNs) before any work starts, per this
  project's "flag new dependencies before building" convention (see root `CLAUDE.md`).
- Offline support/caching.
- No actual native build (`flutter build apk`, an Xcode archive) has been run against this project
  yet — verification so far is `flutter analyze` + `flutter test`, run in a sandbox with no Java/
  Android SDK or Xcode/macOS available. Worth a real device/emulator smoke test before shipping.
