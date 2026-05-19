import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoPlayerViewProps {
  uri: string;           // Local file path or CloudFront URL
  autoPlay?: boolean;
  onPlaybackEnd?: () => void;
}

export function VideoPlayerView({ uri, autoPlay = true, onPlaybackEnd }: VideoPlayerViewProps) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.audioMixingMode = 'doNotMix'; // Activates AVAudioSessionCategoryPlayback on iOS so audio plays
    if (autoPlay) p.play();
  });

  const viewRef = useRef<VideoView>(null);

  // Listen for playback end
  React.useEffect(() => {
    if (!onPlaybackEnd) return;
    const subscription = player.addListener('playToEnd', () => {
      onPlaybackEnd();
    });
    return () => subscription.remove();
  }, [player, onPlaybackEnd]);

  return (
    <View style={styles.container}>
      <VideoView
        ref={viewRef}
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls
        allowsFullscreen
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
