# Kernel

Application mobile **offline-first** pour communautés rurales — diagnostic agricole, gestion des déchets et suivi de l'écosystème, réunis dans une même expérience.

Projet réalisé pour **NextStep Hacks 2026** — Thème : *Earth Forward*.

## Sommaire

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Structure du dépôt](#structure-du-dépôt)
- [Démarrage du projet](#démarrage-du-projet)
- [Branches & workflow Git](#branches--workflow-git)
- [Équipe](#équipe)
- [Documentation](#documentation)

## Présentation

Kernel réunit 3 modules dans une seule application :

- **Agriculture** — diagnostic de maladies de plantes par photo, conseils en français/anglais, fonctionne hors ligne.
- **Ressources** — signalement et priorisation de la collecte des déchets communautaires.
- **Écosystème** — tableau de bord agrégeant les signaux des deux autres modules en un indice de santé environnementale local.

Un **assistant conversationnel** (Kernel) et un onglet **Paramètres** (thème, langue, taille de texte) complètent l'expérience.

Voir la documentation complète dans [`docs/Kernel_Documentation.docx`](./docs/Kernel_Documentation.docx).

## Stack technique

| Composant | Technologie |
| --- | --- |
| Frontend mobile | React Native (Expo) |
| Backend / BaaS | Supabase (PostgreSQL, Auth, Storage) |
| Stockage local | SQLite (expo-sqlite) + AsyncStorage |
| IA diagnostic plantes | Modèle embarqué TensorFlow Lite |
| IA assistant | Moteur de règles local + API Claude en ligne |

## Structure du dépôt

```
Kernel/
├── app/              # Application React Native (Expo) — initialisée à la tâche n°4
├── assets/
│   ├── design/       # Maquettes, charte graphique, exports de la maquette validée
│   └── icons/        # Sprite SVG d'icônes de l'application
├── docs/             # Documentation technique, classeur de répartition des tâches
└── README.md
```

## Démarrage du projet

> À compléter à la tâche n°4 (initialisation du projet Expo).

```bash
cd app
npm install
npx expo start
```

## Branches & workflow Git

- `main` — toujours stable, correspond à la version présentée au jury.
- `dev` — branche d'intégration où chaque module est fusionné après revue.
- `feature/<module>` — une branche par module (`feature/agriculture`, `feature/ressources`, `feature/ecosystem`, `feature/assistant-parametres`).

Convention de commit : `feat:`, `fix:`, `docs:`, `chore:`.

Toute fusion vers `dev` passe par une Pull Request avec au moins une relecture. La fusion `dev` → `main` se fait uniquement avant une démo ou une soumission.

## Équipe

| Membre | Rôle |
| --- | --- |
| Florette | Coordination, fondations, assistant & paramètres |
| Flo | Module Agriculture |
| Michou | Module Ressources |
| Krys | Module Écosystème |

## Documentation

- [`docs/Kernel_Documentation.docx`](./docs/Kernel_Documentation.docx) — documentation technique et fonctionnelle complète.
- [`docs/Kernel_Repartition_Taches.xlsx`](./docs/Kernel_Repartition_Taches.xlsx) — classeur de répartition des tâches de l'équipe.
- [`assets/design/kernel-mockup.html`](./assets/design/kernel-mockup.html) — maquette de référence validée.
