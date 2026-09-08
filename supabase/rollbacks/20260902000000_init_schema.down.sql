begin;

-- Rollback de 20260902000000_init_schema.sql.
-- Attention : à n'exécuter qu'AVANT d'avoir appliqué
-- 20260903000100_ecosystem_aggregation.sql, sinon celle-ci échouera au
-- prochain redéploiement (elle vérifie l'existence de ces tables en tout
-- premier). Sur la base de production déjà en place, ce rollback n'a de sens
-- que pour un environnement de test jetable.

drop view if exists public.v_waste_points_status;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.chat_messages;
drop table if exists public.user_settings;
drop table if exists public.ecosystem_signals;
drop table if exists public.waste_reports;
drop table if exists public.waste_points;
drop table if exists public.diagnoses;
drop table if exists public.profiles;

commit;
