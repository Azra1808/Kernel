import { supabase } from '../../lib/supabase';
import { demoDashboard, PRIVACY_THRESHOLD, type EcosystemDashboard, type HealthLabel } from './domain';

type DashboardRow = {
  health_score: number | null;
  health_label: HealthLabel | null;
  total_signals: number | string | null;
  plant_diseases: number | string | null;
  waste_points: number | string | null;
  healthy_days: number | string | null;
  daily_trend: unknown;
  privacy_threshold: number | null;
};

export type DashboardResult = {
  dashboard: EcosystemDashboard;
  mode: 'live' | 'demo';
  notice?: string;
};

function asCount(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function asTrend(value: unknown): number[] {
  if (!Array.isArray(value)) return Array(7).fill(0);
  return value.slice(-7).map((item) => asCount(typeof item === 'object' && item !== null && 'count' in item ? String(item.count) : String(item)));
}

export function normalizeDashboardRow(row: DashboardRow): EcosystemDashboard {
  const totalSignals = asCount(row.total_signals);
  const privacyThreshold = asCount(row.privacy_threshold) || PRIVACY_THRESHOLD;
  const hasEnoughData = totalSignals >= privacyThreshold;

  return {
    healthScore: hasEnoughData && row.health_score !== null ? asCount(row.health_score) : null,
    healthLabel: hasEnoughData && row.health_label ? row.health_label : 'Données insuffisantes',
    totalSignals,
    plantDiseases: asCount(row.plant_diseases),
    wastePoints: asCount(row.waste_points),
    healthyDays: asCount(row.healthy_days),
    dailyTrend: asTrend(row.daily_trend),
    privacyThreshold,
  };
}

export async function loadEcosystemDashboard(): Promise<DashboardResult> {
  if (!supabase) {
    return {
      dashboard: demoDashboard,
      mode: 'demo',
      notice: 'Aperçu local — configure Supabase pour afficher les données du quartier.',
    };
  }

  const { data, error } = await supabase.rpc('get_ecosystem_dashboard', { p_days: 7 }).maybeSingle();
  if (error || !data) {
    return {
      dashboard: demoDashboard,
      mode: 'demo',
      notice: 'Données locales affichées — la synchronisation du quartier est indisponible.',
    };
  }

  return { dashboard: normalizeDashboardRow(data as DashboardRow), mode: 'live' };
}
