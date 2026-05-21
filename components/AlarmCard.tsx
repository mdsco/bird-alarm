import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Alarm } from '../constants/types';
import { usePalette } from '../theme/ThemeContext';
import { FONTS } from '../theme/fonts';
import { Toggle } from './Toggle';
import { BirdIcon } from './icons/BirdIcons';
import { formatRepeat } from '../utils/greeting';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Props = {
  alarm: Alarm;
  onToggle: () => void;
  onPress?: () => void;
  /** Index in the visible list. Used to stagger the mount animation. */
  index?: number;
};

export function AlarmCard({ alarm, onToggle, onPress, index = 0 }: Props) {
  const palette = usePalette();
  const repeatStr = formatRepeat(alarm.repeat);

  // Fade + slight upward slide on mount, staggered by index so the list cascades in.
  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 380,
      delay: 80 + index * 60,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);
  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  return (
    <Animated.View style={{ opacity: enter, transform: [{ translateY }] }}>
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          shadowColor: alarm.on ? palette.accent : '#000',
          shadowOpacity: alarm.on ? 0.18 : 0.04,
          shadowRadius: alarm.on ? 16 : 2,
          shadowOffset: alarm.on ? { width: 0, height: 8 } : { width: 0, height: 1 },
          elevation: alarm.on ? 4 : 1,
          opacity: alarm.on ? 1 : 0.7,
        },
        pressed && onPress ? { transform: [{ scale: 0.997 }] } : null,
      ]}
    >
      {alarm.on && (
        <LinearGradient
          colors={[palette.warm, palette.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accentBar}
        />
      )}

      <View style={styles.timeRow}>
        <Text style={[styles.time, { color: palette.text }]}>
          {String(alarm.hour).padStart(2, '0')}:{String(alarm.minute).padStart(2, '0')}
        </Text>
        <Text style={[styles.ampm, { color: palette.sub }]}>{alarm.ampm}</Text>
        <View style={{ flex: 1 }} />
        <Toggle value={alarm.on} onValueChange={onToggle} />
      </View>

      <View style={styles.metaRow}>
        <BirdIcon name={alarm.icon} color={palette.accent} size={16} />
        <Text style={[styles.label, { color: palette.text }]}>{alarm.label}</Text>
        <Text style={[styles.dot, { color: palette.sub }]}>·</Text>
        <Text style={[styles.repeat, { color: palette.sub }]}>{repeatStr}</Text>
      </View>

      <View style={styles.daysRow}>
        {DAY_LABELS.map((d, i) => {
          const active = alarm.repeat.includes(i as 0 | 1 | 2 | 3 | 4 | 5 | 6);
          return (
            <View
              key={i}
              style={[
                styles.dayDot,
                {
                  backgroundColor: active ? palette.accent : 'transparent',
                  borderColor: active ? 'transparent' : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayLabel,
                  { color: active ? '#fff' : palette.sub },
                ]}
              >
                {d}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  time: {
    fontSize: 44,
    fontFamily: FONTS.serifMedium,
    letterSpacing: -0.5,
    lineHeight: 46,
  },
  ampm: {
    fontSize: 12,
    fontFamily: FONTS.monoSemibold,
    marginBottom: 6,
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: FONTS.bodyMedium,
  },
  dot: {
    fontSize: 13,
    opacity: 0.5,
  },
  repeat: {
    fontSize: 13,
    fontFamily: FONTS.body,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  dayDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 10,
    fontFamily: FONTS.bodySemibold,
  },
});
