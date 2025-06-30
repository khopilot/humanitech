# Mine Action AI System - Backend Setup Guide

## Configuration initiale

### 1. Base de données D1

La base de données D1 `minedec` est déjà créée et configurée :
- **Nom** : minedec
- **ID** : a73543cf-ba50-4801-b390-508cf599877e

Configuration dans `wrangler.toml` :
```toml
[[d1_databases]]
binding = "DB"
database_name = "minedec"
database_id = "a73543cf-ba50-4801-b390-508cf599877e"
```

### 2. Bucket R2

Le bucket R2 `minedec` est déjà créé et configuré :
- **Nom** : minedec
- **Région** : Asie-Pacifique (APAC)
- **API S3** : https://e8fa8d76479de666118db7977d6a949e.r2.cloudflarestorage.com/minedec

### 3. Configurer les secrets

```bash
# Configurer les secrets (sera demandé interactivement)
npm run secrets:set
```

Vous devrez fournir :
- `JWT_SECRET` : Une chaîne aléatoire sécurisée (min 32 caractères)
- `ANTHROPIC_API_KEY` : Votre clé API Anthropic

### 4. URL publique R2

L'URL publique R2 est déjà configurée dans `wrangler.toml` :
```toml
[vars]
R2_PUBLIC_URL = "https://e8fa8d76479de666118db7977d6a949e.r2.cloudflarestorage.com/minedec"
```

**Note** : Si vous avez besoin d'un domaine personnalisé pour accéder aux fichiers, vous pouvez configurer un Custom Domain dans Cloudflare R2.

### 5. Exécuter les migrations

```bash
# Pour le développement local
npm run db:local

# Pour la production
npm run db:migrate
```

## Développement

```bash
# Démarrer le serveur de développement
npm run dev
```

## Déploiement

```bash
# Déployer en production
npm run deploy
```

## Sécurité

### Mots de passe
- Utilisation de bcrypt avec salt rounds = 10
- Validation minimale : 6 caractères

### JWT
- Expiration : 24 heures
- Secret stocké dans Cloudflare Secrets

### CORS
- Configuré pour localhost:5173 et *.workers.dev
- À ajuster selon vos besoins

## API Endpoints

### Publics
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/health` - Vérification santé

### Protégés (JWT requis)
- `GET /api/auth/profile` - Profil utilisateur
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Liste documents
- `POST /api/reports/generate` - Générer rapport
- `POST /api/chat` - Chat IA
- `POST /api/risk-analysis` - Analyse de risques
- `POST /api/sop/generate` - Générer SOP
- `GET /api/analytics/stats` - Statistiques

## Problèmes connus

1. **PDF Parsing** : L'implémentation actuelle est basique. Pour une meilleure extraction, considérez l'utilisation d'un service externe.

2. **Rate Limiting** : Non implémenté. Recommandé d'ajouter Cloudflare Rate Limiting ou une solution custom.

3. **File Size Limits** : Actuellement 10MB. Ajustable dans `documents.ts`.

## Variables d'environnement

- `ENVIRONMENT` : 'development' | 'production'
- `CORS_ORIGINS` : Origins autorisées (séparées par virgules)
- `R2_PUBLIC_URL` : URL publique pour accéder aux fichiers R2
- `JWT_SECRET` : Secret pour signer les JWT (dans Secrets)
- `ANTHROPIC_API_KEY` : Clé API Claude (dans Secrets)