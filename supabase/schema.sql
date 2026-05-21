-- ═══════════════════════════════════════════════════════════════════════════
-- VOLLEYPÉI — Schéma Supabase (v8)
-- ═══════════════════════════════════════════════════════════════════════════
-- 👉 À exécuter dans : Supabase Dashboard → SQL Editor → New query → Run
-- 👉 IDEMPOTENT : tu peux l'exécuter plusieurs fois sans risque.
--
-- ARCHITECTURE MINIMALE (zéro système de comptes) :
--   1. tournois   → publication publique, validation admin via `status`
--   2. sponsors   → gérés depuis l'espace admin
--   3. visites    → tracking simple par jour (upsert atomique)
--   4. storage    → bucket public 'volleypei'
--
-- CHANGEMENTS v8 :
--   - Ajout de `type` (Beach / Salle / Mixte / ...) sur tournois
--   - Les colonnes `nom_association` et `numero_identification` restent en BDD
--     pour rétro-compat des anciennes données — elles ne sont plus collectées
--     par le formulaire public (champ optionnel default '').
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Table : tournois ──────────────────────────────────────────────────────
create table if not exists tournois (
  id                    uuid primary key default uuid_generate_v4(),
  nom                   text not null,
  description           text not null,
  date                  date not null,
  heure                 text not null default '',
  ville                 text not null,
  lieu                  text not null,
  type                  text not null default '',
  telephone             text not null,
  email                 text not null,
  nom_association       text not null default '',  -- legacy, plus collecté
  numero_identification text not null default '',  -- legacy, plus collecté
  nombre_joueurs        integer,
  image_url             text,
  latitude              numeric,
  longitude             numeric,
  status                text not null default 'pending'
                        check (status in ('pending', 'approved', 'rejected')),
  created_at            timestamptz not null default now()
);

-- Migrations idempotentes : ajoute les colonnes si la table existait déjà
alter table tournois add column if not exists heure                 text    not null default '';
alter table tournois add column if not exists type                  text    not null default '';
alter table tournois add column if not exists nom_association       text    not null default '';
alter table tournois add column if not exists numero_identification text    not null default '';
alter table tournois add column if not exists nombre_joueurs        integer;

create index if not exists tournois_status_idx on tournois (status);
create index if not exists tournois_date_idx   on tournois (date);

alter table tournois enable row level security;

-- Lecture publique (le filtre 'approved' se fait côté front pour la liste publique).
-- L'admin utilise la même clé anon — la protection se fait par mot de passe front.
drop policy if exists "tournois_select_public" on tournois;
create policy "tournois_select_public" on tournois
  for select using (true);

-- ⚠️ CRITIQUE : insertion publique avec status='pending' obligatoire.
-- Si cette policy manque, AUCUN tournoi ne remonte dans l'admin.
drop policy if exists "tournois_insert_public" on tournois;
create policy "tournois_insert_public" on tournois
  for insert with check (status = 'pending');

drop policy if exists "tournois_update_public" on tournois;
create policy "tournois_update_public" on tournois
  for update using (true);

drop policy if exists "tournois_delete_public" on tournois;
create policy "tournois_delete_public" on tournois
  for delete using (true);

-- ─── Table : sponsors ──────────────────────────────────────────────────────
create table if not exists sponsors (
  id                uuid primary key default uuid_generate_v4(),
  nom               text not null,
  type              text not null check (type in ('gold', 'silver', 'bronze')),
  slogan            text not null default '',
  description_offre text not null default '',
  image_url         text,
  images            jsonb not null default '[]'::jsonb,
  lien              text not null default '',
  actif             boolean not null default true,
  ordre             integer not null default 0,
  status            text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected')),
  created_at        timestamptz not null default now()
);

alter table sponsors add column if not exists slogan            text  not null default '';
alter table sponsors add column if not exists description_offre text  not null default '';
alter table sponsors add column if not exists images            jsonb not null default '[]'::jsonb;
alter table sponsors add column if not exists status            text  not null default 'pending';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sponsors_status_check'
  ) then
    alter table sponsors
      add constraint sponsors_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

-- Sponsors anciens : approuvés par défaut
update sponsors set status = 'approved' where status = 'pending' and created_at < now() - interval '1 minute';

create index if not exists sponsors_actif_idx  on sponsors (actif);
create index if not exists sponsors_type_idx   on sponsors (type);
create index if not exists sponsors_status_idx on sponsors (status);

alter table sponsors enable row level security;

drop policy if exists "sponsors_select_public" on sponsors;
create policy "sponsors_select_public" on sponsors
  for select using (true);

drop policy if exists "sponsors_insert_public" on sponsors;
create policy "sponsors_insert_public" on sponsors
  for insert with check (status = 'pending');

drop policy if exists "sponsors_update_public" on sponsors;
create policy "sponsors_update_public" on sponsors
  for update using (true);

drop policy if exists "sponsors_delete_public" on sponsors;
create policy "sponsors_delete_public" on sponsors
  for delete using (true);

-- ─── Table : visites ───────────────────────────────────────────────────────
create table if not exists visites (
  jour       date primary key,
  nb         integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table visites enable row level security;

drop policy if exists "visites_select_public" on visites;
create policy "visites_select_public" on visites
  for select using (true);

drop policy if exists "visites_insert_public" on visites;
create policy "visites_insert_public" on visites
  for insert with check (true);

drop policy if exists "visites_update_public" on visites;
create policy "visites_update_public" on visites
  for update using (true);

-- ─── Fonction : upsert_visite (atomique) ──────────────────────────────────
create or replace function upsert_visite(p_jour date)
returns void
language plpgsql
security definer
as $$
begin
  insert into visites (jour, nb)
  values (p_jour, 1)
  on conflict (jour)
  do update set nb = visites.nb + 1, updated_at = now();
end;
$$;

grant execute on function upsert_visite(date) to anon, authenticated;

-- ─── Storage : bucket 'volleypei' ──────────────────────────────────────────
-- ⚠️ Crée d'abord le bucket manuellement :
--   Storage → New bucket → nom : volleypei → Public ✅

drop policy if exists "storage_insert_public" on storage.objects;
create policy "storage_insert_public" on storage.objects
  for insert with check (bucket_id = 'volleypei');

drop policy if exists "storage_select_public" on storage.objects;
create policy "storage_select_public" on storage.objects
  for select using (bucket_id = 'volleypei');

drop policy if exists "storage_delete_public" on storage.objects;
create policy "storage_delete_public" on storage.objects
  for delete using (bucket_id = 'volleypei');

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ Fin du schéma v8
-- ═══════════════════════════════════════════════════════════════════════════
