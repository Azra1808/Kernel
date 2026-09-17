import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../theme/Icon';
import { demoDashboard, type EcosystemDashboard } from '../features/ecosystem/domain';
import { SignalBreakdown } from '../features/ecosystem/SignalBreakdown';
import { loadEcosystemDashboard, type DashboardResult } from '../features/ecosystem/service';
import { TrendChart } from '../features/ecosystem/TrendChart';
import { fontFamily, spacing } from '../theme/colors';
import { radius, type Palette } from '../theme/palettes';
import { usePreferences } from '../theme/PreferencesContext';

export default function EcosystemeScreen() {
  const { colors } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [result, setResult] = useState<DashboardResult>({ dashboard: demoDashboard, mode: 'demo' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadEcosystemDashboard()
      .then((nextResult) => {
        if (active) setResult(nextResult);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const { dashboard } = result;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Santé environnementale</Text>
        <Text style={styles.subtitle}>Cette semaine · votre quartier</Text>
      </View>

      {result.notice ? (
        <View style={styles.notice}>
          <View style={styles.noticeDot} />
          <Text style={styles.noticeText}>{result.notice}</Text>
        </View>
      ) : null}

      <HealthCard dashboard={dashboard} loading={loading} styles={styles} colors={colors} />
      <TrendChart total={dashboard.totalSignals} values={dashboard.dailyTrend} />
      <SignalBreakdown
        healthyDays={dashboard.healthyDays}
        plantDiseases={dashboard.plantDiseases}
        wastePoints={dashboard.wastePoints}
      />
      <Text style={styles.privacy}>
        {`Données agrégées uniquement. L’indice n’est affiché qu’à partir de ${dashboard.privacyThreshold} signaux.`}
      </Text>
    </ScrollView>
  );
}

function HealthCard({
  dashboard,
  loading,
  styles,
  colors,
}: {
  dashboard: EcosystemDashboard;
  loading: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: Palette;
}) {
  return (
    <View style={styles.healthCard}>
      <View>
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.healthLabel}>{dashboard.healthLabel}</Text>
        )}
        <Text style={styles.healthCaption}>
          {dashboard.healthScore === null
            ? 'Confidentialité préservée'
            : `Indice de santé local · ${dashboard.healthScore}/100`}
        </Text>
      </View>
      <View style={styles.globe}>
        <Icon name="globe" color={colors.white} size={27} />
      </View>
    </View>
  );
}

function createStyles(colors: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.paper,
    },
    content: {
      padding: 20,
      gap: spacing.md,
    },
    headerBlock: {
      gap: 4,
    },
    title: {
      fontFamily: fontFamily.displayBold,
      fontSize: 24,
      color: colors.ink,
    },
    subtitle: {
      fontFamily: fontFamily.body,
      fontSize: 13,
      color: colors.muted,
    },
    notice: {
      alignItems: 'center',
      backgroundColor: colors.goldPale,
      borderRadius: radius.sm,
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.md,
    },
    noticeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.warning,
    },
    noticeText: {
      color: colors.warning,
      flex: 1,
      fontFamily: fontFamily.bodyMedium,
      fontSize: 11,
      lineHeight: 16,
    },
    healthCard: {
      alignItems: 'center',
      // Vert fixe (santé environnementale) — ne suit pas le thème d'accent.
      backgroundColor: colors.moss,
      borderRadius: radius.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 98,
      padding: spacing.lg,
    },
    healthLabel: {
      color: colors.white,
      fontFamily: fontFamily.displayBold,
      fontSize: 29,
    },
    healthCaption: {
      color: colors.mossPale,
      fontFamily: fontFamily.body,
      fontSize: 11,
      marginTop: spacing.xs,
    },
    globe: {
      alignItems: 'center',
      borderColor: 'rgba(255,255,255,0.28)',
      borderRadius: 25,
      borderWidth: 1,
      height: 50,
      justifyContent: 'center',
      width: 50,
    },
    privacy: {
      color: colors.muted,
      fontFamily: fontFamily.body,
      fontSize: 10,
      lineHeight: 15,
      textAlign: 'center',
    },
  });
}
