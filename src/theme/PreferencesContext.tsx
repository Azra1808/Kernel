import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildPalette, ColorThemeId, Mode, Palette } from './palettes';
import type { Lang } from '../lib/assistant/types';

export type TextSize = 'petit' | 'normal' | 'grand';

const STORAGE_KEY = 'kernel:preferences:v1';

// Multiplicateur appliqué à toutes les tailles de police de l'app.
const TEXT_SCALE: Record<TextSize, number> = {
  petit: 0.9,
  normal: 1,
  grand: 1.15,
};

type Preferences = {
  mode: Mode;
  colorTheme: ColorThemeId;
  language: Lang;
  textSize: TextSize;
};

const DEFAULT_PREFS: Preferences = {
  mode: 'clair',
  colorTheme: 'argile',
  language: 'fr',
  textSize: 'normal',
};

type PreferencesContextValue = Preferences & {
  colors: Palette;
  fontScale: number;
  ready: boolean;
  setMode: (m: Mode) => void;
  setColorTheme: (c: ColorThemeId) => void;
  setLanguage: (l: Lang) => void;
  setTextSize: (t: TextSize) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  // Charge les préférences sauvegardées localement au démarrage.
  // TODO (tâche n°6) : une fois l'authentification en place, synchroniser
  // aussi ces préférences vers user_settings côté Supabase — le local
  // reste la source immédiate (principe offline-first), Supabase suit
  // dès qu'une session existe et qu'une connexion est disponible.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        try {
          const parsed = JSON.parse(raw);
          setPrefs((prev) => ({ ...prev, ...parsed }));
        } catch {
          // Préférences locales corrompues : on garde les valeurs par défaut.
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = (next: Preferences) => {
    setPrefs(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Non bloquant : la préférence reste active en mémoire pour la session.
    });
  };

  const colors = useMemo(() => buildPalette(prefs.mode, prefs.colorTheme), [prefs.mode, prefs.colorTheme]);
  const fontScale = TEXT_SCALE[prefs.textSize];

  const value: PreferencesContextValue = {
    ...prefs,
    colors,
    fontScale,
    ready,
    setMode: (mode) => persist({ ...prefs, mode }),
    setColorTheme: (colorTheme) => persist({ ...prefs, colorTheme }),
    setLanguage: (language) => persist({ ...prefs, language }),
    setTextSize: (textSize) => persist({ ...prefs, textSize }),
  };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences() doit être appelé à l’intérieur de <PreferencesProvider>.');
  }
  return ctx;
}
