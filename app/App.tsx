import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts as useFrauncesFonts,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  useFonts as useSpaceGroteskFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

import RootNavigator from './src/navigation/RootNavigator';
import { PreferencesProvider, usePreferences } from './src/theme/PreferencesContext';
import { initDatabase } from './src/db/database';
import { registerAllSyncableTables } from './src/sync/registerTables';
import { useAutoSync } from './src/sync/useAutoSync';

// Garde le splash screen natif affiché tant que les polices ne sont pas
// chargées, pour éviter un flash de texte avec la police système.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [frauncesLoaded] = useFrauncesFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });
  const [spaceGroteskLoaded] = useSpaceGroteskFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });
  const fontsLoaded = frauncesLoaded && spaceGroteskLoaded;

  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    registerAllSyncableTables();
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error("[db] échec d'initialisation SQLite:", err);
      });
  }, []);

  useAutoSync();

  const appReady = fontsLoaded && dbReady;

  if (!appReady) {
    return null;
  }

  // PreferencesProvider (tâche n°19) doit envelopper tout ce qui affiche
  // des couleurs dynamiques — d'où le découpage en AppShell ci-dessous,
  // qui peut alors appeler usePreferences().
  return (
    <PreferencesProvider>
      <AppShell />
    </PreferencesProvider>
  );
}

function AppShell() {
  const { colors, ready } = usePreferences();

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.paper }} onLayout={onLayoutRootView}>
        <RootNavigator />
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}
