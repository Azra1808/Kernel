import { normalizeDashboardRow } from '../service';

jest.mock('../../../lib/supabase', () => ({ supabase: null }));

describe('normalizeDashboardRow', () => {
  it('normalise les compteurs PostgreSQL et la tendance JSON', () => {
    expect(
      normalizeDashboardRow({
        health_score: 78,
        health_label: 'Bon',
        total_signals: '14',
        plant_diseases: '6',
        waste_points: 5,
        healthy_days: '3',
        daily_trend: [{ count: 1 }, { count: '2' }, { count: 0 }],
        privacy_threshold: 3,
      })
    ).toEqual({
      healthScore: 78,
      healthLabel: 'Bon',
      totalSignals: 14,
      plantDiseases: 6,
      wastePoints: 5,
      healthyDays: 3,
      dailyTrend: [1, 2, 0],
      privacyThreshold: 3,
    });
  });

  it('masque un score renvoyé par erreur sous le seuil de confidentialité', () => {
    const dashboard = normalizeDashboardRow({
      health_score: 100,
      health_label: 'Bon',
      total_signals: 2,
      plant_diseases: 1,
      waste_points: 1,
      healthy_days: 7,
      daily_trend: [],
      privacy_threshold: 3,
    });

    expect(dashboard.healthScore).toBeNull();
    expect(dashboard.healthLabel).toBe('Données insuffisantes');
  });
});
