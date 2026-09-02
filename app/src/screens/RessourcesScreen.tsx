import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

// Module Ressources (Florent) — tâches n°12, 13, 14 :
// liste des points de collecte, formulaire de signalement, priorisation.
export default function RessourcesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ressources</Text>
      <Text style={styles.subtitle}>Écran à construire — tâches n°12 à 14</Text>
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
