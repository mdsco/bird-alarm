import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { DailyVideoMetadata } from '../constants/types';

interface BirdCardProps {
  video: DailyVideoMetadata;
  isDownloading: boolean;
  downloadProgress: number;
  onDownload: () => void;
  onPlay: () => void;
}

export function BirdCard({ video, isDownloading, downloadProgress, onDownload, onPlay }: BirdCardProps) {
  const isReady = !!video.localPath;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={isReady ? onPlay : undefined} activeOpacity={isReady ? 0.8 : 1}>
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: video.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          {isReady && (
            <View style={styles.playOverlay}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          )}
          {!isReady && !isDownloading && (
            <View style={styles.playOverlay}>
              <Text style={styles.downloadIcon}>↓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.speciesLabel}>TODAY'S BIRD</Text>
        <Text style={styles.species}>{video.species}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {video.description}
        </Text>

        {isDownloading ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{downloadProgress}%</Text>
          </View>
        ) : !isReady ? (
          <TouchableOpacity style={styles.downloadBtn} onPress={onDownload}>
            <Text style={styles.downloadBtnText}>Download Video</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.playBtn} onPress={onPlay}>
            <Text style={styles.playBtnText}>Watch Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e3a5f',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 12,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 220,
    backgroundColor: '#0d2035',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playIcon: {
    fontSize: 48,
    color: '#ffffff',
  },
  downloadIcon: {
    fontSize: 48,
    color: '#8ab4d4',
  },
  info: {
    padding: 20,
  },
  speciesLabel: {
    color: '#1a6dbb',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  species: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: '#8ab4d4',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#0d2035',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1a6dbb',
    borderRadius: 3,
  },
  progressText: {
    color: '#8ab4d4',
    fontSize: 13,
    width: 36,
    textAlign: 'right',
  },
  downloadBtn: {
    backgroundColor: '#0d2035',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a6dbb',
  },
  downloadBtnText: {
    color: '#1a6dbb',
    fontSize: 15,
    fontWeight: '600',
  },
  playBtn: {
    backgroundColor: '#1a6dbb',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  playBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
