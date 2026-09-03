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
import { colors } from './src/theme/colors';
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
        // En cas d'échec d'ouverture de la base locale, l'app ne peut pas
        // fonctionner en mode offline-first : on log pour l'instant, un
        // écran d'erreur dédié pourra être ajouté plus tard.
        console.error("[db] échec d'initialisation SQLite:", err);
      });
  }, []);

  // Déclenche la synchro à la reconnexion réseau + toutes les 30s.
  useAutoSync();

  const appReady = fontsLoaded && dbReady;

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.paper }} onLayout={onLayoutRootView}>
        <RootNavigator />
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}
