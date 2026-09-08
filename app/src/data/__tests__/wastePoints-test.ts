import { computePriorityScore } from '../wastePoints';

jest.mock('../../lib/supabase', () => ({ supabase: null }));

describe('computePriorityScore — priorisation des collectes (tâche 14)', () => {
  it('donne toujours la priorité à la gravité, quel que soit le nombre de signalements', () => {
    // Un point signalé "vide" 10 fois récemment ne doit jamais dépasser un
    // point signalé "plein" une seule fois : la gravité prime toujours.
    const videSignalePlusieursFois = computePriorityScore('vide', new Date().toISOString(), 10);
    const pleinSignaleUneFois = computePriorityScore('plein', new Date().toISOString(), 1);

    expect(pleinSignaleUneFois).toBeGreaterThan(videSignalePlusieursFois);
  });

  it('ordonne correctement plein > partiel > vide > jamais signalé, à égalité ailleurs', () => {
    const now = new Date().toISOString();
    const plein = computePriorityScore('plein', now, 0);
    const partiel = computePriorityScore('partiel', now, 0);
    const vide = computePriorityScore('vide', now, 0);
    const jamaisSignale = computePriorityScore(null, null, 0);

    expect(plein).toBeGreaterThan(partiel);
    expect(partiel).toBeGreaterThan(vide);
    expect(vide).toBeGreaterThan(jamaisSignale);
  });

  it('à gravité égale, plus de signalements récents augmente la priorité', () => {
    const now = new Date().toISOString();
    const unSignalement = computePriorityScore('partiel', now, 1);
    const cinqSignalements = computePriorityScore('partiel', now, 5);

    expect(cinqSignalements).toBeGreaterThan(unSignalement);
  });

  it('à gravité et nombre de signalements égaux, un signalement plus récent passe légèrement devant', () => {
    const ilYA1Heure = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    const ilYA40Heures = new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString();

    const recent = computePriorityScore('partiel', ilYA1Heure, 2);
    const ancien = computePriorityScore('partiel', ilYA40Heures, 2);

    expect(recent).toBeGreaterThan(ancien);
    // L'écart de fraîcheur reste un simple bonus (max 48) : il ne doit
    // jamais suffire à dépasser une gravité supérieure.
    const pleinAncien = computePriorityScore('plein', ilYA40Heures, 0);
    expect(pleinAncien).toBeGreaterThan(recent);
  });

  it("le bonus de fraîcheur ne devient jamais négatif pour un signalement ancien (> 48h)", () => {
    const ilYA10Jours = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const score = computePriorityScore('vide', ilYA10Jours, 0);

    // gravité 'vide' = 1 -> base 100, aucun bonus de fraîcheur ni de volume.
    expect(score).toBe(100);
  });
});
