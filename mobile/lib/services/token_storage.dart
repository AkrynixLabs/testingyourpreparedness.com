import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// The mobile bearer token is a real credential (same trust level as the
/// web app's JWT session cookie) - stored via flutter_secure_storage
/// (Keychain on iOS, EncryptedSharedPreferences on Android), not plain
/// SharedPreferences.
class TokenStorage {
  TokenStorage._();
  static final TokenStorage instance = TokenStorage._();

  final _storage = const FlutterSecureStorage();
  static const _tokenKey = 'typ_auth_token';
  static const _cachedUserKey = 'typ_cached_user';

  Future<void> saveToken(String token) => _storage.write(key: _tokenKey, value: token);

  Future<String?> readToken() => _storage.read(key: _tokenKey);

  Future<void> clearToken() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _cachedUserKey);
  }

  /// A small local cache of the last-confirmed `{id, name, email}` - lets
  /// AuthGate put the user straight into HomeScreen on a cold start even
  /// when GET /api/mobile/me can't be reached right then (no connectivity
  /// immediately after resume, a timeout, a transient 5xx), instead of
  /// treating "couldn't verify the token *right now*" the same as "the
  /// token is actually invalid" and forcing a fresh login. Deliberately
  /// just 3 plain fields, not a full StudentProfile cache - enough to
  /// reconstruct AppUser and let the rest of the app's own screens fetch
  /// their own fresh data as normal.
  Future<void> saveCachedUser({required String id, required String name, required String email}) {
    return _storage.write(key: _cachedUserKey, value: jsonEncode({'id': id, 'name': name, 'email': email}));
  }

  Future<Map<String, String>?> readCachedUser() async {
    final raw = await _storage.read(key: _cachedUserKey);
    if (raw == null) return null;
    try {
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      return decoded.map((key, value) => MapEntry(key, value as String));
    } catch (_) {
      return null;
    }
  }
}
