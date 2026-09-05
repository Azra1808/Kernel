# État des tâches Krys

Mise à jour locale : 3 septembre 2026. Ce fichier décrit l'état du code ; le classeur d'origine n'a pas été modifié.

## Verdict

| N° | Tâche | État vérifié | Peut être considéré terminé ? |
| --- | --- | --- | --- |
| 8 | Écran Accueil statique | Écran fidèle à la maquette, composants réutilisables, navigation et test de rendu | Oui, localement |
| 15 | Agrégation Supabase | Migration, triggers, RPC agrégé, seuil de confidentialité, rollback et tests pgTAP écrits | Non, tant que le schéma initial de la tâche 3 n'est pas exporté dans Git et testé |
| 16 | Dashboard Écosystème | UI, graphique, répartition, client RPC, mode hors ligne/démo et tests métier | Oui pour l'UI ; validation live dépend de la tâche 15 |
| 23 | Polish visuel final | Accueil et dashboard contrôlés au format mobile | Non : la tâche 23 dépend des tests utilisateurs de la tâche 22 et concerne tous les écrans |

## Fondations Azra/Florette nécessaires à Krys

Le message de l'équipe parle d'Azra, alors que le classeur nomme encore cette personne « Florette ». Le classeur doit être corrigé pour éviter deux identités dans le suivi.

- Tâche 4 — Expo/navigation : présente sur `main`, donc utilisable.
- Tâche 5 — design system : socle local complété (palette, polices, icônes, composants d'accueil).
- Tâche 3 — schéma Supabase : annoncé dans la documentation, mais aucune migration initiale n'est versionnée. Azra doit exporter le schéma réel avec Supabase CLI après rotation des secrets exposés. Krys pourra ensuite exécuter `supabase db reset` et `supabase test db` sans deviner la structure distante.
- Tâche 20 — intégration finale : devra raccorder authentification, profil/quartier et les quatre modules avant le polish global.

## Interventions des autres tâches

- Flo, tâche 11 : enregistrer `diagnoses.severity` avec `faible`, `moyen` ou `eleve`. La confiance du modèle n'est pas une gravité et ne doit pas servir de substitut.
- Michou, tâche 13 : renseigner `waste_reports.user_id` et les statuts `plein`, `partiel` ou `vide` ; le trigger transforme ces statuts en gravité.
- Michou, tâche 21 : couvrir l'idempotence offline/online afin qu'une synchronisation répétée ne crée pas deux signaux. L'index unique `(source_type, source_id)` protège déjà le serveur.
- Toute l'équipe, tâche 22 : réaliser les tests utilisateurs avant que Krys puisse clôturer la tâche 23.

## Décisions techniques

- L'indice 0–100 dépend de la gravité moyenne : faible = 100, moyen = 50, élevé = 0. Le volume de signalements ne dégrade donc pas artificiellement un quartier qui participe davantage.
- Aucun identifiant utilisateur n'est ajouté à `ecosystem_signals`.
- Le RPC ne renvoie que le quartier du profil authentifié et masque l'indice ainsi que les compteurs détaillés sous trois signaux.
- En l'absence de configuration Supabase, l'application affiche un aperçu local explicitement étiqueté, sans faire passer les données de démonstration pour des données réelles.

## Git et livraison

Les changements sont actuellement non commités dans l'arbre local de `main`, car la création de la branche `codex/krys-foundations` n'a pas été autorisée. Aucun push n'a été effectué.

La CI proposée contrôle toutes les branches. Sur un push `main`, elle lance les contrôles puis construit un APK Android de debug. Le test pgTAP réel restera explicitement en attente jusqu'à l'ajout de la migration initiale de la tâche 3.
