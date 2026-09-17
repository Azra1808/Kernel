export const PRIVACY_THRESHOLD = 3;

export type SignalSeverity = 'faible' | 'moyen' | 'eleve';
export type HealthLabel = 'Bon' | 'Vigilance' | 'Critique' | 'Données insuffisantes';

export type EcosystemDashboard = {
  healthScore: number | null;
  healthLabel: HealthLabel;
  totalSignals: number;
  plantDiseases: number;
  wastePoints: number;
  healthyDays: number;
  dailyTrend: number[];
  privacyThreshold: number;
};

const severityWeight: Record<SignalSeverity, number> = {
  faible: 1,
  moyen: 2,
  eleve: 3,
};

export function deriveHealthIndex(severities: SignalSeverity[]): Pick<EcosystemDashboard, 'healthScore' | 'healthLabel'> {
  if (severities.length < PRIVACY_THRESHOLD) {
    return { healthScore: null, healthLabel: 'Données insuffisantes' };
  }

  const averageSeverity = severities.reduce((sum, severity) => sum + severityWeight[severity], 0) / severities.length;
  const healthScore = Math.round(Math.max(0, Math.min(100, 100 - ((averageSeverity - 1) / 2) * 100)));

  if (healthScore >= 75) return { healthScore, healthLabel: 'Bon' };
  if (healthScore >= 50) return { healthScore, healthLabel: 'Vigilance' };
  return { healthScore, healthLabel: 'Critique' };
}

export const demoDashboard: EcosystemDashboard = {
  healthScore: 78,
  healthLabel: 'Bon',
  totalSignals: 14,
  plantDiseases: 6,
  wastePoints: 5,
  healthyDays: 3,
  dailyTrend: [3, 5, 4, 7, 6, 8, 5],
  privacyThreshold: PRIVACY_THRESHOLD,
};
