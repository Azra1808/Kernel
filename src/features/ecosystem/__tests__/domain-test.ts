import { deriveHealthIndex, PRIVACY_THRESHOLD } from '../domain';

describe('deriveHealthIndex', () => {
  it('masque l’indice sous le seuil de confidentialité', () => {
    expect(deriveHealthIndex(Array(PRIVACY_THRESHOLD - 1).fill('faible'))).toEqual({
      healthScore: null,
      healthLabel: 'Données insuffisantes',
    });
  });

  it.each([
    [['faible', 'faible', 'faible'], 100, 'Bon'],
    [['moyen', 'moyen', 'moyen'], 50, 'Vigilance'],
    [['eleve', 'eleve', 'eleve'], 0, 'Critique'],
    [['faible', 'moyen', 'eleve'], 50, 'Vigilance'],
  ] as const)('calcule %j à %i (%s)', (severities, score, label) => {
    expect(deriveHealthIndex([...severities])).toEqual({ healthScore: score, healthLabel: label });
  });
});
