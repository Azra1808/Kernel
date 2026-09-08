begin;

-- =============================================================================
-- Tâche n°3 (Azra) — Schéma de base de données Kernel.
--
-- Ce schéma existait déjà, appliqué manuellement dans l'éditeur SQL Supabase,
-- mais n'avait jamais été versionné dans Git. Cette migration le reconstitue
-- fidèlement à partir de :
--   - la documentation projet (Kernel_Documentation.docx, section 4) ;
--   - le schéma local SQLite miroir (app/src/db/database.ts) ;
--   - les colonnes réellement consommées par la migration déjà committée
--     20260903000100_ecosystem_aggregation.sql (Krys), pour rester cohérent
--     avec ce qui tourne déjà en production.
--
-- Écrite en `create table if not exists` : rejouable sans casse sur la base
-- Supabase cloud existante, où les tables sont déjà en place.
-- =============================================================================

create extension if not exists "uuid-ossp" with schema extensions;

-- -----------------------------------------------------------------------------
-- 4.1 profiles — étend auth.users avec les informations propres à Kernel.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  village text,
  language_pref text not null default 'fr',
  role text not null default 'membre',
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Étend auth.users. village sert de clé d''agrégation anonymisée pour le module Écosystème.';

alter table public.profiles drop constraint if exists profiles_language_pref_check;
alter table public.profiles
  add constraint profiles_language_pref_check check (language_pref in ('fr', 'en'));

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('membre', 'benevole', 'administrateur'));

-- -----------------------------------------------------------------------------
-- 4.2 diagnoses — un enregistrement par diagnostic de plante.
-- Remarque : la colonne `severity` n'est PAS créée ici. Elle est ajoutée par
-- la migration 20260903000100_ecosystem_aggregation.sql (déjà committée par
-- Krys, `add column if not exists`), qu'on ne modifie pas rétroactivement.
-- -----------------------------------------------------------------------------
create table if not exists public.diagnoses (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  image_url text,
  crop_type text,
  disease_predicted text,
  confidence numeric,
  advice_text text,
  language text,
  sync_status text not null default 'synchronise',
  created_at timestamptz not null default now()
);

comment on table public.diagnoses is
  'Un diagnostic de maladie de plante. sync_status est un champ historique ;
   la file offline "en_attente" réelle vit uniquement côté SQLite local
   (app/src/db/database.ts) avant l''envoi.';

alter table public.diagnoses drop constraint if exists diagnoses_confidence_check;
alter table public.diagnoses
  add constraint diagnoses_confidence_check check (confidence is null or (confidence >= 0 and confidence <= 1));

create index if not exists diagnoses_user_id_idx on public.diagnoses (user_id);
create index if not exists diagnoses_created_at_idx on public.diagnoses (created_at);

-- -----------------------------------------------------------------------------
-- 4.3 waste_points — points de collecte connus dans une communauté.
-- -----------------------------------------------------------------------------
create table if not exists public.waste_points (
  id uuid primary key default extensions.uuid_generate_v4(),
  name text not null,
  latitude numeric,
  longitude numeric,
  neighborhood text not null,
  created_at timestamptz not null default now()
);

comment on table public.waste_points is 'Points de collecte de déchets, référentiel communautaire.';

create index if not exists waste_points_neighborhood_idx on public.waste_points (neighborhood);

-- -----------------------------------------------------------------------------
-- 4.4 waste_reports — historique des signalements sur un point de collecte.
-- -----------------------------------------------------------------------------
create table if not exists public.waste_reports (
  id uuid primary key default extensions.uuid_generate_v4(),
  waste_point_id uuid not null references public.waste_points (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null,
  note text,
  sync_status text not null default 'synchronise',
  created_at timestamptz not null default now()
);

comment on table public.waste_reports is 'Signalements horodatés sur un point de collecte.';

alter table public.waste_reports drop constraint if exists waste_reports_status_check;
alter table public.waste_reports
  add constraint waste_reports_status_check check (status in ('plein', 'partiel', 'vide'));

create index if not exists waste_reports_waste_point_id_idx on public.waste_reports (waste_point_id);
create index if not exists waste_reports_created_at_idx on public.waste_reports (created_at);

-- -----------------------------------------------------------------------------
-- 4.5 ecosystem_signals — table d'agrégation, seule source de vérité pour le
-- dashboard Écosystème de Krys. On se contente ici de la créer et d'activer
-- RLS sans policy (deny-by-default) : c'est la migration de Krys
-- (20260903000100) qui pose l'index unique, les contraintes de gravité, et
-- révoque explicitement tout accès direct pour ne l'exposer que via la
-- fonction SECURITY DEFINER get_ecosystem_dashboard(). On ne duplique pas
-- cette logique ici pour ne pas diverger de son historique de migration.
-- -----------------------------------------------------------------------------
create table if not exists public.ecosystem_signals (
  id uuid primary key default extensions.uuid_generate_v4(),
  source_type text not null,
  source_id uuid not null,
  severity text not null,
  neighborhood text,
  created_at timestamptz not null default now()
);

comment on table public.ecosystem_signals is
  'Agrégation anonymisée (aucun user_id). Alimentée uniquement par les triggers
   de public.diagnoses / public.waste_reports définis dans la migration Krys.';

alter table public.ecosystem_signals drop constraint if exists ecosystem_signals_source_type_check;
alter table public.ecosystem_signals
  add constraint ecosystem_signals_source_type_check check (source_type in ('diagnosis', 'waste_report'));

alter table public.ecosystem_signals enable row level security;

-- -----------------------------------------------------------------------------
-- 4.6 chat_messages — historique des échanges avec l'Assistant Kernel.
-- -----------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  sender text not null,
  content text not null,
  sync_status text not null default 'synchronise',
  created_at timestamptz not null default now()
);

comment on table public.chat_messages is 'Historique des échanges utilisateur <-> assistant Kernel.';

alter table public.chat_messages drop constraint if exists chat_messages_sender_check;
alter table public.chat_messages
  add constraint chat_messages_sender_check check (sender in ('user', 'bot'));

create index if not exists chat_messages_user_id_created_at_idx
  on public.chat_messages (user_id, created_at);

-- -----------------------------------------------------------------------------
-- 4.7 user_settings — préférences d'affichage et d'accessibilité, 1 ligne/user.
-- -----------------------------------------------------------------------------
create table if not exists public.user_settings (
  id uuid primary key default extensions.uuid_generate_v4(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  theme text not null default 'clair',
  language text not null default 'fr',
  text_size text not null default 'normal',
  updated_at timestamptz not null default now()
);

comment on table public.user_settings is 'Une ligne par utilisateur, préférences synchronisées après un accès local immédiat.';

alter table public.user_settings drop constraint if exists user_settings_theme_check;
alter table public.user_settings
  add constraint user_settings_theme_check check (theme in ('clair', 'sombre'));

alter table public.user_settings drop constraint if exists user_settings_text_size_check;
alter table public.user_settings
  add constraint user_settings_text_size_check check (text_size in ('petit', 'normal', 'grand'));

-- -----------------------------------------------------------------------------
-- Vue communautaire des points de collecte (section 5.2 : jamais de donnée
-- individuelle exposée). Calcule le statut courant et le nombre de
-- signalements récents par point, sans jamais exposer waste_reports.user_id.
-- Sert de source pour l'écran Ressources (tâches 12/13/14 de Florent).
-- -----------------------------------------------------------------------------
-- DROP explicite avant recréation : PostgreSQL interdit de changer la liste
-- de colonnes d'une vue via CREATE OR REPLACE (seulement en ajouter à la
-- fin). Une vue du même nom existait déjà en production, créée à la main
-- (probablement avec un jeu de colonnes différent) — on la supprime donc
-- d'abord pour repartir sur une définition propre et cohérente.
drop view if exists public.v_waste_points_status;

create view public.v_waste_points_status
with (security_invoker = true) as
select
  wp.id,
  wp.name,
  wp.latitude,
  wp.longitude,
  wp.neighborhood,
  latest.status as current_status,
  latest.created_at as last_reported_at,
  coalesce(recent.recent_report_count, 0) as recent_report_count
from public.waste_points wp
left join lateral (
  select wr.status, wr.created_at
  from public.waste_reports wr
  where wr.waste_point_id = wp.id
  order by wr.created_at desc
  limit 1
) latest on true
left join lateral (
  select count(*) as recent_report_count
  from public.waste_reports wr
  where wr.waste_point_id = wp.id
    and wr.created_at >= now() - interval '7 days'
) recent on true;

comment on view public.v_waste_points_status is
  'Statut courant + volume récent par point de collecte, sans identifiant utilisateur (tâche 14).';

-- -----------------------------------------------------------------------------
-- Provisionnement automatique du profil à l'inscription (Supabase Auth).
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, language_pref, role, created_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'language_pref', 'fr'),
    'membre',
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security — RGPD / section 5.3 de la documentation :
-- données personnelles visibles uniquement par leur auteur ; données
-- communautaires en lecture seule pour tout membre authentifié.
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.diagnoses enable row level security;
alter table public.waste_points enable row level security;
alter table public.waste_reports enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists diagnoses_owner_all on public.diagnoses;
create policy diagnoses_owner_all on public.diagnoses
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists waste_points_read_all on public.waste_points;
create policy waste_points_read_all on public.waste_points
  for select to authenticated using (true);

drop policy if exists waste_reports_owner_read on public.waste_reports;
create policy waste_reports_owner_read on public.waste_reports
  for select to authenticated using (user_id = auth.uid());

drop policy if exists waste_reports_owner_insert on public.waste_reports;
create policy waste_reports_owner_insert on public.waste_reports
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists chat_messages_owner_all on public.chat_messages;
create policy chat_messages_owner_all on public.chat_messages
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists user_settings_owner_all on public.user_settings;
create policy user_settings_owner_all on public.user_settings
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- v_waste_points_status est en security_invoker : elle hérite de la policy
-- waste_points_read_all ci-dessus (lecture ouverte aux membres authentifiés),
-- sans jamais exposer waste_reports.user_id (non sélectionné dans la vue).
grant select on public.v_waste_points_status to authenticated;

-- -----------------------------------------------------------------------------
-- Privilèges de base sur les tables. Sur un projet Supabase existant, ces
-- GRANTs par défaut sont déjà en place ; on les redéclare explicitement pour
-- que cette migration soit autoportante (rejouable telle quelle sur une base
-- de test locale, une preview branch, ou un nouvel environnement CI), sans
-- dépendre d'une configuration implicite de la plateforme. RLS reste la seule
-- barrière réelle : ces GRANTs n'ouvrent rien de plus que ce que les policies
-- ci-dessus autorisent déjà.
-- ecosystem_signals est délibérément exclue : aucun GRANT direct, seule la
-- fonction SECURITY DEFINER get_ecosystem_dashboard() (migration Krys) peut y
-- accéder, en cohérence avec le REVOKE explicite de cette même migration.
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.diagnoses to authenticated;
grant select on public.waste_points to authenticated;
grant select, insert on public.waste_reports to authenticated;
grant select, insert, update, delete on public.chat_messages to authenticated;
grant select, insert, update on public.user_settings to authenticated;

commit;
