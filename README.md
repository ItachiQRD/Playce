# PLAYCE V1

**The Digital Infrastructure of Sport** — Where Sport Meets Opportunity.

Plateforme omnisports (Sports ID, réseau social, opportunités, messagerie, admin) construite avec **Next.js 16**, **Tailwind CSS** et **Supabase** (mode démo intégré).

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Le **mode démo** est activé par défaut (`NEXT_PUBLIC_DEMO_MODE=true`) : aucune clé Supabase n'est requise. Les données sont persistées dans `localStorage`.

### Comptes démo

| Email | Rôle |
|-------|------|
| amine@playce.demo | Athlète |
| sofia@playce.demo | Athlète |
| recrutement@asc.demo | Club |
| marc@scout.demo | Scout |
| lea@coach.demo | Coach |
| kevin@playce.demo | Athlète |
| admin@playce.demo | Admin |

Sur `/auth/login`, cliquez sur un utilisateur pour basculer instantanément.

## Stack

- **Frontend** : Next.js App Router, TypeScript, Tailwind CSS v4, Lucide icons
- **Design** : charte PLAYCE (dark `#0F172A`, teal `#00B894`, Sora + Inter)
- **Backend** : Supabase (Auth, PostgreSQL + RLS, Storage, Realtime) — schéma dans `supabase/schema.sql`
- **i18n** : FR / EN
- **PWA** : `manifest.webmanifest`

## Connexion Supabase (production)

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter `supabase/schema.sql` dans le SQL Editor
3. Créer les buckets Storage : `avatars`, `covers`, `posts`, `media`
4. Copier `.env.local.example` → `.env.local` et renseigner :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

5. Activer Google / Apple OAuth dans Supabase Auth (optionnel)

## Modules livrés (V1)

| Module | Statut |
|--------|--------|
| Auth + choix rôle/sport | ✅ |
| Onboarding + score de complétude | ✅ |
| Sports ID (profil, stats, médias, QR, URL publique `/p/[handle]`) | ✅ |
| Feed social (posts, likes, commentaires, hashtags) | ✅ |
| Opportunités (offres/demandes, filtres, candidature, matching) | ✅ |
| Recherche universelle | ✅ |
| Messagerie 1:1 | ✅ |
| Notifications | ✅ |
| Reels (swipe vertical) | ✅ |
| Back-office admin (KPI, users, signalements, CSV) | ✅ |
| RGPD (export JSON, suppression compte) | ✅ |
| i18n FR/EN | ✅ |
| PWA manifest | ✅ |

## Navigation mobile

Home · Opportunities · Publish · Reels · Profile

## Structure

```
src/
  app/           # Pages App Router
  components/    # UI, layout, feed, cards
  lib/           # types, utils, demo-store, supabase, i18n
  messages/      # fr.json / en.json
supabase/
  schema.sql     # Schéma complet + RLS + seeds football
```

## Scripts

```bash
npm run dev      # Développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # ESLint
```

## Critère V1

Parcours athlète et club de bout en bout : inscription → Sports ID → feed → opportunité → candidature → message → notification → modération admin.

---

© PLAYCE — Talent is everywhere. Opportunity isn't.
