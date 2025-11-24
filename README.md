# TrophyQuest – micro‑service Node (PSN → PostgreSQL)

Micro‑service minimal pour **récupérer jeux & trophées PSN** avec [`psn-api`](https://www.npmjs.com/package/psn-api), et **stocker en PostgreSQL** (local). Pensé pour alimenter ensuite le backend Spring/Angular ou un ETL vers Snowflake.

## Prérequis
- Node.js 18+ et npm
- Une base PostgreSQL accessible
- Un token **NPSSO** PlayStation Network (voir la doc [`psn-api`](https://www.npmjs.com/package/psn-api))

## Configuration
Définir les variables d'environnement avant de lancer les scripts (via un fichier `.env` + `dotenv` ou export) :

| Variable        | Rôle                                                     |
|-----------------|----------------------------------------------------------|
| `NPSSO`         | Token PSN (obligatoire)                                  |
| `PROFILE_NAME`  | Nom du profil PSN (optionnel, pour cibler un compte)     |
| `PGHOST`        | Hôte PostgreSQL                                          |
| `PGPORT`        | Port PostgreSQL                                          |
| `PGDATABASE`    | Base cible                                               |
| `PGUSER`        | Utilisateur                                              |
| `PGPASSWORD`    | Mot de passe                                             |
| `PGSSL`         | Mettre à `true` pour activer SSL (sinon non défini)      |

## Installation
```bash
npm install
```

## Usage
Trois scripts TypeScript sont disponibles via npm :

- **Initial fetch** : récupère le profil, les titres, les sets et les trophées puis insère tout en base.
  ```bash
  npm run start-fetcher
  ```
- **Refresher** : ne met à jour que les titres/trophées joués depuis le dernier `updated_at` en base.
  ```bash
  npm run start-refresher
  ```
- **Remover** : supprime complètement un utilisateur et ses données associées dans PostgreSQL.
  ```bash
  npm run start-deleter
  ```

Les logs indiquent le temps total de traitement. Un `process.exitCode = 1` est renvoyé en cas d'erreur pour faciliter l'intégration dans des jobs CI/CD ou des cron.
