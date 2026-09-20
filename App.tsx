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
import { hasSeenOnboarding } from './src/lib/onboarding';

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
  // null = pas encore déterminé. Vérification 100% locale (AsyncStorage),
  // donc rapide et sans dépendance réseau — cohérent avec l'offline-first.
  const [initialRoute, setInitialRoute] = useState<'Tabs' | 'Auth' | null>(null);

  useEffect(() => {
    registerAllSyncableTables();
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error("[db] échec d'initialisation SQLite:", err);
      });

    hasSeenOnboarding().then((seen) => setInitialRoute(seen ? 'Tabs' : 'Auth'));
  }, []);

  useAutoSync();

  const appReady = fontsLoaded && dbReady && initialRoute !== null;

  if (!appReady) {
    return null;
  }

  // PreferencesProvider (tâche n°19) doit envelopper tout ce qui affiche
  // des couleurs dynamiques — d'où le découpage en AppShell ci-dessous,
  // qui peut alors appeler usePreferences().
  return (
    <PreferencesProvider>
      <AppShell initialRoute={initialRoute} />
    </PreferencesProvider>
  );
}

function AppShell({ initialRoute }: { initialRoute: 'Tabs' | 'Auth' }) {
  const { colors, ready } = usePreferences();

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync();
    }
  }, [ready]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.paper }} onLayout={onLayoutRootView}>
        <RootNavigator initialRouteName={initialRoute} />
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}
