import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { PALETTES, PALETTE_KEYS } from '../theme/palettes';

const DOT_SIZE = 28;
const RING_PAD = 3;

/**
 * Inline 4-dot palette selector. Each dot is a small warm→accent gradient
 * matching the corresponding palette; the selected one gets a thin ring in
 * the active palette's text color.
 */
export function PaletteSwitcher() {
  const { paletteKey, setPaletteKey, palette: active } = useTheme();

  return (
    <View style={styles.row}>
      {PALETTE_KEYS.map((key) => {
        const p = PALETTES[key];
        const selected = key === paletteKey;
        return (
          <Pressable
            key={key}
            onPress={() => setPaletteKey(key)}
            hitSlop={6}
            accessibilityLabel={`Use ${p.name} palette`}
            style={({ pressed }) => [
              styles.ring,
              {
                borderColor: selected ? active.text : 'transparent',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <LinearGradient
              colors={[p.warm, p.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dot}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  ring: {
    width: DOT_SIZE + RING_PAD * 2,
    height: DOT_SIZE + RING_PAD * 2,
    borderRadius: (DOT_SIZE + RING_PAD * 2) / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
