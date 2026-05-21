# VolleyPéi 🏐

Calendrier communautaire du volley à La Réunion.

## Concept

```
Splash logo → Calendrier public
              ↓
       Publier un tournoi (ouvert à tous)
              ↓
       status: pending
              ↓
       Admin valide / refuse
              ↓
       status: approved  → visible publiquement
```

**Pas de comptes utilisateurs.** L'admin est protégé par un mot de passe front.

## Architecture

```
src/
├── App.jsx                          # Racine (64 lignes)
├── main.jsx
│
├── lib/                             # Constantes, helpers purs
│   ├── constants.js                 # STATUS, SPONSOR_TIERS, MOIS…
│   ├── dates.js                     # helpers calendrier
│   ├── styles.js                    # CSS global (injecté 1× au root)
│   ├── logo.js                      # logo base64
│   └── supabase.js                  # client Supabase
│
├── services/                        # Couche d'accès Supabase
│   ├── index.js                     # barrel exports
│   ├── tournois.js                  # CRUD tournois + workflow
│   ├── sponsors.js                  # CRUD sponsors
│   ├── stats.js                     # tracking visites + stats
│   ├── storage.js                   # upload images
│   └── geocoding.js                 # Nominatim (lieu → lat/lng)
│
├── hooks/                           # Hooks personnalisés
│   ├── useTournois.js
│   ├── useSponsors.js
│   ├── useVisitStats.js
│   └── useTournoiForm.js            # état + validation + submit du formulaire
│
├── components/                      # UI réutilisables
│   ├── SplashScreen.jsx
│   ├── NavBar.jsx
│   ├── SponsorBlock.jsx
│   └── TournoiCard.jsx
│
├── calendar/                        # Page calendrier découpée
│   ├── PageCalendrier.jsx           # orchestrateur (126 lignes)
│   ├── MonthGrid.jsx                # grille mensuelle
│   ├── StatsPills.jsx               # pills visites/tournois
│   ├── PublishBanner.jsx            # bannière confirmation
│   ├── SelectedDateBar.jsx          # barre date sélectionnée
│   ├── TournoisList.jsx             # liste des cartes
│   └── SponsorSlots.jsx             # Gold/Silver/Bronze
│
├── pages/
│   ├── PageCarte.jsx                # carte OSM + liste
│   └── PagePartenaires.jsx          # aperçu (code partenaires974)
│
├── modals/
│   ├── ModalTournoi.jsx             # détail tournoi
│   ├── ModalFormTournoi.jsx         # orchestrateur form (111 lignes)
│   └── form/                        # sous-composants form
│       ├── FormAfficheUpload.jsx
│       ├── FormFields.jsx
│       ├── FormSuccess.jsx
│       └── FormDoublonConfirm.jsx
│
└── admin/                           # Espace admin (kevinjuju / kevinjuju974)
    ├── LoginAdmin.jsx
    ├── PanneauAdmin.jsx             # orchestrateur (167 lignes)
    ├── TabPending.jsx
    ├── TabTournois.jsx
    ├── TabSponsors.jsx
    └── TabVisits.jsx
```

## Setup pour un nouveau Supabase

### 1. Variables d'environnement

Crée `.env.local` :

```bash
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

### 2. Base de données

- Crée un nouveau projet sur https://supabase.com
- SQL Editor → New query → colle `supabase/schema.sql` → Run

### 3. Storage

- Storage → New bucket
- Nom : `volleypei`
- Public : ✅
- Les policies storage sont créées par `schema.sql`

### 4. Lancer

```bash
npm install
npm run dev
```

## Identifiants

| Espace | Login | Mot de passe |
|---|---|---|
| Admin | `kevinjuju` | `kevinjuju974` |
| Partenaires (aperçu) | — | `partenaires974` |

## Schéma des données

### `tournois`
- `id` (uuid)
- `nom`, `description`, `date`, `heure`, `ville`, `lieu`
- `telephone`, `email`
- `nom_association`, `numero_identification`, `nombre_joueurs`
- `image_url` (Supabase Storage)
- `latitude`, `longitude` (géocodage automatique)
- `status` (`pending` | `approved` | `rejected`)
- `created_at`

### `sponsors`
- `id` (uuid)
- `nom`, `type` (`gold` | `silver` | `bronze`)
- `image_url`, `lien`, `actif`, `ordre`

### `visites`
- `jour` (PK), `nb`, `updated_at`

## Mobile-first

- Form responsif (grid 2 col → 1 col < 520px)
- Inputs `inputMode` adaptés (tel, email, numeric)
- Upload images compatible iPhone (`accept="image/*"` + HEIC/HEIF)
- CSS injecté une seule fois au root
- Track visite déduplikiqué par jour via `localStorage`
