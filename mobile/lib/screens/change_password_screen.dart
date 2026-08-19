import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../theme/app_theme.dart';
import '../widgets/app_dialogs.dart';
import '../widgets/async_state_views.dart';

/// Mirrors the web Settings page's "Change Password" card - current
/// password, new password, confirm - via the shared
/// lib/student/change-password.ts function underneath (same "one function,
/// two callers" pattern as account deletion). Closes a real gap: mobile had
/// no way to change a password at all before this (confirmed with the user
/// 2026-08-19), linked from SettingsScreen's list.
class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  final _confirmController = TextEditingController();
  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _currentController.dispose();
    _newController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_newController.text.length < 8) {
      setState(() => _error = 'New password must be at least 8 characters.');
      return;
    }
    if (_newController.text != _confirmController.text) {
      setState(() => _error = 'New passwords do not match.');
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ApiClient.instance.changePassword(
        currentPassword: _currentController.text,
        newPassword: _newController.text,
      );
      if (!mounted) return;
      _currentController.clear();
      _newController.clear();
      _confirmController.clear();
      await AppDialogs.info(
        context,
        title: 'Password changed',
        message: 'Your password has been updated.',
        icon: Icons.check_circle_outline,
        iconColor: Theme.of(context).success,
      );
    } catch (err) {
      setState(() =>
          _error = errorMessageFor(err, fallback: 'Could not change your password.'));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Change Password')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: screenScrollPadding(context, top: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_error != null) ...[
                ErrorBanner(message: _error!),
                const SizedBox(height: 16),
              ],
              TextField(
                controller: _currentController,
                obscureText: _obscureCurrent,
                decoration: InputDecoration(
                  labelText: 'Current Password',
                  suffixIcon: IconButton(
                    icon: Icon(_obscureCurrent
                        ? Icons.visibility_off
                        : Icons.visibility),
                    tooltip: _obscureCurrent ? 'Show password' : 'Hide password',
                    onPressed: () =>
                        setState(() => _obscureCurrent = !_obscureCurrent),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _newController,
                obscureText: _obscureNew,
                decoration: InputDecoration(
                  labelText: 'New Password',
                  helperText: 'At least 8 characters',
                  suffixIcon: IconButton(
                    icon: Icon(
                        _obscureNew ? Icons.visibility_off : Icons.visibility),
                    tooltip: _obscureNew ? 'Show password' : 'Hide password',
                    onPressed: () => setState(() => _obscureNew = !_obscureNew),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _confirmController,
                obscureText: _obscureNew,
                decoration:
                    const InputDecoration(labelText: 'Confirm New Password'),
                onSubmitted: (_) => _saving ? null : _submit(),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _saving ? null : _submit,
                child: _saving
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child:
                            CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Update Password'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
