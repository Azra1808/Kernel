import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts, fontSize } from '../theme/typography';
import { Icon } from '../theme/Icon';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { StatusBadge } from '../components/StatusBadge';
import type { RootTabParamList } from '../navigation/RootNavigator';

type Props = BottomTabScreenProps<RootTabParamList, 'Accueil'>;

// Écran Accueil — tâche n°8 (Krys), re-habillé avec le design system A
// (Card/Chip/StatusBadge, tâche n°5) suite à la réconciliation main/dev.
// Comportement et contenu identiques à la version d'origine (navigation
// au tap sur chaque module, stats, fil d'activité) — seul l'habillage
// visuel change.
//
// NOTE — "Bonjour, Awa" / quartier / stats sont pour l'instant des
// valeurs fixes : à relier aux vraies données (auth + Supabase) une fois
// ces modules prêts.
export default function AccueilScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBadge state="offline" />

      <View style={styles.headerBlock}>
        <View style={styles.brandRow}>
          <Icon name="leaf" color={colors.clay} size={22} />
          <Text style={styles.brand}>Kernel</Text>
        </View>
        <Text style={styles.title}>Bonjour, Awa</Text>
        <Text style={styles.subtitle}>Sabalibougou · aujourd'hui</Text>
      </View>

      <View style={styles.modules}>
        <Pressable onPress={() => navigation.navigate('Agriculture')}>
          <Card tone="moss" style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="leaf" color={colors.moss} size={20} />
              <Text style={styles.cardTitle}>Agriculture</Text>
              <Chip label="92%" tone="moss" />
            </View>
            <Text style={styles.cardBody}>3 diagnostics cette semaine</Text>
          </Card>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Ressources')}>
          <Card tone="gold" style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="crate" color={colors.gold} size={20} />
              <Text style={styles.cardTitle}>Ressources</Text>
              <Chip label="6" tone="gold" />
            </View>
            <Text style={styles.cardBody}>2 points à collecter</Text>
          </Card>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Ecosysteme')}>
          <Card tone="clay" style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="globe" color={colors.clay} size={20} />
              <Text style={styles.cardTitle}>Écosystème</Text>
              <Chip label="Bon" tone="clay" />
            </View>
            <Text style={styles.cardBody}>Indice de santé local</Text>
          </Card>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Activité récente</Text>
      <View accessibilityLabel="Activité récente" style={styles.activityList}>
        <ActivityRow label="Fatou a signalé un point plein" time="2h" />
        <ActivityRow label="Diagnostic manioc enregistré" time="hier" />
      </View>
    </ScrollView>
  );
}

function ActivityRow({ label, time }: { label: string; time: string }) {
  return (
    <View style={styles.activityRow}>
      <Text style={styles.activityLabel}>{label}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
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
  modules: {
    gap: 12,
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
  sectionTitle: {
    fontFamily: fonts.titleSemiBold,
    fontSize: fontSize.lg,
    color: colors.ink,
    marginTop: 8,
  },
  activityList: {
    gap: 2,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  activityLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.ink,
    flex: 1,
  },
  activityTime: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.muted,
  },
});