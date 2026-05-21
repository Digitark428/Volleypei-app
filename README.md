# VolleyPéi — v9

Application PWA de calendrier de tournois de volleyball à La Réunion.

## ✅ Changements v9

### Publication directe des tournois
- **Plus de validation admin** : tout tournoi publié est immédiatement visible dans le calendrier public.
- Suppression complète du système `pending / approved / rejected` sur la table `tournois`.
- L'onglet "En attente" a été retiré de l'espace admin.

### Admin simplifié
L'espace admin permet uniquement :
- **Supprimer** un tournoi
- **Gérer les sponsors** (CRUD complet)
- **Voir les statistiques** de visites

### Statistiques visites corrigées
- Meilleure gestion des erreurs avec messages de diagnostic.
- La fonction SQL `upsert_visite` est incluse dans le schéma — vérifier qu'elle est bien exécutée.

---

## 🚀 Setup Supabase

### 1. Créer le projet Supabase
→ [supabase.com](https://supabase.com) → New project

### 2. Créer le bucket Storage
- Storage → New bucket → nom : `volleypei` → **Public** ✅

### 3. Exécuter le schéma SQL
- SQL Editor → New query → coller `supabase/schema.sql` → Run

### 4. Variables d'environnement Vercel
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🔧 Développement local

```bash
npm install
cp .env.example .env.local
# Remplir les variables dans .env.local
npm run dev
```

---

## 🏐 Fonctionnement

### Calendrier public
1. L'utilisateur clique **"+ Publier un tournoi"**
2. Remplit le formulaire + upload affiche
3. Valide → le tournoi apparaît **immédiatement** dans le calendrier

### Espace admin (`/admin`)
- Login : `kevinjuju` / `kevinjuju974`
- Supprimer des tournois
- Gérer les sponsors (ajouter, modifier, activer/désactiver)
- Voir les statistiques de visites

---

## 📊 Diagnostic stats visites = 0

Si les visites restent à 0 :
1. Vérifier que la fonction SQL `upsert_visite` existe :
   ```sql
   select proname from pg_proc where proname = 'upsert_visite';
   ```
2. La recréer si nécessaire en réexécutant `schema.sql`
3. Vérifier les permissions :
   ```sql
   grant execute on function upsert_visite(date) to anon, authenticated;
   ```
4. Tester manuellement :
   ```sql
   select upsert_visite(current_date);
   select * from visites;
   ```
