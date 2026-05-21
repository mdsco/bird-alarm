import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { AmPm } from '../constants/types';
import { usePalette } from '../theme/ThemeContext';
import { FONTS } from '../theme/fonts';

const DIAL_SIZE = 340;
const CENTER = DIAL_SIZE / 2;
const DIAL_RADIUS = 144;
const TICK_OUTER = 152;
const LABEL_RADIUS = 170;
const ARC_RADIUS = 130;
const KNOB_RADIUS = 122;
const KNOB_SIZE = 56;

type Mode = 'hour' | 'minute';

type Props = {
  hour: number;        // 1..12
  minute: number;      // 0..59
  ampm: AmPm;
  onChange: (next: { hour: number; minute: number; ampm: AmPm }) => void;
};

export function TimePicker({ hour, minute, ampm, onChange }: Props) {
  const palette = usePalette();
  const [mode, setMode] = useState<Mode>('hour');

  // Convert pointer coords (relative to dial view, 0..DIAL_SIZE) into a value
  // for the current mode. Angle: 0 = 12 o'clock, increases clockwise.
  const setFromPointer = (x: number, y: number) => {
    const dx = x - CENTER;
    const dy = y - CENTER;
    let theta = Math.atan2(dx, -dy);
    if (theta < 0) theta += Math.PI * 2;
    const turn = theta / (Math.PI * 2);
    if (mode === 'hour') {
      let h = Math.round(turn * 12);
      if (h === 0) h = 12;
      onChange({ hour: h, minute, ampm });
    } else {
      const m = Math.round(turn * 60) % 60;
      onChange({ hour, minute: m, ampm });
    }
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .minDistance(0)
        .onBegin((e) => setFromPointer(e.x, e.y))
        .onUpdate((e) => setFromPointer(e.x, e.y)),
    [mode, hour, minute, ampm],
  );

  // Current angle of the knob (degrees, clockwise from 12 o'clock).
  const angle = mode === 'hour' ? ((hour % 12) / 12) * 360 : (minute / 60) * 360;
  const rad = (angle * Math.PI) / 180;
  const sunX = Math.sin(rad) * KNOB_RADIUS;
  const sunY = -Math.cos(rad) * KNOB_RADIUS;

  // 60 tick marks (every 5th is major)
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const a = (i / 60) * 360;
    const ar = (a * Math.PI) / 180;
    const len = major ? 10 : 4;
    const inner = TICK_OUTER - len;
    const x1 = Math.sin(ar) * TICK_OUTER;
    const y1 = -Math.cos(ar) * TICK_OUTER;
    const x2 = Math.sin(ar) * inner;
    const y2 = -Math.cos(ar) * inner;
    ticks.push(
      <Line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={major ? palette.text : palette.sub}
        strokeOpacity={major ? 0.45 : 0.18}
        strokeWidth={major ? 1.6 : 1}
        strokeLinecap="round"
      />,
    );
  }

  // Arc trail from 12 o'clock to knob
  const a = Math.max(0.0001, Math.min(359.999, angle));
  const arcRad = (a * Math.PI) / 180;
  const arcX = Math.sin(arcRad) * ARC_RADIUS;
  const arcY = -Math.cos(arcRad) * ARC_RADIUS;
  const large = a > 180 ? 1 : 0;
  const arcD = `M 0 ${-ARC_RADIUS} A ${ARC_RADIUS} ${ARC_RADIUS} 0 ${large} 1 ${arcX} ${arcY}`;

  // Knob position inside the dial container (top-left of the 56×56 view).
  const knobLeft = CENTER + sunX - KNOB_SIZE / 2;
  const knobTop = CENTER + sunY - KNOB_SIZE / 2;

  return (
    <View style={styles.wrapper}>
      {/* Time readout */}
      <View style={styles.readout}>
        <Pressable
          onPress={() => setMode('hour')}
          style={[
            styles.numBtn,
            {
              backgroundColor: mode === 'hour' ? palette.accentSoft : 'transparent',
              borderColor: mode === 'hour' ? palette.accent : 'transparent',
            },
          ]}
        >
          <Text style={[styles.numText, { color: palette.text }]}>{pad(hour)}</Text>
        </Pressable>
        <Text style={[styles.colon, { color: palette.sub }]}>:</Text>
        <Pressable
          onPress={() => setMode('minute')}
          style={[
            styles.numBtn,
            {
              backgroundColor: mode === 'minute' ? palette.accentSoft : 'transparent',
              borderColor: mode === 'minute' ? palette.accent : 'transparent',
            },
          ]}
        >
          <Text style={[styles.numText, { color: palette.text }]}>{pad(minute)}</Text>
        </Pressable>
        <View style={styles.ampmStack}>
          {(['AM', 'PM'] as const).map((v) => {
            const active = ampm === v;
            return (
              <Pressable
                key={v}
                onPress={() => onChange({ hour, minute, ampm: v })}
                style={[
                  styles.ampmBtn,
                  { backgroundColor: active ? palette.accent : 'transparent' },
                ]}
              >
                <Text
                  style={[
                    styles.ampmText,
                    { color: active ? '#fff' : palette.sub },
                  ]}
                >
                  {v}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Dial */}
      <GestureDetector gesture={pan}>
        <View style={styles.dial}>
          <Svg
            width={DIAL_SIZE}
            height={DIAL_SIZE}
            viewBox={`${-CENTER} ${-CENTER} ${DIAL_SIZE} ${DIAL_SIZE}`}
          >
            <Defs>
              <RadialGradient id="dialBg" cx="0" cy="0" r={DIAL_RADIUS}>
                <Stop offset="0" stopColor={palette.surface} />
                <Stop offset="1" stopColor={palette.surfaceSoft} />
              </RadialGradient>
              <RadialGradient id="sunGrad" cx="0" cy="0" r={KNOB_SIZE / 2}>
                <Stop offset="0" stopColor={palette.sunGlow} />
                <Stop offset="0.6" stopColor={palette.sun} />
                <Stop offset="1" stopColor={palette.accent} />
              </RadialGradient>
            </Defs>

            <Circle r={DIAL_RADIUS} fill="url(#dialBg)" stroke={palette.border} strokeWidth={1} />

            {ticks}

            {/* Hour labels (visible mostly in hour mode) */}
            <G opacity={mode === 'hour' ? 0.65 : 0.3}>
              {[12, 3, 6, 9].map((h) => {
                const ang = ((h % 12) / 12) * 360;
                const ar = (ang * Math.PI) / 180;
                return (
                  <SvgText
                    key={h}
                    x={Math.sin(ar) * LABEL_RADIUS}
                    y={-Math.cos(ar) * LABEL_RADIUS}
                    fill={palette.sub}
                    fontSize={14}
                    fontFamily={FONTS.bodyMedium}
                    textAnchor="middle"
                    alignmentBaseline="central"
                  >
                    {h}
                  </SvgText>
                );
              })}
            </G>

            {/* Minute labels (visible mostly in minute mode) */}
            <G opacity={mode === 'minute' ? 0.65 : 0}>
              {[0, 15, 30, 45].map((m) => {
                const ang = (m / 60) * 360;
                const ar = (ang * Math.PI) / 180;
                return (
                  <SvgText
                    key={m}
                    x={Math.sin(ar) * LABEL_RADIUS}
                    y={-Math.cos(ar) * LABEL_RADIUS}
                    fill={palette.sub}
                    fontSize={13}
                    fontFamily={FONTS.monoMedium}
                    textAnchor="middle"
                    alignmentBaseline="central"
                  >
                    :{String(m).padStart(2, '0')}
                  </SvgText>
                );
              })}
            </G>

            {/* Arc trail */}
            <Path
              d={arcD}
              fill="none"
              stroke={palette.accent}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.85}
            />

            {/* Center pin */}
            <Circle r={4} fill={palette.sub} opacity={0.4} />
          </Svg>

          {/* Sun knob */}
          <View
            pointerEvents="none"
            style={[
              styles.knob,
              {
                left: knobLeft,
                top: knobTop,
                shadowColor: palette.sun,
              },
            ]}
          >
            <Svg width={KNOB_SIZE} height={KNOB_SIZE}>
              <Defs>
                <RadialGradient
                  id="knobGrad"
                  cx={KNOB_SIZE / 2}
                  cy={KNOB_SIZE / 2}
                  r={KNOB_SIZE / 2}
                  gradientUnits="userSpaceOnUse"
                >
                  <Stop offset="0" stopColor={palette.sunGlow} />
                  <Stop offset="0.6" stopColor={palette.sun} />
                  <Stop offset="1" stopColor={palette.accent} />
                </RadialGradient>
              </Defs>
              <Circle cx={KNOB_SIZE / 2} cy={KNOB_SIZE / 2} r={KNOB_SIZE / 2} fill="url(#knobGrad)" />
              <Path
                d="M14 31 Q20 22 28 31 Q36 22 42 31"
                stroke="#fff"
                strokeWidth={2.2}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </View>

          {/* Center hint */}
          <View pointerEvents="none" style={styles.centerHint}>
            <Text style={[styles.hintText, { color: palette.sub }]}>guide the lark</Text>
            <Text style={[styles.hintText, { color: palette.sub, marginTop: 2 }]}>
              ·  {mode}  ·
            </Text>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 8 },
  readout: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 4 },
  numBtn: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  numText: {
    fontFamily: FONTS.serifMedium,
    fontSize: 76,
    lineHeight: 82,
    letterSpacing: -1.5,
  },
  colon: { fontFamily: FONTS.serif, fontSize: 64, lineHeight: 70 },
  ampmStack: { marginLeft: 8, gap: 4 },
  ampmBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ampmText: { fontFamily: FONTS.bodySemibold, fontSize: 12, letterSpacing: 0.5 },
  dial: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    marginTop: 8,
    position: 'relative',
  },
  knob: {
    position: 'absolute',
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
  },
  centerHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: CENTER - 18,
    alignItems: 'center',
    opacity: 0.55,
  },
  hintText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
