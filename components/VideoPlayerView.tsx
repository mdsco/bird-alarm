import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoPlayerViewProps {
  uri: string;           // Local file path or CloudFront URL
  autoPlay?: boolean;
  onPlaybackEnd?: () => void;
  onSleep?: () => void;  // Shows a "sleep" button when provided
}

export function VideoPlayerView({ uri, autoPlay = true, onPlaybackEnd, onSleep }: VideoPlayerViewProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.audioMixingMode = 'doNotMix'; // Activates AVAudioSessionCategoryPlayback on iOS so audio plays
    if (autoPlay) p.play();
  });

  const viewRef = useRef<VideoView>(null);

  React.useEffect(() => {
    if (!onPlaybackEnd) return;
    const subscription = player.addListener('playToEnd', () => {
      onPlaybackEnd();
    });
    return () => subscription.remove();
  }, [player, onPlaybackEnd]);

  React.useEffect(() => {
    const subscription = player.addListener('playingChange', ({ isPlaying: playing }) => {
      setIsPlaying(playing);
    });
    return () => subscription.remove();
  }, [player]);

  const togglePause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={styles.container}>
      <VideoView
        ref={viewRef}
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={togglePause}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#ffffff" />
        </TouchableOpacity>
        {onSleep ? (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onSleep}
            accessibilityLabel="Sleep 10 minutes"
          >
            <Ionicons name="moon" size={32} color="#ffffff" />
          </TouchableOpacity>
        ) : null}
      </View>
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
  controlsRow: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
