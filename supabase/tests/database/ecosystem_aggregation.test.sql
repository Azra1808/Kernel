begin;

create extension if not exists pgtap with schema extensions;

select plan(6);

select is(
  public.calculate_ecosystem_health_score(array['faible', 'faible', 'faible']),
  100,
  'trois signaux faibles donnent un indice de 100'
);

select is(
  public.calculate_ecosystem_health_score(array['moyen', 'moyen', 'moyen']),
  50,
  'trois signaux moyens donnent un indice de 50'
);

select is(
  public.calculate_ecosystem_health_score(array['eleve', 'eleve', 'eleve']),
  0,
  'trois signaux élevés donnent un indice de 0'
);

select is(
  public.calculate_ecosystem_health_score(array['faible', 'moyen', 'eleve']),
  50,
  'la formule moyenne les gravités de façon déterministe'
);

select is(
  public.calculate_ecosystem_health_score(array['faible', 'faible']),
  null,
  'moins de trois signaux masque l indice'
);

select throws_ok(
  $$ select * from public.get_ecosystem_dashboard(7) $$,
  '42501',
  'Authentification requise',
  'le dashboard refuse un appel anonyme'
);

select * from finish();
rollback;
