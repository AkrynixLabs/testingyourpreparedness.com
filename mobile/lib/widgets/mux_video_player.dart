import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

/// Plays a Mux-hosted lesson video via its public HLS playback URL
/// (`https://stream.mux.com/{playbackId}.m3u8`) - the platform-hosted
/// counterpart to course_learn_screen.dart's existing "open externally"
/// path for tutor-pasted video URLs. `video_player` already speaks HLS
/// natively on both platforms (ExoPlayer/AVPlayer); `chewie` just supplies
/// the play/pause/scrub/fullscreen chrome so this isn't a bare unscrubbable
/// video widget.
class MuxVideoPlayer extends StatefulWidget {
  final String hlsUrl;
  const MuxVideoPlayer({super.key, required this.hlsUrl});

  @override
  State<MuxVideoPlayer> createState() => _MuxVideoPlayerState();
}

class _MuxVideoPlayerState extends State<MuxVideoPlayer> {
  late final VideoPlayerController _videoController;
  ChewieController? _chewieController;
  String? _error;

  @override
  void initState() {
    super.initState();
    _videoController = VideoPlayerController.networkUrl(Uri.parse(widget.hlsUrl));
    _videoController.initialize().then((_) {
      if (!mounted) return;
      setState(() {
        _chewieController = ChewieController(
          videoPlayerController: _videoController,
          aspectRatio: _videoController.value.aspectRatio == 0 ? 16 / 9 : _videoController.value.aspectRatio,
          autoPlay: false,
          looping: false,
          allowFullScreen: true,
          materialProgressColors: ChewieProgressColors(
            playedColor: Theme.of(context).colorScheme.primary,
            handleColor: Theme.of(context).colorScheme.primary,
          ),
        );
      });
    }).catchError((_) {
      if (mounted) setState(() => _error = "Couldn't load this video. Check your connection and try again.");
    });
  }

  @override
  void dispose() {
    _chewieController?.dispose();
    _videoController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return AspectRatio(
        aspectRatio: 16 / 9,
        child: Container(
          color: Theme.of(context).colorScheme.errorContainer.withValues(alpha: 0.3),
          alignment: Alignment.center,
          padding: const EdgeInsets.all(16),
          child: Text(_error!, textAlign: TextAlign.center),
        ),
      );
    }
    if (_chewieController == null) {
      return const AspectRatio(
        aspectRatio: 16 / 9,
        child: Center(child: CircularProgressIndicator()),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: AspectRatio(
        aspectRatio: _chewieController!.aspectRatio ?? 16 / 9,
        child: Chewie(controller: _chewieController!),
      ),
    );
  }
}
