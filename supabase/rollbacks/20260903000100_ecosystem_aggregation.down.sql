begin;

drop trigger if exists diagnoses_sync_ecosystem_signal on public.diagnoses;
drop trigger if exists waste_reports_sync_ecosystem_signal on public.waste_reports;
drop function if exists public.sync_diagnosis_ecosystem_signal();
drop function if exists public.sync_waste_report_ecosystem_signal();
drop function if exists public.get_ecosystem_dashboard(integer);
drop function if exists public.calculate_ecosystem_health_score(text[]);
drop index if exists public.ecosystem_signals_source_uidx;

alter table public.ecosystem_signals drop constraint if exists ecosystem_signals_severity_check;
alter table public.diagnoses drop constraint if exists diagnoses_severity_check;
-- La colonne diagnoses.severity est conservée au rollback afin de ne pas
-- détruire une donnée métier potentiellement déjà renseignée.

commit;
