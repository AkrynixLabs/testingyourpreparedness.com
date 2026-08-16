import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// User-controlled light/dark/system theme preference - added 2026-08-16
/// after a user-reported point of confusion: the app previously had no
/// explicit `themeMode`, so `MaterialApp` fell back to its own default
/// (`ThemeMode.system`) and rendered fully dark on any phone already set to
/// system dark mode, with no way to override it from inside the app.
/// Defaults to light (the user's explicit ask - "nice to be in white"),
/// not `system`, and is persisted via the same `flutter_secure_storage`
/// instance `TokenStorage` already uses (no new dependency for one small
/// string preference - not sensitive data, just reusing what's already
/// wired up).
class ThemeController extends ChangeNotifier {
  ThemeController._() {
    _load();
  }
  static final ThemeController instance = ThemeController._();

  static const _storage = FlutterSecureStorage();
  static const _key = 'typ_theme_mode';

  ThemeMode _mode = ThemeMode.light;
  ThemeMode get mode => _mode;

  Future<void> _load() async {
    try {
      final raw = await _storage.read(key: _key);
      final restored = switch (raw) {
        'dark' => ThemeMode.dark,
        'system' => ThemeMode.system,
        'light' => ThemeMode.light,
        _ => ThemeMode.light,
      };
      if (restored != _mode) {
        _mode = restored;
        notifyListeners();
      }
    } catch (_) {
      // Best-effort - a storage/platform-channel error just means the app
      // opens on the light default rather than a remembered preference,
      // never a crash.
    }
  }

  Future<void> setMode(ThemeMode mode) async {
    if (mode == _mode) return;
    _mode = mode;
    notifyListeners();
    try {
      await _storage.write(key: _key, value: mode.name);
    } catch (_) {
      // Best-effort - the in-memory switch above already applied for this
      // session even if persisting it failed.
    }
  }
}
