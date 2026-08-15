import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/user.dart';
import '../services/api_client.dart';
import 'home_screen.dart';

/// Mirrors the web app's app/join two-step flow: verify a school invite
/// code, then fill in name/email/password to create a school-provisioned
/// student account. Independent-student signup (subscription plan + real
/// Paystack checkout) is a deliberately separate, not-yet-built follow-up -
/// this screen only covers the no-billing, school-code path.
class JoinSchoolScreen extends StatefulWidget {
  const JoinSchoolScreen({super.key});

  @override
  State<JoinSchoolScreen> createState() => _JoinSchoolScreenState();
}

class _JoinSchoolScreenState extends State<JoinSchoolScreen> {
  int _step = 1;
  bool _loading = false;
  String? _errorText;
  VerifiedSchool? _school;

  final _codeController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _agreeTerms = false;
  bool _subscribeNewsletter = false;

  @override
  void dispose() {
    _codeController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _verifyCode() async {
    setState(() {
      _loading = true;
      _errorText = null;
    });
    try {
      final school = await ApiClient.instance.verifySchoolCode(_codeController.text.trim());
      setState(() {
        _school = school;
        _step = 2;
      });
    } on ApiException catch (e) {
      setState(() => _errorText = e.message);
    } catch (_) {
      setState(() => _errorText = 'Could not reach TYP. Check your connection and try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorText = 'Passwords do not match.');
      return;
    }

    setState(() {
      _loading = true;
      _errorText = null;
    });
    try {
      final user = await ApiClient.instance.joinSchool(
        schoolCode: _codeController.text.trim(),
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        agreeTerms: _agreeTerms,
        subscribeNewsletter: _subscribeNewsletter,
      );
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => HomeScreen(user: user)),
      );
    } on ApiException catch (e) {
      setState(() => _errorText = e.message);
    } catch (_) {
      setState(() => _errorText = 'Could not reach TYP. Check your connection and try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _openLegalPage(String path) async {
    // Same external-browser pattern as course_learn_screen.dart's lesson
    // links - these are real marketing/marketing site pages, not something
    // to render inside the app. Built off ApiClient.baseUrl (not a
    // hardcoded production domain) so this points at whatever environment
    // --dart-define=API_BASE_URL was built against, same as every API call.
    final uri = Uri.parse('${ApiClient.baseUrl}$path');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Join Your School')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_errorText != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Theme.of(context).colorScheme.error.withValues(alpha: 0.3)),
                  ),
                  child: Text(_errorText!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ),
                const SizedBox(height: 16),
              ],
              if (_step == 1)
                _CodeStep(controller: _codeController)
              else
                _DetailsStep(
                  school: _school!,
                  firstNameController: _firstNameController,
                  lastNameController: _lastNameController,
                  emailController: _emailController,
                  passwordController: _passwordController,
                  confirmPasswordController: _confirmPasswordController,
                  obscurePassword: _obscurePassword,
                  onToggleObscurePassword: () => setState(() => _obscurePassword = !_obscurePassword),
                  agreeTerms: _agreeTerms,
                  onAgreeTermsChanged: (v) => setState(() => _agreeTerms = v ?? false),
                  subscribeNewsletter: _subscribeNewsletter,
                  onSubscribeNewsletterChanged: (v) => setState(() => _subscribeNewsletter = v ?? false),
                  onOpenTerms: () => _openLegalPage('/terms'),
                  onOpenPrivacy: () => _openLegalPage('/privacy'),
                ),
              const SizedBox(height: 24),
              if (_step == 1)
                ElevatedButton(
                  onPressed: _loading ? null : _verifyCode,
                  child: _loading ? const _ButtonSpinner() : const Text('Verify Code'),
                )
              else
                Row(
                  children: [
                    OutlinedButton(
                      onPressed: _loading
                          ? null
                          : () => setState(() {
                                _step = 1;
                                _school = null;
                              }),
                      child: const Text('Back'),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: (_loading || !_agreeTerms) ? null : _submit,
                        child: _loading ? const _ButtonSpinner() : const Text('Complete Registration'),
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

}

class _DetailsStep extends StatelessWidget {
  final VerifiedSchool school;
  final TextEditingController firstNameController;
  final TextEditingController lastNameController;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController confirmPasswordController;
  final bool obscurePassword;
  final VoidCallback onToggleObscurePassword;
  final bool agreeTerms;
  final ValueChanged<bool?> onAgreeTermsChanged;
  final bool subscribeNewsletter;
  final ValueChanged<bool?> onSubscribeNewsletterChanged;
  final VoidCallback onOpenTerms;
  final VoidCallback onOpenPrivacy;

  const _DetailsStep({
    required this.school,
    required this.firstNameController,
    required this.lastNameController,
    required this.emailController,
    required this.passwordController,
    required this.confirmPasswordController,
    required this.obscurePassword,
    required this.onToggleObscurePassword,
    required this.agreeTerms,
    required this.onAgreeTermsChanged,
    required this.subscribeNewsletter,
    required this.onSubscribeNewsletterChanged,
    required this.onOpenTerms,
    required this.onOpenPrivacy,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              Icon(Icons.check_circle, color: Theme.of(context).colorScheme.primary),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(school.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                    Text('${school.town}, ${school.region}', style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: firstNameController,
                decoration: const InputDecoration(labelText: 'First Name'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: lastNameController,
                decoration: const InputDecoration(labelText: 'Last Name'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          autocorrect: false,
          decoration: const InputDecoration(labelText: 'Email Address'),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: passwordController,
          obscureText: obscurePassword,
          decoration: InputDecoration(
            labelText: 'Create Password',
            suffixIcon: IconButton(
              icon: Icon(obscurePassword ? Icons.visibility_off : Icons.visibility),
              onPressed: onToggleObscurePassword,
            ),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: confirmPasswordController,
          obscureText: obscurePassword,
          decoration: const InputDecoration(labelText: 'Confirm Password'),
        ),
        const SizedBox(height: 16),
        // Not wrapped in a whole-row tap-to-toggle (unlike the newsletter
        // checkbox below) since the label itself contains tappable links -
        // a wrapping GestureDetector would fire alongside a link tap and
        // toggle the checkbox at the same time as opening the page.
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(value: agreeTerms, onChanged: onAgreeTermsChanged),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 12),
                child: RichText(
                  text: TextSpan(
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Theme.of(context).colorScheme.onSurface),
                    children: [
                      const TextSpan(text: 'I agree to the '),
                      TextSpan(
                        text: 'Terms of Service',
                        style: TextStyle(color: Theme.of(context).colorScheme.primary, decoration: TextDecoration.underline),
                        recognizer: TapGestureRecognizer()..onTap = onOpenTerms,
                      ),
                      const TextSpan(text: ' and '),
                      TextSpan(
                        text: 'Privacy Policy',
                        style: TextStyle(color: Theme.of(context).colorScheme.primary, decoration: TextDecoration.underline),
                        recognizer: TapGestureRecognizer()..onTap = onOpenPrivacy,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(value: subscribeNewsletter, onChanged: onSubscribeNewsletterChanged),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 12),
                child: GestureDetector(
                  onTap: () => onSubscribeNewsletterChanged(!subscribeNewsletter),
                  child: Text(
                    'Send me marketing emails and feature updates (optional)',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _CodeStep extends StatelessWidget {
  final TextEditingController controller;
  const _CodeStep({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Enter the school code provided by your school',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 16),
        TextField(
          controller: controller,
          textCapitalization: TextCapitalization.characters,
          textAlign: TextAlign.center,
          maxLength: 20,
          style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 2),
          decoration: const InputDecoration(labelText: 'School Code', hintText: 'e.g., ACH-001'),
        ),
      ],
    );
  }
}

class _ButtonSpinner extends StatelessWidget {
  const _ButtonSpinner();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      height: 20,
      width: 20,
      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
    );
  }
}
