import { useMemo } from 'react';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { type Palette } from '../theme/palettes';
import { usePreferences } from '../theme/PreferencesContext';
import { fonts, fontSize } from '../theme/typography';
import { Icon } from '../theme/Icon';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { StatusBadge } from '../components/StatusBadge';
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
// NOTE — "Bonjour, Awa" / quartier / stats sont pour l'instant des
// valeurs fixes : à relier aux vraies données (auth + Supabase) une fois
// ces modules prêts.
export default function AccueilScreen({ navigation }: Props) {
  const { colors, fontScale } = usePreferences();
  const styles = useMemo(() => createStyles(colors, fontScale), [colors, fontScale]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <StatusBadge state="offline" />
        <Pressable
          accessibilityLabel="Ouvrir les paramètres"
          hitSlop={8}
          onPress={() => navigation.navigate('Parametres')}
          style={styles.settingsButton}
        >
          <Icon name="gear" color={colors.ink} size={20} />
        </Pressable>
      </View>

      <View style={styles.headerBlock}>
        <View style={styles.brandRow}>
          <Icon name="leaf" color={colors.accent} size={22} />
          <Text style={styles.brand}>Kernel</Text>
        </View>
        <Text style={styles.title}>Bonjour, Awa</Text>
        <Text style={styles.subtitle}>Sabalibougou · aujourd’hui</Text>
      </View>

      <View style={styles.modules}>
        <Pressable onPress={() => navigation.navigate('Tabs', { screen: 'Agriculture' } as never)}>
          <Card tone="moss" style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="leaf" color={colors.moss} size={20} />
              <Text style={styles.cardTitle}>Agriculture</Text>
              <Chip label="92%" tone="moss" />
            </View>
            <Text style={styles.cardBody}>3 diagnostics cette semaine</Text>
          </Card>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Tabs', { screen: 'Ressources' } as never)}>
          <Card tone="gold" style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="crate" color={colors.gold} size={20} />
              <Text style={styles.cardTitle}>Ressources</Text>
              <Chip label="6" tone="gold" />
            </View>
            <Text style={styles.cardBody}>2 points à collecter</Text>
          </Card>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Tabs', { screen: 'Ecosysteme' } as never)}>
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
        <ActivityRow label="Fatou a signalé un point plein" time="2h" styles={styles} />
        <ActivityRow label="Diagnostic manioc enregistré" time="hier" styles={styles} />
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
