# Supabase local

Les migrations sont versionnées et doivent être revues avant toute application distante.

## Ordre attendu

1. Récupérer ou appliquer le schéma amont de la tâche 3 (`profiles`, `diagnoses`, `waste_points`, `waste_reports`, `ecosystem_signals`).
2. Démarrer l'environnement local avec `supabase start`.
3. Recréer la base locale avec `supabase db reset`.
4. Exécuter `supabase test db`.
5. Comparer le schéma distant avec `supabase db diff` avant `supabase db push`.

La migration Écosystème refuse volontairement de créer silencieusement les tables amont. Cela empêche de masquer une divergence entre le classeur, le projet distant et Git.

## Sécurité

- Le mobile utilise uniquement `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Les clés `sb_secret_*`, `service_role` et le mot de passe PostgreSQL ne vont jamais dans Expo, Git ou les logs CI.
- Les paramètres privés locaux sont séparés dans `supabase/.env.local`, ignoré par Git. `supabase/.env.example` documente uniquement les noms attendus.
- `ecosystem_signals` ne possède aucun droit direct pour `anon` ou `authenticated`.
- Le RPC renvoie uniquement l'agrégat du quartier du profil connecté et masque l'indice ainsi que les compteurs détaillés sous trois signaux.
