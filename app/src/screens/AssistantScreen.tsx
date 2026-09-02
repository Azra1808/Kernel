import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

// Assistant Kernel (Azra) — tâches n°17, 18 :
// moteur d'intentions hors ligne, puis intégration API Claude en ligne.
export default function AssistantScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assistant Kernel</Text>
      <Text style={styles.subtitle}>Écran à construire — tâches n°17 à 18</Text>
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
