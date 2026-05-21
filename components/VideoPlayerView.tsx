import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoPlayerViewProps {
  uri: string;
  autoPlay?: boolean;
  onPlaybackEnd?: () => void;
}

/**
 * Minimal video display: just the video, full-bleed, with tap-to-toggle-pause.
 * All ringing-screen overlay UI lives in the parent route.
 */
export function VideoPlayerView({ uri, autoPlay = true, onPlaybackEnd }: VideoPlayerViewProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.audioMixingMode = 'doNotMix';
    if (autoPlay) p.play();
  });

  const viewRef = useRef<VideoView>(null);

  React.useEffect(() => {
    if (!onPlaybackEnd) return;
    const subscription = player.addListener('playToEnd', () => onPlaybackEnd());
    return () => subscription.remove();
  }, [player, onPlaybackEnd]);

  React.useEffect(() => {
    const subscription = player.addListener('playingChange', ({ isPlaying: playing }) => {
      setIsPlaying(playing);
    });
    return () => subscription.remove();
  }, [player]);

  const togglePause = () => {
    if (isPlaying) player.pause();
    else player.play();
  };

  return (
    <Pressable style={styles.container} onPress={togglePause}>
      <VideoView
        ref={viewRef}
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  video: { width: '100%', height: '100%' },
});
