export type PaletteKey = 'goldfinch' | 'warbler' | 'kingfisher' | 'cardinal';

export type Palette = {
  key: PaletteKey;
  name: string;
  bg: string;
  bgGradient: [string, string, string];
  surface: string;
  surfaceSoft: string;
  text: string;
  sub: string;
  border: string;
  accent: string;
  accentSoft: string;
  warm: string;
  pink: string;
  leaf: string;
  sky: string;
  sun: string;
  sunGlow: string;
};

export const PALETTES: Record<PaletteKey, Palette> = {
  goldfinch: {
    key: 'goldfinch',
    name: 'Goldfinch',
    bg: '#FFF1E2',
    bgGradient: ['#FFD9B8', '#FFE8D1', '#FFF1E2'],
    surface: '#FFFFFF',
    surfaceSoft: '#FFF8EE',
    text: '#2A1A0E',
    sub: '#7A5C45',
    border: 'rgba(42,26,14,0.08)',
    accent: '#FF7A3D',
    accentSoft: '#FFD5BD',
    warm: '#FFB36B',
    pink: '#FF9C8A',
    leaf: '#7FA86E',
    sky: '#9EC8DD',
    sun: '#FFB347',
    sunGlow: '#FFD27A',
  },
  warbler: {
    key: 'warbler',
    name: 'Warbler',
    bg: '#EEF5E4',
    bgGradient: ['#D7E9C1', '#E5F0D4', '#EEF5E4'],
    surface: '#FFFFFF',
    surfaceSoft: '#F6FAEC',
    text: '#1F2A1A',
    sub: '#56664A',
    border: 'rgba(31,42,26,0.08)',
    accent: '#5BA84E',
    accentSoft: '#CBE3BF',
    warm: '#F2C14E',
    pink: '#E89BBA',
    leaf: '#3B8C56',
    sky: '#A8D0C2',
    sun: '#F2C14E',
    sunGlow: '#FFE48A',
  },
  kingfisher: {
    key: 'kingfisher',
    name: 'Kingfisher',
    bg: '#E5F1F2',
    bgGradient: ['#BCDEE0', '#D6E9EB', '#E5F1F2'],
    surface: '#FFFFFF',
    surfaceSoft: '#F0F8F9',
    text: '#0E2A2D',
    sub: '#4D6F73',
    border: 'rgba(14,42,45,0.08)',
    accent: '#1E8EA1',
    accentSoft: '#B6DDE3',
    warm: '#FFB36B',
    pink: '#F08A8A',
    leaf: '#5DA38C',
    sky: '#83C0CC',
    sun: '#FFC857',
    sunGlow: '#FFE9A8',
  },
  cardinal: {
    key: 'cardinal',
    name: 'Cardinal',
    bg: '#FFE9EE',
    bgGradient: ['#FFC8D6', '#FFD8E1', '#FFE9EE'],
    surface: '#FFFFFF',
    surfaceSoft: '#FFF3F6',
    text: '#2E0F1B',
    sub: '#7C4E60',
    border: 'rgba(46,15,27,0.08)',
    accent: '#E04E7A',
    accentSoft: '#FFC1D2',
    warm: '#FFB36B',
    pink: '#FF8AA3',
    leaf: '#7CA572',
    sky: '#B7CCE3',
    sun: '#FFB347',
    sunGlow: '#FFD58A',
  },
};

export const PALETTE_KEYS: PaletteKey[] = ['goldfinch', 'warbler', 'kingfisher', 'cardinal'];

export const DEFAULT_PALETTE: PaletteKey = 'goldfinch';
