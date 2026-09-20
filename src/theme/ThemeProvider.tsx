import React, { createContext, useContext, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppTheme, eveningTheme, morningTheme } from './theme';

type ThemeContextValue = {
  themeName: 'morning' | 'evening';
  theme: AppTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themePreference = useAppStore((state) => state.theme);
  const effectivePeriod = useAppStore((state) => state.effectivePeriod());

  const value = useMemo<ThemeContextValue>(() => {
    const themeName =
      themePreference === 'auto'
        ? effectivePeriod === 'am'
          ? 'morning'
          : 'evening'
        : themePreference === 'light'
          ? 'morning'
          : 'evening';

    return {
      themeName,
      theme: themeName === 'morning' ? morningTheme : eveningTheme,
    };
  }, [themePreference, effectivePeriod]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
