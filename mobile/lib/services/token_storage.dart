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

  Future<void> saveToken(String token) => _storage.write(key: _tokenKey, value: token);

  Future<String?> readToken() => _storage.read(key: _tokenKey);

  Future<void> clearToken() => _storage.delete(key: _tokenKey);
}
