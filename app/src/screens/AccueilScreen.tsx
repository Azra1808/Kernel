import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSize } from '../theme/typography';
import { Icon } from '../theme/Icon';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { StatusBadge } from '../components/StatusBadge';

// Tâche n°8 : reproduire fidèlement l'écran Accueil de la maquette
// (3 cartes modules, bandeau hors-ligne, fil d'activité récente).
// Ce qui suit est un aperçu du design system (tâche n°5), pas encore
// l'écran final — sert à vérifier que les composants tiennent ensemble
// avant que Krys ne construise le vrai écran.
export default function AccueilScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBadge state="offline" />

      <View style={styles.headerBlock}>
        <View style={styles.brandRow}>
          <Icon name="leaf" color={colors.clay} size={22} />
          <Text style={styles.brand}>Kernel</Text>
        </View>
        <Text style={styles.title}>Bonjour 👋</Text>
        <Text style={styles.subtitle}>Design system — tâche n°5 (aperçu)</Text>
      </View>

      <Card tone="moss" style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="leaf" color={colors.moss} size={20} />
          <Text style={styles.cardTitle}>Agriculture</Text>
          <Chip label="Sain" tone="moss" />
        </View>
        <Text style={styles.cardBody}>Diagnostiquer une plante en une photo.</Text>
      </Card>

      <Card tone="clay" style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="crate" color={colors.clay} size={20} />
          <Text style={styles.cardTitle}>Ressources</Text>
          <Chip label="2 points pleins" tone="clay" />
        </View>
        <Text style={styles.cardBody}>Signaler un point de collecte.</Text>
      </Card>

      <Card tone="gold" style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="globe" color={colors.gold} size={20} />
          <Text style={styles.cardTitle}>Écosystème</Text>
          <Chip label="Indice: 72" tone="gold" />
        </View>
        <Text style={styles.cardBody}>Voir la santé environnementale du quartier.</Text>
      </Card>

      <Button label="Ouvrir l'assistant Kernel" onPress={() => {}} variant="primary" />
      <Button label="Voir les paramètres" onPress={() => {}} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  headerBlock: {
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brand: {
    fontFamily: fonts.titleSemiBold,
    fontSize: fontSize.sm,
    color: colors.clay,
  },
  title: {
    fontFamily: fonts.titleBold,
    fontSize: fontSize.xxl,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  card: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.ink,
    flex: 1,
  },
  cardBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.ink,
    opacity: 0.75,
  },
});
