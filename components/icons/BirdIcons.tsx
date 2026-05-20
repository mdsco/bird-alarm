import React from 'react';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function SongbirdIcon({ color = '#000', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 16c0-3 2-6 6-6 2 0 3 .5 4 1.5l4-2.5-1 4 2 1-3 1c-.5 2.5-3 4.5-6 4.5-3 0-6-1-6-3.5z"
        fill={color}
      />
      <Circle cx="16.5" cy="10.5" r="0.7" fill="#fff" />
      <Path d="M11 19l-1 3M13 19l0 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

export function FeatherIcon({ color = '#000', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 5c-7 0-12 5-13 11l2 2 6-1c4-1 7-5 7-9V5z" fill={color} />
      <Path d="M19 5L6 18" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity={0.7} />
    </Svg>
  );
}

export function OwlIcon({ color = '#000', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Ellipse cx="12" cy="13" rx="7" ry="8" fill={color} />
      <Circle cx="9" cy="11" r="2.4" fill="#fff" />
      <Circle cx="15" cy="11" r="2.4" fill="#fff" />
      <Circle cx="9" cy="11" r="1" fill="#1a1a1a" />
      <Circle cx="15" cy="11" r="1" fill="#1a1a1a" />
      <Path d="M12 13l-1 1.5h2L12 13z" fill="#1a1a1a" />
      <Path d="M6 6l3 3M18 6l-3 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function DoveIcon({ color = '#000', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 14c2 1 5 1 7-1 1 1.5 3 2 5 2 4 0 7-3 8-7-2 1-4 1-6 0 0-2-2-3-4-3-3 0-5 2-5 5-2 0-4 1-5 4z"
        fill={color}
      />
      <Circle cx="19" cy="7" r="0.7" fill="#fff" />
    </Svg>
  );
}

export type BirdIconName = 'songbird' | 'feather' | 'owl' | 'dove';

export function BirdIcon({ name, color, size }: IconProps & { name: BirdIconName }) {
  switch (name) {
    case 'songbird':
      return <SongbirdIcon color={color} size={size} />;
    case 'feather':
      return <FeatherIcon color={color} size={size} />;
    case 'owl':
      return <OwlIcon color={color} size={size} />;
    case 'dove':
      return <DoveIcon color={color} size={size} />;
  }
}

export function FlyingBirdMark({
  color = '#000',
  small = false,
}: {
  color?: string;
  small?: boolean;
}) {
  const w = small ? 22 : 32;
  const h = small ? 8 : 12;
  return (
    <Svg width={w} height={h} viewBox="0 0 32 12" fill="none">
      <Path
        d="M2 9 Q8 1 16 9 Q24 1 30 9"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function FeatherMark({ color = '#000', size = 12 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 5c-7 0-12 5-13 11l2 2 6-1c4-1 7-5 7-9V5z" fill={color} />
    </Svg>
  );
}

export function PlusIcon({ color = '#fff', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M11 3v16M3 11h16"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BirdGlyph({
  color = '#fff',
  width = 28,
  height = 14,
}: {
  color?: string;
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 14" fill="none">
      <Path
        d="M2 11 Q9 2 16 11 Q23 2 30 11"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
