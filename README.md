# VolleyPéi v8 — Notes de version

## Ce qui a été corrigé

### 1. Bug iOS PWA (encoche / Dynamic Island)
- `index.html` : `viewport-fit=cover`, `apple-mobile-web-app-status-bar-style=default` (au lieu de `black-translucent`, qui était la cause du header coupé), pré-style critique pour éviter le flash.
- `public/manifest.webmanifest` + `public/apple-touch-icon.png` + `public/favicon.svg` ajoutés.
- `src/lib/styles.js` : variables CSS `--safe-top/-bottom/-left/-right`, navbar étendue à `nav-h + safe-top`, `.page` / `.adm-page` / `.intro-page` paddées par safe-area, modales aussi. `100dvh` au lieu de `100vh`. `.field` à 16px (empêche le zoom iOS).

### 2. Tournois non reçus dans l'admin
- Le code (createTournoi → fetchPendingTournois → TabPending) est OK ; la cause la plus probable était que **le schéma SQL n'avait pas été ré-exécuté en production**, donc les policies RLS étaient incomplètes.
- `supabase/schema.sql` mis à jour (v8) : idempotent, commenté, à ré-exécuter pour être sûr.

### 3. Session admin persistante
- Nouveau hook `src/hooks/useAdminSession.js` : versionné, multi-onglets (storage event), init synchrone (pas de flash).
- `App.jsx` restaure l'admin au reload.
- `PanneauAdmin.jsx` : bouton "Déconnexion" explicite (le seul moyen de couper la session).

### 4. Statistiques connectées et fiables
- `src/services/stats.js` réécrit : dédup par clé localStorage datée (`volleypei_visit_YYYY-MM-DD`), retry 1× sur échec, nettoyage auto des vieilles clés.
- `fetchVisitStats` retourne désormais `total_global` (cumul historique) en plus de la fenêtre 30j.
- `TabVisits.jsx` affiche le total global en première position.
- `StatsPills.jsx` (calendrier public) utilise `total_global`.

### 5. Formulaire simplifié
- Retiré : `nom_association`, `numero_identification`.
- Ajouté : `type` (Beach / Salle / Mixte / 4×4 / 6×6 / Jeune / Amical / Autre).
- Schéma SQL : colonnes legacy conservées (default '') pour rétro-compat des anciens tournois — peuvent être DROP plus tard.
- `useTournoiForm.js` + `services/tournois.js` + `TabPending.jsx` alignés.

### 6. Consignes format image
- `FormAfficheUpload.jsx` : encadré bleu visible « Format recommandé : vertical 1080×1350 · JPG ou PNG · < 5 Mo · image nette ».
- Validation locale stricte (< 5 Mo, type image/*), message d'erreur clair en cas de dépassement.
- Compression auto déjà active dans `services/storage.js` (canvas → JPEG 0.82, max 1600px côté long).

### 7. Storage vérifié
- `services/storage.js` : MAX_SIZE aligné à 5 Mo, message d'erreur explicite si le bucket n'existe pas, vérification que `publicUrl` est bien généré.
- Nouvelle fonction `deleteImage(url)` (best-effort).
- `deleteTournoi(id)` purge maintenant l'affiche du Storage.

### 8. Responsive mobile
- Voir #1 (CSS safe-area, dvh, font-size 16px).
- `TabTournois.jsx` : bouton supprimer toujours visible sur mobile (avant : caché dans la colonne `.hc`).
- `ModalTournoi.jsx` : `word-break`, liens `tel:` / `mailto:` natifs, type tag visible.
- `TournoiCard.jsx` : tag type + nombre de joueurs, `loading="lazy"` sur l'image.

### 9. Sponsors
- `SponsorSlots.jsx` durci : si `sponsors` est vide ET pas en mode aperçu, les composants Gold/Silver/Bronze renvoient `null` (aucun placeholder visible sur la home publique).
- Le mode aperçu (page Partenaires, `showEmpty=true`) reste inchangé.

### 10. Audit technique
- `App.jsx` réécrit avec `useAdminSession` + onLogout explicite.
- `NavBar.jsx` : badge "Admin ✓" si session active, `minWidth: 0` pour éviter les débordements.
- `PagePartenaires.jsx` : refonte du padding pour cohérence safe-area.
- `supabase.js` : client configuré avec `persistSession: false` (cohérent avec le système sans comptes Supabase), check `supabaseConfigured` plus strict.
- Imports inutilisés retirés (ex. `LOGO_B64` dans LoginAdmin).
- 44 fichiers source vérifiés syntaxiquement avec esbuild → 0 erreur.
- Tous les imports relatifs résolvent → 0 erreur.

---

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
│   ├── PageCarte.jsx                # carte Leaflet + markers cliquables
│   └── PagePartenaires.jsx          # aperçu (code partenaires974)
│
├── modals/
│   ├── ModalTournoi.jsx             # détail tournoi
│   ├── ModalSponsor.jsx             # détail sponsor + galerie carousel
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
- `slogan`, `description_offre`
- `image_url` (photo principale, compat. historique)
- `images` (jsonb array d'URLs — galerie)
- `lien`, `actif`, `ordre`
- `status` (`pending` | `approved` | `rejected`)
- `created_at`

### `visites`
- `jour` (PK), `nb`, `updated_at`

## Mobile-first

- Form responsif (grid 2 col → 1 col < 520px)
- Inputs `inputMode` adaptés (tel, email, numeric)
- Upload images compatible iPhone (`accept="image/*"` + HEIC/HEIF)
- CSS injecté une seule fois au root
- Track visite déduplikiqué par jour via `localStorage`
