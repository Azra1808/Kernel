import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '../components/AppScreen';
import { ScreenHeader } from '../components/ScreenHeader';
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
    <AppScreen contentContainerStyle={styles.content} testID="ecosystem-screen">
      <ScreenHeader subtitle="Cette semaine · votre quartier" title="Santé environnementale" />

      {result.notice ? (
        <View style={styles.notice}>
          <Feather color={colors.warning} name="info" size={15} />
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
    </AppScreen>
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
          {dashboard.healthScore === null ? 'Confidentialité préservée' : `Indice de santé local · ${dashboard.healthScore}/100`}
        </Text>
      </View>
      <View style={styles.globe}>
        <Feather color={colors.paper} name="globe" size={27} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  notice: {
    alignItems: 'center',
    backgroundColor: colors.goldPale,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
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
    marginTop: spacing.lg,
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
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
