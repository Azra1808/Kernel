import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../theme/Icon';
import { demoDashboard, type EcosystemDashboard } from '../features/ecosystem/domain';
import { SignalBreakdown } from '../features/ecosystem/SignalBreakdown';
import { loadEcosystemDashboard, type DashboardResult } from '../features/ecosystem/service';
import { TrendChart } from '../features/ecosystem/TrendChart';
import { colors, fontFamily, radius, spacing } from '../theme/colors';

export default function EcosystemeScreen() {
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

      <HealthCard dashboard={dashboard} loading={loading} />
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

function HealthCard({ dashboard, loading }: { dashboard: EcosystemDashboard; loading: boolean }) {
  return (
    <View style={styles.healthCard}>
      <View>
        {loading ? (
          <ActivityIndicator color={colors.paper} size="small" />
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
        <Icon name="globe" color={colors.paper} size={27} />
      </View>
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
    backgroundColor: colors.moss,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 98,
    padding: spacing.lg,
  },
  healthLabel: {
    color: colors.paper,
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