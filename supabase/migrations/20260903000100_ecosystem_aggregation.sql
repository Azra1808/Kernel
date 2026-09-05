begin;

-- Cette migration complète le schéma de la tâche 3. Elle échoue tôt et avec
-- un message explicite si les tables amont n'ont pas encore été déployées.
do $$
declare
  required_table text;
begin
  foreach required_table in array array[
    'profiles', 'diagnoses', 'waste_points', 'waste_reports', 'ecosystem_signals'
  ] loop
    if to_regclass('public.' || required_table) is null then
      raise exception 'Table requise manquante: public.% (appliquer d''abord le schéma de la tâche 3)', required_table;
    end if;
  end loop;
end
$$;

alter table public.diagnoses
  add column if not exists severity text not null default 'moyen';

alter table public.diagnoses drop constraint if exists diagnoses_severity_check;
alter table public.diagnoses
  add constraint diagnoses_severity_check check (severity in ('faible', 'moyen', 'eleve'));

alter table public.ecosystem_signals drop constraint if exists ecosystem_signals_severity_check;
update public.ecosystem_signals set severity = 'eleve' where severity = 'élevé';
alter table public.ecosystem_signals
  add constraint ecosystem_signals_severity_check check (severity in ('faible', 'moyen', 'eleve'));

create unique index if not exists ecosystem_signals_source_uidx
  on public.ecosystem_signals (source_type, source_id);

-- Reprendre l'historique existant avant d'activer les triggers. L'upsert rend
-- cette étape idempotente si la migration est rejouée sur un clone de travail.
insert into public.ecosystem_signals (
  source_type, source_id, severity, neighborhood, created_at
)
select 'diagnosis', d.id, d.severity, p.village, d.created_at
from public.diagnoses d
join public.profiles p on p.id = d.user_id
where p.village is not null
on conflict (source_type, source_id) do update set
  severity = excluded.severity,
  neighborhood = excluded.neighborhood,
  created_at = excluded.created_at;

insert into public.ecosystem_signals (
  source_type, source_id, severity, neighborhood, created_at
)
select
  'waste_report',
  wr.id,
  case wr.status
    when 'plein' then 'eleve'
    when 'partiel' then 'moyen'
    when 'vide' then 'faible'
    else 'moyen'
  end,
  wp.neighborhood,
  wr.created_at
from public.waste_reports wr
join public.waste_points wp on wp.id = wr.waste_point_id
where wp.neighborhood is not null
on conflict (source_type, source_id) do update set
  severity = excluded.severity,
  neighborhood = excluded.neighborhood,
  created_at = excluded.created_at;

create or replace function public.calculate_ecosystem_health_score(p_severities text[])
returns integer
language sql
immutable
parallel safe
set search_path = ''
as $$
  select case
    when coalesce(cardinality(p_severities), 0) < 3 then null
    else greatest(
      0,
      least(
        100,
        round(
          100 - (
            (
              select avg(
                case severity
                  when 'faible' then 1
                  when 'moyen' then 2
                  when 'eleve' then 3
                  else 2
                end
              )
              from unnest(p_severities) as severity
            ) - 1
          ) / 2 * 100
        )::integer
      )
    )
  end;
$$;

create or replace function public.sync_diagnosis_ecosystem_signal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_neighborhood text;
begin
  if tg_op = 'DELETE' then
    delete from public.ecosystem_signals
    where source_type = 'diagnosis' and source_id = old.id;
    return old;
  end if;

  select p.village into v_neighborhood
  from public.profiles p
  where p.id = new.user_id;

  if v_neighborhood is null then
    raise exception 'Le profil % doit avoir un village avant l''agrégation', new.user_id;
  end if;

  insert into public.ecosystem_signals (
    source_type, source_id, severity, neighborhood, created_at
  ) values (
    'diagnosis', new.id, new.severity, v_neighborhood, new.created_at
  )
  on conflict (source_type, source_id) do update set
    severity = excluded.severity,
    neighborhood = excluded.neighborhood,
    created_at = excluded.created_at;

  return new;
end;
$$;

create or replace function public.sync_waste_report_ecosystem_signal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_neighborhood text;
  v_severity text;
begin
  if tg_op = 'DELETE' then
    delete from public.ecosystem_signals
    where source_type = 'waste_report' and source_id = old.id;
    return old;
  end if;

  select wp.neighborhood into v_neighborhood
  from public.waste_points wp
  where wp.id = new.waste_point_id;

  if v_neighborhood is null then
    raise exception 'Le point de déchets % doit avoir un quartier', new.waste_point_id;
  end if;

  v_severity := case new.status
    when 'plein' then 'eleve'
    when 'partiel' then 'moyen'
    when 'vide' then 'faible'
    else 'moyen'
  end;

  insert into public.ecosystem_signals (
    source_type, source_id, severity, neighborhood, created_at
  ) values (
    'waste_report', new.id, v_severity, v_neighborhood, new.created_at
  )
  on conflict (source_type, source_id) do update set
    severity = excluded.severity,
    neighborhood = excluded.neighborhood,
    created_at = excluded.created_at;

  return new;
end;
$$;

drop trigger if exists diagnoses_sync_ecosystem_signal on public.diagnoses;
create trigger diagnoses_sync_ecosystem_signal
after insert or update of severity, user_id, created_at or delete on public.diagnoses
for each row execute function public.sync_diagnosis_ecosystem_signal();

drop trigger if exists waste_reports_sync_ecosystem_signal on public.waste_reports;
create trigger waste_reports_sync_ecosystem_signal
after insert or update of status, waste_point_id, user_id, created_at or delete on public.waste_reports
for each row execute function public.sync_waste_report_ecosystem_signal();

alter table public.ecosystem_signals enable row level security;
revoke all on table public.ecosystem_signals from anon, authenticated;

create or replace function public.get_ecosystem_dashboard(p_days integer default 7)
returns table (
  health_score integer,
  health_label text,
  total_signals bigint,
  plant_diseases bigint,
  waste_points bigint,
  healthy_days bigint,
  daily_trend jsonb,
  privacy_threshold integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_neighborhood text;
  v_days integer := greatest(1, least(coalesce(p_days, 7), 31));
  v_severities text[];
begin
  if auth.uid() is null then
    raise exception 'Authentification requise' using errcode = '42501';
  end if;

  select p.village into v_neighborhood
  from public.profiles p
  where p.id = auth.uid();

  if v_neighborhood is null then
    raise exception 'Quartier du profil manquant' using errcode = '22023';
  end if;

  select array_agg(es.severity order by es.created_at)
  into v_severities
  from public.ecosystem_signals es
  where es.neighborhood = v_neighborhood
    and es.created_at >= current_date - (v_days - 1);

  return query
  with day_series as (
    select generate_series(
      current_date - (v_days - 1), current_date, interval '1 day'
    )::date as day
  ), filtered as (
    select es.*
    from public.ecosystem_signals es
    where es.neighborhood = v_neighborhood
      and es.created_at >= current_date - (v_days - 1)
  ), day_counts as (
    select
      ds.day,
      count(f.id) as signal_count,
      count(f.id) filter (where f.severity = 'eleve') as high_count
    from day_series ds
    left join filtered f on f.created_at::date = ds.day
    group by ds.day
  ), stats as (
    select
      count(*) as total,
      count(*) filter (where source_type = 'diagnosis') as diagnoses,
      count(*) filter (where source_type = 'waste_report') as waste
    from filtered
  )
  select
    public.calculate_ecosystem_health_score(v_severities),
    case
      when s.total < 3 then 'Données insuffisantes'
      when public.calculate_ecosystem_health_score(v_severities) >= 75 then 'Bon'
      when public.calculate_ecosystem_health_score(v_severities) >= 50 then 'Vigilance'
      else 'Critique'
    end,
    case when s.total >= 3 then s.total else 0 end,
    case when s.total >= 3 then s.diagnoses else 0 end,
    case when s.total >= 3 then s.waste else 0 end,
    case when s.total >= 3 then count(*) filter (where dc.high_count = 0) else 0 end,
    case
      when s.total >= 3 then jsonb_agg(jsonb_build_object('date', dc.day, 'count', dc.signal_count) order by dc.day)
      else '[]'::jsonb
    end,
    3
  from stats s cross join day_counts dc
  group by s.total, s.diagnoses, s.waste;
end;
$$;

revoke all on function public.get_ecosystem_dashboard(integer) from public, anon;
grant execute on function public.get_ecosystem_dashboard(integer) to authenticated;

comment on function public.calculate_ecosystem_health_score(text[]) is
  'Indice 0-100 fondé sur la gravité moyenne: faible=100, moyen=50, élevé=0. Masqué sous 3 signaux.';
comment on function public.get_ecosystem_dashboard(integer) is
  'Retourne uniquement les agrégats du quartier du profil authentifié, jamais les événements individuels.';

commit;
