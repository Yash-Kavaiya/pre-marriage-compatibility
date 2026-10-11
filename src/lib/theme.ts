export const palettes = [
  { id: 'plum', name: 'Plum & Gold', mood: 'Classic and timeless', swatch: ['hsl(290 32% 24%)', 'hsl(38 48% 50%)'] },
  { id: 'ocean', name: 'Ocean & Coral', mood: 'Calm and fresh', swatch: ['hsl(194 58% 24%)', 'hsl(14 70% 56%)'] },
  { id: 'terracotta', name: 'Terracotta & Saffron', mood: 'Warm and earthy', swatch: ['hsl(14 50% 34%)', 'hsl(40 78% 47%)'] },
  { id: 'forest', name: 'Forest & Amber', mood: 'Grounded and natural', swatch: ['hsl(160 40% 22%)', 'hsl(32 72% 50%)'] },
  { id: 'indigo', name: 'Indigo & Rose', mood: 'Modern and gentle', swatch: ['hsl(232 44% 30%)', 'hsl(345 62% 56%)'] },
] as const;

export type PaletteId = (typeof palettes)[number]['id'];
export type Mode = 'light' | 'dark' | 'system';
export interface ThemePrefs {
  palette: PaletteId;
  mode: Mode;
}

const KEY = 'pmc.theme.v1';
const defaults: ThemePrefs = { palette: 'plum', mode: 'system' };
const darkQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

const load = (): ThemePrefs => {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<ThemePrefs> | null;
    return {
      palette: palettes.some((p) => p.id === stored?.palette) ? (stored!.palette as PaletteId) : defaults.palette,
      mode: stored?.mode === 'light' || stored?.mode === 'dark' || stored?.mode === 'system' ? stored.mode : defaults.mode,
    };
  } catch {
    return defaults;
  }
};

let prefs = typeof window !== 'undefined' ? load() : defaults;
const listeners = new Set<() => void>();

export const isDark = (p: ThemePrefs = prefs) => p.mode === 'dark' || (p.mode === 'system' && !!darkQuery?.matches);

const apply = () => {
  const root = document.documentElement;
  root.dataset.theme = prefs.palette;
  root.classList.toggle('dark', isDark());
  const background = getComputedStyle(root).getPropertyValue('--background').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', `hsl(${background})`);
};

export const getThemePrefs = () => prefs;

export const setThemePrefs = (next: Partial<ThemePrefs>) => {
  prefs = { ...prefs, ...next };
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable: the choice still applies for this visit */
  }
  apply();
  listeners.forEach((l) => l());
};

export const subscribeTheme = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const initTheme = () => {
  apply();
  darkQuery?.addEventListener('change', () => {
    if (prefs.mode !== 'system') return;
    prefs = { ...prefs };
    apply();
    listeners.forEach((l) => l());
  });
};
