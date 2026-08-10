# TYP Mobile (Flutter)

v1 scope: **student-only** — login → see assigned exams → take a timed exam → results/leaderboard.
Exam-taking itself isn't wired yet (backend attempt-start/submit endpoints don't exist yet); everything
up to and including the exams list is real.

Talks to the existing Next.js app's REST routes under `app/api/mobile/**` — no separate backend.
Base URL is a single const in `lib/services/api_client.dart` (`http://localhost:3000` for local dev
against `npm run dev` in the repo root).

## Structure

```
lib/
  main.dart              — app entrypoint, cold-start auth check (token → /api/mobile/me)
  screens/                — LoginScreen, HomeScreen (3-tab exams list), ProfileScreen
  services/
    api_client.dart       — wraps the 3 mobile API calls (login, exams, me)
    token_storage.dart    — flutter_secure_storage wrapper for the bearer token
  models/                 — AppUser, StudentProfile, AvailableExam/ScheduledExam/CompletedExam
  theme/app_theme.dart    — light/dark ColorScheme, converted from the web app's real
                            app/globals.css OKLCH tokens (not a separately-invented palette)
```

## Running

Flutter SDK isn't installed in the sandbox this was scaffolded in — once it is:

```
cd mobile
flutter pub get
flutter analyze
flutter run
```

Point `ApiClient.baseUrl` at a real deployed URL (or your machine's LAN IP, for a physical device
against local dev) before running on anything other than an emulator hitting `localhost`.
