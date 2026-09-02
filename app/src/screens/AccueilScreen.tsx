import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

// Tâche n°8 : reproduire fidèlement l'écran Accueil de la maquette
// (3 cartes modules, bandeau hors-ligne, fil d'activité récente).
export default function AccueilScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accueil</Text>
      <Text style={styles.subtitle}>Écran à construire — tâche n°8</Text>
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
