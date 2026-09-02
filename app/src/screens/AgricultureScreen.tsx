import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

// Module Agriculture (Michel) — tâches n°9, 10, 11 :
// capture photo, diagnostic TFLite hors ligne, résultat + sauvegarde.
export default function AgricultureScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agriculture</Text>
      <Text style={styles.subtitle}>Écran à construire — tâches n°9 à 11</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
  },
});
