import 'package:flutter/material.dart';

import '../models/user.dart';
import '../services/api_client.dart';

/// Basic profile display off GET /api/mobile/me - not required for v1, but
/// cheap to include since the endpoint already exists.
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late final Future<StudentProfile> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = ApiClient.instance.getProfile();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: FutureBuilder<StudentProfile>(
        future: _profileFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            final message = snapshot.error is ApiException
                ? (snapshot.error as ApiException).message
                : 'Could not load your profile.';
            return Center(child: Text(message));
          }

          final profile = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _ProfileRow(label: 'Name', value: profile.name),
              _ProfileRow(label: 'Email', value: profile.email),
              _ProfileRow(
                label: 'Enrollment',
                value: profile.enrollmentType == 'independent' ? 'Independent student' : 'School-provisioned',
              ),
              if (profile.schoolName != null) _ProfileRow(label: 'School', value: profile.schoolName!),
              if (profile.className != null) _ProfileRow(label: 'Class', value: profile.className!),
            ],
          );
        },
      ),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  final String label;
  final String value;
  const _ProfileRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(label, style: Theme.of(context).textTheme.bodySmall),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
        ),
      ),
    );
  }
}
