import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { usePalette } from '../theme/ThemeContext';

const WIDTH = 48;
const HEIGHT = 28;
const KNOB = 24;
const PAD = 2;

type Props = {
  value: boolean;
  onValueChange: () => void;
  disabled?: boolean;
};

/** Pill toggle with a sliding knob, palette-aware. */
export function Toggle({ value, onValueChange, disabled }: Props) {
  const palette = usePalette();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // we animate background color and left position
    }).start();
  }, [value, anim]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D0CABD', palette.accent],
  });
  const left = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [PAD, WIDTH - KNOB - PAD],
  });

  return (
    <Pressable
      onPress={onValueChange}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [styles.pressable, pressed && !disabled && { opacity: 0.85 }]}
    >
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.knob, { left }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: WIDTH,
    height: HEIGHT,
  },
  track: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: 999,
    position: 'relative',
  },
  knob: {
    position: 'absolute',
    top: PAD,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
});
