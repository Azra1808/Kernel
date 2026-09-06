import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { type Palette } from '../theme/palettes';
import { usePreferences } from '../theme/PreferencesContext';
import { fonts, fontSize } from '../theme/typography';

// Module Agriculture (Michel) — tâches n°9, 10, 11 :
// capture photo, diagnostic TFLite hors ligne, résultat + sauvegarde.
export default function AgricultureScreen() {
  const { colors, fontScale } = usePreferences();
  const styles = useMemo(() => createStyles(colors, fontScale), [colors, fontScale]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agriculture</Text>
      <Text style={styles.subtitle}>Écran à construire — tâches n°9 à 11</Text>
    </View>
  );
}

function createStyles(colors: Palette, fontScale: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.paper,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    title: {
      fontFamily: fonts.titleBold,
      fontSize: fontSize.xl * fontScale,
      color: colors.ink,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm * fontScale,
      color: colors.muted,
    },
  });
}
