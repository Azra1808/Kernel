begin;

create extension if not exists pgtap with schema extensions;

-- Nécessaire uniquement pour que CE test puisse appeler extensions.throws_ok()
-- après être passé sur le rôle "authenticated" plus bas (test RLS). N'accorde
-- aucun privilège applicatif : tout est annulé par le rollback final du
-- fichier, et pgTAP n'est jamais installé sur la base de production.
grant usage on schema extensions to authenticated;

select plan(10);

-- ---------------------------------------------------------------------------
-- handle_new_user : un profil est provisionné automatiquement à l'inscription.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-0000000000f1', 'pgtap-auto@kernel.dev', '{"full_name":"Auto","language_pref":"en"}');

select is(
  (select language_pref from public.profiles where id = '00000000-0000-0000-0000-0000000000f1'),
  'en',
  'handle_new_user reprend language_pref des métadonnées d''inscription'
);

select is(
  (select role from public.profiles where id = '00000000-0000-0000-0000-0000000000f1'),
  'membre',
  'handle_new_user assigne le rôle par défaut "membre"'
);

-- ---------------------------------------------------------------------------
-- Contraintes de domaine.
-- ---------------------------------------------------------------------------
update public.profiles set village = 'Nlongkak' where id = '00000000-0000-0000-0000-0000000000f1';

insert into public.waste_points (id, name, neighborhood)
values ('00000000-0000-0000-0000-0000000000a1', 'Point de test pgTAP', 'Nlongkak');

select throws_ok(
  $$ insert into public.waste_reports (waste_point_id, user_id, status)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000f1', 'inconnu') $$,
  23514,
  null,
  'waste_reports.status rejette une valeur hors plein/partiel/vide'
);

select throws_ok(
  $$ insert into public.diagnoses (user_id, confidence)
     values ('00000000-0000-0000-0000-0000000000f1', 1.5) $$,
  23514,
  null,
  'diagnoses.confidence rejette une valeur hors de [0,1]'
);

-- ---------------------------------------------------------------------------
-- Garde-fou de confiance (20260903000200).
-- ---------------------------------------------------------------------------
insert into public.diagnoses (id, user_id, crop_type, confidence)
values ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000f1', 'manioc', 0.10);

select is(
  (select count(*)::int from public.ecosystem_signals where source_id = '00000000-0000-0000-0000-0000000000d1'),
  0,
  'un diagnostic sous le seuil de confiance (0.10 < 0.35) ne crée pas de signal'
);

insert into public.diagnoses (id, user_id, crop_type, confidence)
values ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000f1', 'manioc', 0.90);

select is(
  (select count(*)::int from public.ecosystem_signals where source_id = '00000000-0000-0000-0000-0000000000d2'),
  1,
  'un diagnostic au-dessus du seuil de confiance crée bien un signal'
);

update public.diagnoses set confidence = 0.05 where id = '00000000-0000-0000-0000-0000000000d2';

select is(
  (select count(*)::int from public.ecosystem_signals where source_id = '00000000-0000-0000-0000-0000000000d2'),
  0,
  'faire chuter la confiance sous le seuil retire le signal existant (le trigger réagit bien à UPDATE OF confidence)'
);

insert into public.diagnoses (id, user_id, crop_type, confidence)
values ('00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-0000000000f1', 'manioc', null);

select is(
  (select count(*)::int from public.ecosystem_signals where source_id = '00000000-0000-0000-0000-0000000000d3'),
  1,
  'un diagnostic sans score de confiance connu (NULL) n''est pas filtré par le seuil'
);

-- ---------------------------------------------------------------------------
-- v_waste_points_status : jamais d'identifiant utilisateur exposé.
-- ---------------------------------------------------------------------------
select isnt(
  (select string_agg(column_name, ',') from information_schema.columns
   where table_schema = 'public' and table_name = 'v_waste_points_status' and column_name = 'user_id'),
  'user_id',
  'v_waste_points_status n''expose pas waste_reports.user_id'
);

-- ---------------------------------------------------------------------------
-- ecosystem_signals reste verrouillée : accès direct refusé même authentifié.
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000f1', true);

select extensions.throws_ok(
  $$ select * from public.ecosystem_signals $$,
  42501,
  null,
  'ecosystem_signals refuse toute lecture directe, même à un utilisateur authentifié'
);
reset role;

select * from finish();
rollback;
