begin;

-- =============================================================================
-- Garde-fou de confiance sur les diagnostics (tâche 3, Azra).
--
-- Le trigger d'agrégation de Krys (20260903000100_ecosystem_aggregation.sql)
-- fait remonter TOUT diagnostic dans ecosystem_signals, y compris ceux où le
-- modèle TFLite est peu sûr de sa prédiction (confidence très basse). Un
-- diagnostic à 8% de confiance ne devrait pas peser autant qu'un diagnostic à
-- 95% dans l'indice de santé environnementale communautaire.
--
-- Ce fichier ne modifie PAS 20260903000100 (historique de migration de Krys
-- intact) : il redéfinit seulement, dans une migration séparée qui s'applique
-- après, la fonction sync_diagnosis_ecosystem_signal() avec un seuil minimal.
-- =============================================================================

do $$
begin
  if to_regprocedure('public.sync_diagnosis_ecosystem_signal()') is null then
    raise exception
      'public.sync_diagnosis_ecosystem_signal() introuvable — appliquer d''abord 20260903000100_ecosystem_aggregation.sql';
  end if;
end
$$;

create or replace function public.sync_diagnosis_ecosystem_signal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_neighborhood text;
  -- Seuil validé avec Azra pour le schéma d'origine (tâche 3) : en dessous,
  -- le modèle est jugé trop incertain pour compter comme un signal fiable
  -- dans l'indice communautaire. Un confidence NULL (valeur historique ou
  -- modèle non exécuté) n'est PAS filtré ici : on préfère remonter un
  -- diagnostic sans score connu plutôt que le faire disparaître en silence.
  v_min_confidence constant numeric := 0.35;
begin
  if tg_op = 'DELETE' then
    delete from public.ecosystem_signals
    where source_type = 'diagnosis' and source_id = old.id;
    return old;
  end if;

  -- Confiance trop faible : on ne fait pas remonter ce diagnostic. S'il
  -- existait déjà un signal pour ce diagnostic (ex. correction d'un diagnostic
  -- existant dont la confiance vient de chuter sous le seuil), on le retire
  -- pour ne pas laisser une donnée obsolète fausser l'indice.
  if new.confidence is not null and new.confidence < v_min_confidence then
    delete from public.ecosystem_signals
    where source_type = 'diagnosis' and source_id = new.id;
    return new;
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

comment on function public.sync_diagnosis_ecosystem_signal() is
  'Alimente ecosystem_signals depuis diagnoses, en excluant les prédictions de confiance < 0.35 (tâche 3).';

-- Le trigger de 20260903000100 ne se déclenche pas sur UPDATE OF confidence
-- (seulement severity, user_id, created_at). Sans ce correctif, corriger la
-- confiance d'un diagnostic déjà enregistré ne ré-évaluerait jamais le seuil
-- ci-dessus. On redéclare donc le trigger (pas son fichier de migration
-- d'origine) avec `confidence` ajouté à la liste des colonnes surveillées.
drop trigger if exists diagnoses_sync_ecosystem_signal on public.diagnoses;
create trigger diagnoses_sync_ecosystem_signal
after insert or update of severity, user_id, created_at, confidence or delete on public.diagnoses
for each row execute function public.sync_diagnosis_ecosystem_signal();

commit;
