import { useMemo } from 'react';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Palette } from '../theme/palettes';
import { usePreferences } from '../theme/PreferencesContext';
import { fonts, fontSize } from '../theme/typography';
import { Icon } from '../theme/Icon';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { StatusBadge } from '../components/StatusBadge';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { useProfile } from '../lib/profile';
import type { RootStackParamList, RootTabParamList } from '../navigation/RootNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Accueil'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Écran Accueil — tâche n°8 (Krys), re-habillé avec le design system A
// (Card/Chip/StatusBadge, tâche n°5) suite à la réconciliation main/dev.
// Icône Paramètres ajoutée (tâche n°19) : accès à ParametresScreen, qui
// n'est PAS un onglet, fidèle à la maquette.
//
// La salutation et le quartier sont désormais RÉELS (useProfile, lié à
// Supabase avec cache local offline-first) — plus de "Bonjour, Awa" figé.
// Repli générique si aucun nom n'est encore renseigné (session anonyme).
export default function AccueilScreen({ navigation }: Props) {
  const { colors, fontScale, language } = usePreferences();
  const styles = useMemo(() => createStyles(colors, fontScale), [colors, fontScale]);
  const { profile } = useProfile();
  const t = (fr: string, en: string) => (language === 'fr' ? fr : en);

  const greeting = profile?.fullName ? `${t('Bonjour', 'Hello')}, ${profile.fullName}` : t('Bonjour !', 'Hello!');
  const villageLabel = profile?.village ?? t("Quartier non renseigné", 'Neighborhood not set');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <StatusBadge state="offline" />
        <AnimatedPressable
          accessibilityLabel={t('Ouvrir les paramètres', 'Open settings')}
          hitSlop={8}
          onPress={() => navigation.navigate('Parametres')}
          style={styles.settingsButton}
          pressScale={0.9}
        >
          <Icon name="gear" color={colors.ink} size={20} />
        </AnimatedPressable>
      </View>

      <View style={styles.headerBlock}>
        <View style={styles.brandRow}>
          <Icon name="leaf" color={colors.accent} size={22} />
          <Text style={styles.brand}>Kernel</Text>
        </View>
        <Text style={styles.title}>{greeting}</Text>
        <Text style={styles.subtitle}>{villageLabel}</Text>
      </View>

      <View style={styles.modules}>
        <AnimatedPressable onPress={() => navigation.navigate('Tabs', { screen: 'Agriculture' } as never)} pressScale={0.98}>
          <Card tone="moss" style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="leaf" color={colors.moss} size={20} />
              <Text style={styles.cardTitle}>{t('Agriculture', 'Agriculture')}</Text>
              <Chip label="92%" tone="moss" />
            </View>
            <Text style={styles.cardBody}>{t('3 diagnostics cette semaine', '3 diagnoses this week')}</Text>
          </Card>
        </AnimatedPressable>

        <AnimatedPressable onPress={() => navigation.navigate('Tabs', { screen: 'Ressources' } as never)} pressScale={0.98}>
          <Card tone="gold" style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="crate" color={colors.gold} size={20} />
              <Text style={styles.cardTitle}>{t('Ressources', 'Resources')}</Text>
              <Chip label="6" tone="gold" />
            </View>
            <Text style={styles.cardBody}>{t('2 points à collecter', '2 points to collect')}</Text>
          </Card>
        </AnimatedPressable>

        <AnimatedPressable onPress={() => navigation.navigate('Tabs', { screen: 'Ecosysteme' } as never)} pressScale={0.98}>
          <Card tone="clay" style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="globe" color={colors.clay} size={20} />
              <Text style={styles.cardTitle}>{t('Écosystème', 'Ecosystem')}</Text>
              <Chip label={t('Bon', 'Good')} tone="clay" />
            </View>
            <Text style={styles.cardBody}>{t('Indice de santé local', 'Local health index')}</Text>
          </Card>
        </AnimatedPressable>
      </View>

      <Text style={styles.sectionTitle}>{t('Activité récente', 'Recent activity')}</Text>
      <View accessibilityLabel={t('Activité récente', 'Recent activity')} style={styles.activityList}>
        <ActivityRow
          label={t('Fatou a signalé un point plein', 'Fatou reported a full point')}
          time={t('2h', '2h')}
          styles={styles}
        />
        <ActivityRow
          label={t('Diagnostic manioc enregistré', 'Cassava diagnosis logged')}
          time={t('hier', 'yesterday')}
          styles={styles}
        />
      </View>
    </ScrollView>
  );
}

function ActivityRow({
  label,
  time,
  styles,
}: {
  label: string;
  time: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.activityRow}>
      <Text style={styles.activityLabel}>{label}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

function createStyles(colors: Palette, fontScale: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.paper,
    },
    content: {
      padding: 20,
      gap: 14,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingsButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.paperWarm,
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
      fontSize: fontSize.sm * fontScale,
      color: colors.accent,
    },
    title: {
      fontFamily: fonts.titleBold,
      fontSize: fontSize.xxl * fontScale,
      color: colors.ink,
    },
    subtitle: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm * fontScale,
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
      fontSize: fontSize.md * fontScale,
      color: colors.ink,
      flex: 1,
    },
    cardBody: {
      fontFamily: fonts.body,
      fontSize: fontSize.sm * fontScale,
      color: colors.ink,
      opacity: 0.75,
    },
    sectionTitle: {
      fontFamily: fonts.titleSemiBold,
      fontSize: fontSize.lg * fontScale,
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
      fontSize: fontSize.sm * fontScale,
      color: colors.ink,
      flex: 1,
    },
    activityTime: {
      fontFamily: fonts.body,
      fontSize: fontSize.xs * fontScale,
      color: colors.muted,
    },
  });
        }
