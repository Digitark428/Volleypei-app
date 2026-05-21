-- ═══════════════════════════════════════════════════════════════════════════
-- VOLLEYPÉI — Schéma Supabase (v7)
-- ═══════════════════════════════════════════════════════════════════════════
-- 👉 À exécuter dans : Supabase Dashboard → SQL Editor → New query → Run
--
-- Architecture minimale (zéro système de comptes) :
--   1. tournois  → publication publique, validation admin (status)
--   2. sponsors  → gérés depuis l'espace admin
--   3. visites   → tracking simple par jour
--   4. storage   → bucket public 'volleypei'
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Table : tournois ──────────────────────────────────────────────────────
create table if not exists tournois (
  id          uuid primary key default uuid_generate_v4(),
  nom         text not null,
  description text not null,
  date        date not null,
  ville       text not null,
  lieu        text not null,
  telephone   text not null,
  email       text not null,
  image_url   text,
  latitude    numeric,
  longitude   numeric,
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);

create index if not exists tournois_status_idx on tournois (status);
create index if not exists tournois_date_idx   on tournois (date);

alter table tournois enable row level security;

-- Lecture publique : tous les tournois (le filtre 'approved' se fait côté front
-- pour la liste publique). Permet aussi à l'admin de voir tous les statuts
-- via la même clé anon (l'admin est protégé par mot de passe front-end).
drop policy if exists "tournois_select_public" on tournois;
create policy "tournois_select_public" on tournois
  for select using (true);

-- Insertion publique : statut forcé à 'pending'
drop policy if exists "tournois_insert_public" on tournois;
create policy "tournois_insert_public" on tournois
  for insert with check (status = 'pending');

-- Update / delete (admin)
drop policy if exists "tournois_update_public" on tournois;
create policy "tournois_update_public" on tournois
  for update using (true);

drop policy if exists "tournois_delete_public" on tournois;
create policy "tournois_delete_public" on tournois
  for delete using (true);

-- ─── Table : sponsors ──────────────────────────────────────────────────────
create table if not exists sponsors (
  id         uuid primary key default uuid_generate_v4(),
  nom        text not null,
  type       text not null check (type in ('gold', 'silver', 'bronze')),
  image_url  text,
  lien       text not null default '',
  actif      boolean not null default true,
  ordre      integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists sponsors_actif_idx on sponsors (actif);
create index if not exists sponsors_type_idx  on sponsors (type);

alter table sponsors enable row level security;

drop policy if exists "sponsors_select_public" on sponsors;
create policy "sponsors_select_public" on sponsors
  for select using (true);

drop policy if exists "sponsors_insert_public" on sponsors;
create policy "sponsors_insert_public" on sponsors
  for insert with check (true);

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

-- ─── Fonction : upsert_visite ─────────────────────────────────────────────
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
-- Crée d'abord le bucket manuellement dans Supabase Dashboard :
--   Storage → New bucket → nom : volleypei → Public ✅
--
-- Puis exécute ces policies :

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
-- ✅ Fin du schéma
-- ═══════════════════════════════════════════════════════════════════════════
