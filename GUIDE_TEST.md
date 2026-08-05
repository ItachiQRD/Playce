# Guide de test PLAYCE V1

## Lancer l'app

```bash
npm install
npm run dev
```

Ouvrir **http://localhost:3000**

Un bouton flottant **Demo** (bas à droite) permet de changer de rôle à tout moment.

## Comptes de test

| Qui | Email | Pour tester |
|-----|-------|-------------|
| Amine (athlète) | amine@playce.demo | Sports ID, candidater, messages |
| Sofia (athlète) | sofia@playce.demo | Demande d'opportunité |
| ASC Metz (club) | recrutement@asc.demo | Publier offres, gérer candidatures |
| Marc (scout) | marc@scout.demo | Recherche, contact |
| Léa (coach) | lea@coach.demo | Profil coach |
| Admin | admin@playce.demo | Modération, KPI, CSV |

## Parcours recommandés (15 min)

### 1. Athlète → Club (cœur du produit)
1. Arriver sur le feed (Amine est connecté par défaut)
2. Ouvrir **Opportunities** → offre « Attaquant semi-pro »
3. Vérifier le **score de match** → **Candidater**
4. Bouton **Demo** → passer en **ASC Metz Academy**
5. Rouvrir l'offre → voir la candidature → changer le statut (Présélectionnée)
6. **Messages** → répondre à Amine

### 2. Sports ID public
1. Profil → vérifier stats, expérience, QR code
2. Copier le lien `/p/amine.benali` et l'ouvrir

### 3. Social
1. **Publish** → publier un highlight
2. **Reels** → swipe vertical, CTA Sports ID
3. Feed → like + commenter

### 4. Admin
1. Bouton **Demo** → **PLAYCE Admin**
2. Dashboard KPI → Users → Vérifier / Suspendre
3. Signalements → Résoudre
4. Export CSV

### 5. Nouveau compte
1. Déconnexion (Profil → Settings) ou `/auth/register`
2. Créer un compte → onboarding → score de complétude

## Mobile

Tester en mode responsive (Chrome DevTools → iPhone) : barre basse Home / Opportunities / Publish / Reels / Profile.

## Nouveautés à tester (v1.1)

| Feature | Où |
|---------|-----|
| Matching explicable (poids + critères) | Fiche opportunité |
| Kanban candidatures (drag & drop) | Fiche opportunité en tant que club |
| Upload photo/vidéo local | Publish |
| Signalement post (⋯) | Feed |
| Carte Sports ID + téléchargement | Profil → icône QR |
| Landing cinématique | `/` après reset localStorage |
| Vérification identité (gate clubs) | Publier offre / demande vérification |
| Analytics activation | Admin → Activation |
| PWA install | Bouton Installer (si navigateur compatible) |

## Reset démo

Dans la console navigateur :

```js
localStorage.removeItem("playce-demo-v1");
localStorage.removeItem("playce-analytics-v1");
location.href = "/";
```
