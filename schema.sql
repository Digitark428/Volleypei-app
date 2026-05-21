-- ═══════════════════════════════════════════════════════════════════════════
-- VOLLEYPÉI — Schéma Supabase (v9)
-- ═══════════════════════════════════════════════════════════════════════════
-- 👉 À exécuter dans : Supabase Dashboard → SQL Editor → New query → Run
-- 👉 IDEMPOTENT : tu peux l'exécuter plusieurs fois sans risque.
--
-- ARCHITECTURE MINIMALE :
--   1. tournois   → publication directe, aucune validation admin requise
--   2. sponsors   → gérés depuis l'espace admin
--   3. visites    → tracking simple par jour (upsert atomique)
--   4. storage    → bucket public 'volleypei'
--
-- CHANGEMENTS v9 :
--   - Suppression du champ `status` sur la table tournois
--   - Tout tournoi publié est immédiatement visible dans le calendrier
--   - Suppression des colonnes legacy nom_association / numero_identification
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Table : tournois ──────────────────────────────────────────────────────
create table if not exists tournois (
  id             uuid primary key default uuid_generate_v4(),
  nom            text not null,
  description    text not null,
  date           date not null,
  heure          text not null default '',
  ville          text not null,
  lieu           text not null,
  type           text not null default '',
  telephone      text not null,
  email          text not null,
  nombre_joueurs integer,
  image_url      text,
  latitude       numeric,
  longitude      numeric,
  created_at     timestamptz not null default now()
);

-- Migrations idempotentes si la table existait déjà avec les anciens champs
alter table tournois add column if not exists heure          text    not null default '';
alter table tournois add column if not exists type           text    not null default '';
alter table tournois add column if not exists nombre_joueurs integer;

-- Supprimer la colonne status si elle existe encore (migration de v8 -> v9)
-- Les policies RLS qui filtrent sur status doivent etre supprimees AVANT la colonne,
-- sinon Postgres renvoie "cannot drop column because other objects depend on it".
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'tournois' and column_name = 'status'
  ) then
    -- Drop des policies dependantes en premier
    drop policy if exists "tournois_insert_public" on tournois;
    drop policy if exists "tournois_select_public" on tournois;
    drop policy if exists "tournois_update_public" on tournois;
    drop policy if exists "tournois_delete_public" on tournois;
    -- Maintenant on peut supprimer la colonne sans erreur
    alter table tournois drop column status;
  end if;
end $$;

-- Supprimer les colonnes legacy si elles existent encore
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'tournois' and column_name = 'nom_association'
  ) then
    alter table tournois drop column nom_association;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'tournois' and column_name = 'numero_identification'
  ) then
    alter table tournois drop column numero_identification;
  end if;
end $$;

create index if not exists tournois_date_idx on tournois (date);

alter table tournois enable row level security;

-- Lecture publique — tous les tournois sont visibles
drop policy if exists "tournois_select_public" on tournois;
create policy "tournois_select_public" on tournois
  for select using (true);

-- Insertion publique sans restriction de status
drop policy if exists "tournois_insert_public" on tournois;
create policy "tournois_insert_public" on tournois
  for insert with check (true);

-- Mise à jour (admin uniquement via front)
drop policy if exists "tournois_update_public" on tournois;
create policy "tournois_update_public" on tournois
  for update using (true);

-- Suppression (admin uniquement via front)
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
  status            text not null default 'approved'
                    check (status in ('pending', 'approved', 'rejected')),
  created_at        timestamptz not null default now()
);

alter table sponsors add column if not exists slogan            text  not null default '';
alter table sponsors add column if not exists description_offre text  not null default '';
alter table sponsors add column if not exists images            jsonb not null default '[]'::jsonb;
alter table sponsors add column if not exists status            text  not null default 'approved';

-- Approuver tous les sponsors existants
update sponsors set status = 'approved' where status = 'pending';

create index if not exists sponsors_actif_idx  on sponsors (actif);
create index if not exists sponsors_type_idx   on sponsors (type);
create index if not exists sponsors_status_idx on sponsors (status);

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

-- ─── Fonction : upsert_visite (atomique) ──────────────────────────────────
-- ⚠️ CRITIQUE : cette fonction DOIT exister sinon les stats restent à 0
create or replace function upsert_visite(p_jour date)
returns void
language plpgsql
security definer
as $$
begin
  insert into visites (jour, nb, updated_at)
  values (p_jour, 1, now())
  on conflict (jour)
  do update set
    nb         = visites.nb + 1,
    updated_at = now();
end;
$$;

-- Accorder les permissions à anon ET authenticated
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
-- ✅ Fin du schéma v9
-- ═══════════════════════════════════════════════════════════════════════════
