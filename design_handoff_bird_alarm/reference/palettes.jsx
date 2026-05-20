// Nature-inspired bright palettes for the alarm app.
// Each palette has: bg, surface, text, sub, accent (primary action), warm, leaf, sky.

const PALETTES = {
  sunrise: {
    name: 'Goldfinch',
    bg: '#FFF1E2',
    bgGradient: 'radial-gradient(120% 80% at 50% 0%, #FFD9B8 0%, #FFE8D1 35%, #FFF1E2 70%)',
    surface: '#FFFFFF',
    surfaceSoft: '#FFF8EE',
    text: '#2A1A0E',
    sub: '#7A5C45',
    border: 'rgba(42,26,14,0.08)',
    accent: '#FF7A3D',       // apricot
    accentSoft: '#FFD5BD',
    warm: '#FFB36B',         // peach
    pink: '#FF9C8A',         // coral
    leaf: '#7FA86E',         // sage
    sky: '#9EC8DD',          // sky blue
    sun: '#FFB347',
    sunGlow: '#FFD27A',
  },
  meadow: {
    name: 'Warbler',
    bg: '#EEF5E4',
    bgGradient: 'radial-gradient(120% 80% at 50% 0%, #D7E9C1 0%, #E5F0D4 40%, #EEF5E4 75%)',
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
  ocean: {
    name: 'Kingfisher',
    bg: '#E5F1F2',
    bgGradient: 'radial-gradient(120% 80% at 50% 0%, #BCDEE0 0%, #D6E9EB 40%, #E5F1F2 75%)',
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
  hibiscus: {
    name: 'Cardinal',
    bg: '#FFE9EE',
    bgGradient: 'radial-gradient(120% 80% at 50% 0%, #FFC8D6 0%, #FFD8E1 40%, #FFE9EE 75%)',
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

window.PALETTES = PALETTES;
