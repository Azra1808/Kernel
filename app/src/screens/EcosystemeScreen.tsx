import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSize } from '../theme/typography';

// Module Écosystème (Krys) — tâches n°15, 16 :
// requêtes d'agrégation (déjà en place côté Supabase) + dashboard
// (indice de santé, graphique de tendance, répartition par type de signal).
export default function EcosystemeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Écosystème</Text>
      <Text style={styles.subtitle}>Écran à construire — tâches n°15 à 16</Text>
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
    fontFamily: fonts.titleBold,
    fontSize: fontSize.xl,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
});
