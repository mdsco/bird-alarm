import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PALETTE, PALETTES, Palette, PaletteKey } from './palettes';
import { STORAGE_KEYS } from '../constants/storage-keys';

type ThemeContextValue = {
  palette: Palette;
  paletteKey: PaletteKey;
  setPaletteKey: (key: PaletteKey) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteKey, setPaletteKeyState] = useState<PaletteKey>(DEFAULT_PALETTE);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.PALETTE).then((stored) => {
      if (stored && stored in PALETTES) {
        setPaletteKeyState(stored as PaletteKey);
      }
    });
  }, []);

  const setPaletteKey = useCallback((key: PaletteKey) => {
    setPaletteKeyState(key);
    AsyncStorage.setItem(STORAGE_KEYS.PALETTE, key);
  }, []);

  return (
    <ThemeContext.Provider value={{ palette: PALETTES[paletteKey], paletteKey, setPaletteKey }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

export function usePalette(): Palette {
  return useTheme().palette;
}
