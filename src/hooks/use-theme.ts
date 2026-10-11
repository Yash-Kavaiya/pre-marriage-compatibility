import { useSyncExternalStore } from 'react';
import { getThemePrefs, isDark, setThemePrefs, subscribeTheme } from '@/lib/theme';

export const useTheme = () => {
  const prefs = useSyncExternalStore(subscribeTheme, getThemePrefs);
  return { ...prefs, dark: isDark(prefs), setTheme: setThemePrefs };
};
