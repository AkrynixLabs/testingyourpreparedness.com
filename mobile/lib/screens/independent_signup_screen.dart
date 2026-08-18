import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/user.dart';
import '../services/api_client.dart';
import '../widgets/async_state_views.dart';
import 'login_screen.dart';

/// Independent-student mobile signup - the deliberately-deferred follow-up
/// to join_school_screen.dart's school-code path, now built (confirmed with
/// the user 2026-08-18). Mirrors app/signup/independent's web wizard's
/// account-creation step only - deliberately no plan/checkout step here
/// (see ApiClient.registerIndependentStudent's own note for why); a new
/// account defaults to the free tier and can upgrade later via
/// UpgradePlanScreen once logged in.
class IndependentSignupScreen extends StatefulWidget {
  const IndependentSignupScreen({super.key});

  @override
  State<IndependentSignupScreen> createState() => _IndependentSignupScreenState();
}

// Same 16-region list as app/signup/independent/independent-signup-wizard.tsx
// (and app/signup/school's own copy) - no shared source of truth between web
// and mobile for this, so keep both in sync by hand if it ever changes.
const _ghanaRegions = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Eastern',
  'Central',
  'Northern',
  'Volta',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Western North',
  'Oti',
  'North East',
  'Savannah',
];

class _IndependentSignupScreenState extends State<IndependentSignupScreen> {
  bool _loading = false;
  String? _errorText;
  IndependentRegistrationResult? _result;

  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _townController = TextEditingController();
  final _referralCodeController = TextEditingController();
  String? _region;
  bool _obscurePassword = true;
  bool _agreeTerms = false;
  bool _subscribeNewsletter = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _townController.dispose();
    _referralCodeController.dispose();
    super.dispose();
  }

  Future<void> _openLegalPage(String path) async {
    final uri = Uri.parse('${ApiClient.baseUrl}$path');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  Future<void> _submit() async {
    if (_region == null || _region!.isEmpty) {
      setState(() => _errorText = 'Select your region.');
      return;
    }
    if (_townController.text.trim().isEmpty) {
      setState(() => _errorText = 'Enter your town/city.');
      return;
    }
    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorText = 'Passwords do not match.');
      return;
    }

    setState(() {
      _loading = true;
      _errorText = null;
    });
    try {
      final result = await ApiClient.instance.registerIndependentStudent(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        region: _region!,
        town: _townController.text.trim(),
        agreeTerms: _agreeTerms,
        subscribeNewsletter: _subscribeNewsletter,
        referralCode: _referralCodeController.text.trim(),
      );
      if (!mounted) return;
      setState(() => _result = result);
    } on ApiException catch (e) {
      setState(() => _errorText = e.message);
    } catch (_) {
      setState(() => _errorText = 'Could not reach TYP. Check your connection and try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_result != null) {
      return _CheckEmailStep(
        email: _result!.email,
        onDone: () => Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (route) => false,
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Create Your Account')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Sign up as an independent student - no school required.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 20),
              if (_errorText != null) ...[
                ErrorBanner(message: _errorText!),
                const SizedBox(height: 16),
              ],
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _firstNameController,
                      decoration: const InputDecoration(labelText: 'First Name *'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _lastNameController,
                      decoration: const InputDecoration(labelText: 'Last Name *'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                autocorrect: false,
                decoration: const InputDecoration(labelText: 'Email Address *'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  labelText: 'Create Password *',
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    tooltip: _obscurePassword ? 'Show password' : 'Hide password',
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _confirmPasswordController,
                obscureText: _obscurePassword,
                decoration: const InputDecoration(labelText: 'Confirm Password *'),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _region,
                decoration: const InputDecoration(labelText: 'Region *'),
                items: _ghanaRegions
                    .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                    .toList(),
                onChanged: (v) => setState(() => _region = v),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _townController,
                decoration: const InputDecoration(labelText: 'Town/City *'),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _referralCodeController,
                textCapitalization: TextCapitalization.characters,
                decoration: const InputDecoration(labelText: 'Referral Code (Optional)'),
              ),
              const SizedBox(height: 16),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Checkbox(
                    value: _agreeTerms,
                    onChanged: (v) => setState(() => _agreeTerms = v ?? false),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: RichText(
                        text: TextSpan(
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(color: Theme.of(context).colorScheme.onSurface),
                          children: [
                            const TextSpan(text: 'I agree to the '),
                            TextSpan(
                              text: 'Terms of Service',
                              style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  decoration: TextDecoration.underline),
                              recognizer: TapGestureRecognizer()..onTap = () => _openLegalPage('/terms'),
                            ),
                            const TextSpan(text: ' and '),
                            TextSpan(
                              text: 'Privacy Policy',
                              style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  decoration: TextDecoration.underline),
                              recognizer: TapGestureRecognizer()..onTap = () => _openLegalPage('/privacy'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              MergeSemantics(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Checkbox(
                      value: _subscribeNewsletter,
                      onChanged: (v) => setState(() => _subscribeNewsletter = v ?? false),
                    ),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: GestureDetector(
                          onTap: () => setState(() => _subscribeNewsletter = !_subscribeNewsletter),
                          child: Text(
                            'Send me marketing emails and feature updates (optional)',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: (_loading || !_agreeTerms) ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Create Account'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Shown after a successful signup - the account starts unverified (same as
/// every self-signup path), so there's nothing to sign into yet. Mirrors the
/// web wizard's own post-signup "check your email" confirmation screen.
class _CheckEmailStep extends StatelessWidget {
  final String email;
  final VoidCallback onDone;
  const _CheckEmailStep({required this.email, required this.onDone});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.mark_email_read_outlined,
                    size: 56, color: Theme.of(context).colorScheme.primary),
                const SizedBox(height: 20),
                Text(
                  'Check your email',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                Text(
                  'Your account has been created. We\'ve sent a verification link to $email - '
                  'open it to confirm your address, then come back and log in. '
                  'You\'ll start on the free plan and can upgrade anytime from Settings.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 28),
                ElevatedButton(onPressed: onDone, child: const Text('Back to Log In')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
