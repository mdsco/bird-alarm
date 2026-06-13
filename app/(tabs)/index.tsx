import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAlarms } from '../../hooks/useAlarms';
import { useDailyVideo } from '../../hooks/useDailyVideo';
import { useDeviceId } from '../../hooks/useDeviceId';
import { usePalette } from '../../theme/ThemeContext';
import { FONTS } from '../../theme/fonts';
import { AlarmCard } from '../../components/AlarmCard';
import { FadeIn } from '../../components/FadeIn';
import { FeatherMark, FlyingBirdMark, PlusIcon } from '../../components/icons/BirdIcons';
import { PaletteSwitcher } from '../../components/PaletteSwitcher';
import { greeting, formatHeaderDate } from '../../utils/greeting';
import { computeNextAlarm, formatInterval } from '../../utils/nextAlarm';
import { Alarm } from '../../constants/types';

export default function AlarmListScreen() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { alarms, isLoading, toggleAlarm } = useAlarms();
  const { deviceId } = useDeviceId();
  useDailyVideo(deviceId);
  const [now, setNow] = useState(() => new Date());

  // Tick the "next chime" line every 30s so the countdown stays accurate.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  const next = useMemo(() => computeNextAlarm(alarms, now), [alarms, now]);

  const handleAdd = () => router.push('/edit-alarm');

  const handleToggle = async (id: string) => {
    try {
      await toggleAlarm(id);
    } catch (err) {
      Alert.alert('Cannot toggle alarm', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleCardPress = (alarm: Alarm) => {
    router.push({ pathname: '/edit-alarm', params: { alarmId: alarm.id } });
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bg }]}>
      <LinearGradient
        colors={palette.bgGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative sun glow top-right */}
      <View
        pointerEvents="none"
        style={[
          styles.sunGlow,
          {
            top: insets.top + 30,
            backgroundColor: palette.sunGlow,
            shadowColor: palette.warm,
          },
        ]}
      />

      {/* Decorative flying birds top-right */}
      <View pointerEvents="none" style={[styles.bird1, { top: insets.top + 80 }]}>
        <FlyingBirdMark color={palette.text} />
      </View>
      <View pointerEvents="none" style={[styles.bird2, { top: insets.top + 108 }]}>
        <FlyingBirdMark color={palette.text} small />
      </View>
      <View pointerEvents="none" style={[styles.bird3, { top: insets.top + 102 }]}>
        <FlyingBirdMark color={palette.text} small />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header block */}
        <FadeIn>
          <View style={styles.headerMeta}>
            <FeatherMark color={palette.accent} size={12} />
            <Text style={[styles.headerMetaText, { color: palette.sub }]}>
              {formatHeaderDate(now)}
            </Text>
          </View>
          <Text style={[styles.greeting, { color: palette.text }]}>{greeting(now)}</Text>
          <Text style={[styles.subline, { color: palette.sub }]}>
            {next ? (
              <>
                Next chime in{' '}
                <Text style={{ color: palette.text, fontFamily: FONTS.bodySemibold }}>
                  {formatInterval(next.msUntil)}
                </Text>{' '}
                · {next.alarm.label}
              </>
            ) : alarms.length === 0 ? (
              'No alarms yet. Tap + to add one.'
            ) : (
              'No alarms enabled. Rest easy.'
            )}
          </Text>

          <View style={styles.paletteRow}>
            <PaletteSwitcher />
          </View>
        </FadeIn>

        {/* Alarm cards */}
        <View style={styles.cardStack}>
          {isLoading ? (
            <ActivityIndicator color={palette.accent} />
          ) : alarms.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.emptyText, { color: palette.sub }]}>
                Tap + to set your first alarm
              </Text>
            </View>
          ) : (
            alarms.map((a, i) => (
              <AlarmCard
                key={a.id}
                alarm={a}
                index={i}
                onToggle={() => handleToggle(a.id)}
                onPress={() => handleCardPress(a)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.fab,
          {
            right: 22,
            bottom: insets.bottom + 24,
            shadowColor: palette.accent,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={[palette.warm, palette.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <PlusIcon color="#fff" size={22} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, position: 'relative' },
  scrollContent: {
    paddingHorizontal: 22,
  },
  sunGlow: {
    position: 'absolute',
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.55,
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
  bird1: { position: 'absolute', right: 40, opacity: 0.55 },
  bird2: { position: 'absolute', right: 88, opacity: 0.35 },
  bird3: { position: 'absolute', right: 18, opacity: 0.3 },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerMetaText: {
    fontSize: 11,
    fontFamily: FONTS.monoMedium,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 42,
    fontFamily: FONTS.serif,
    letterSpacing: -0.8,
    lineHeight: 50,
    marginTop: 6,
    marginBottom: 4,
  },
  subline: { fontSize: 14, lineHeight: 21, fontFamily: FONTS.body },
  paletteRow: { marginTop: 18, alignSelf: 'flex-start' },
  cardStack: { marginTop: 20, gap: 14 },
  emptyCard: {
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, fontFamily: FONTS.body, textAlign: 'center' },
  fab: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 14,
    elevation: 10,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
