import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getVideoLibrary } from '../../services/storage';
import { VideoLibraryEntry } from '../../constants/types';
import { usePalette } from '../../theme/ThemeContext';
import { FONTS } from '../../theme/fonts';
import { FeatherMark } from '../../components/icons/BirdIcons';
import { FadeIn } from '../../components/FadeIn';
import { formatWatchedDate } from '../../utils/greeting';

export default function LibraryScreen() {
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const [library, setLibrary] = useState<VideoLibraryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getVideoLibrary()
      .then(setLibrary)
      .finally(() => setIsLoading(false));
  }, []);

  const renderItem = ({ item }: { item: VideoLibraryEntry }) => {
    const playable = !!item.localPath;
    return (
      <Pressable
        onPress={() => playable && router.push('/video-player')}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
            opacity: pressed && playable ? 0.85 : 1,
          },
        ]}
      >
        <View style={styles.thumbWrap}>
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} resizeMode="cover" />
          {!playable && (
            <View style={[styles.thumbOverlay, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
              <Text style={[styles.thumbOverlayText, { color: '#fff' }]}>No file</Text>
            </View>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.species, { color: palette.text }]}>{item.species}</Text>
          <Text style={[styles.date, { color: palette.sub }]}>
            {formatWatchedDate(item.watchedDate)}
          </Text>
        </View>
        {playable && (
          <Text style={[styles.chevron, { color: palette.sub }]}>›</Text>
        )}
      </Pressable>
    );
  };

  const header = (
    <FadeIn style={[styles.header, { paddingTop: insets.top + 24 }]}>
      <View style={styles.metaRow}>
        <FeatherMark color={palette.accent} size={12} />
        <Text style={[styles.metaText, { color: palette.sub }]}>
          {library.length} {library.length === 1 ? 'BIRD' : 'BIRDS'} · COLLECTION
        </Text>
      </View>
      <Text style={[styles.title, { color: palette.text }]}>Birds you've met</Text>
      <Text style={[styles.subline, { color: palette.sub }]}>
        {library.length === 0
          ? 'Tap an alarm to start your collection.'
          : 'Tap a card to revisit one.'}
      </Text>
    </FadeIn>
  );

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <LinearGradient
        colors={palette.bgGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.accent} />
        </View>
      ) : library.length === 0 ? (
        <>
          {header}
          <View style={styles.centered}>
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <FeatherMark color={palette.accent} size={28} />
              <Text style={[styles.emptyTitle, { color: palette.text }]}>No birds yet</Text>
              <Text style={[styles.emptyText, { color: palette.sub }]}>
                Watched birds will land here. Set an alarm and meet your first one.
              </Text>
            </View>
          </View>
        </>
      ) : (
        <FlatList
          data={library}
          keyExtractor={(item) => item.videoId}
          renderItem={renderItem}
          ListHeaderComponent={header}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, position: 'relative' },
  listContent: { paddingHorizontal: 22 },
  header: { paddingHorizontal: 22, paddingBottom: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: {
    fontSize: 11,
    fontFamily: FONTS.monoMedium,
    letterSpacing: 2,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 38,
    letterSpacing: -0.6,
    lineHeight: 46,
    marginTop: 6,
    marginBottom: 4,
  },
  subline: { fontSize: 14, fontFamily: FONTS.body },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: { fontFamily: FONTS.serifMedium, fontSize: 20 },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbWrap: {
    width: 84,
    height: 64,
    position: 'relative',
  },
  thumb: { width: '100%', height: '100%' },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOverlayText: { fontSize: 10, fontFamily: FONTS.bodySemibold },
  cardBody: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  species: { fontFamily: FONTS.bodySemibold, fontSize: 15, marginBottom: 3 },
  date: { fontFamily: FONTS.body, fontSize: 12 },
  chevron: { fontSize: 22, paddingRight: 14, fontFamily: FONTS.body },
  separator: { height: 10 },
});
