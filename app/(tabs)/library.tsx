import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getVideoLibrary } from '../../services/storage';
import { VideoLibraryEntry } from '../../constants/types';

export default function LibraryScreen() {
  const router = useRouter();
  const [library, setLibrary] = useState<VideoLibraryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getVideoLibrary()
      .then(setLibrary)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1a6dbb" />
      </View>
    );
  }

  if (library.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyEmoji}>🐦</Text>
        <Text style={styles.emptyTitle}>No birds yet</Text>
        <Text style={styles.emptyText}>
          Birds you've watched will appear here. Set your alarm and let your first one arrive!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={library}
      keyExtractor={(item) => item.videoId}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.entry}
          onPress={() => item.localPath && router.push('/video-player')}
          activeOpacity={item.localPath ? 0.7 : 1}
        >
          <View style={styles.thumbContainer}>
            <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
            {!item.localPath && (
              <View style={styles.thumbOverlay}>
                <Text style={styles.thumbOverlayText}>No file</Text>
              </View>
            )}
          </View>
          <View style={styles.entryInfo}>
            <Text style={styles.entrySpecies}>{item.species}</Text>
            <Text style={styles.entryDate}>{item.watchedDate}</Text>
          </View>
          {item.localPath && <Text style={styles.chevron}>›</Text>}
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        <Text style={styles.header}>
          {library.length} {library.length === 1 ? 'bird' : 'birds'} discovered
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1628',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#0a1628',
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  emptyText: {
    color: '#4a7aa0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    color: '#4a7aa0',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a5f',
    borderRadius: 14,
    overflow: 'hidden',
  },
  thumbContainer: {
    width: 80,
    height: 60,
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOverlayText: {
    color: '#8ab4d4',
    fontSize: 10,
  },
  entryInfo: {
    flex: 1,
    padding: 12,
  },
  entrySpecies: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  entryDate: {
    color: '#4a7aa0',
    fontSize: 12,
  },
  chevron: {
    color: '#4a7aa0',
    fontSize: 22,
    paddingRight: 12,
  },
  separator: {
    height: 8,
  },
});
