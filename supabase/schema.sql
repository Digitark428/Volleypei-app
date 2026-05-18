-- ═══════════════════════════════════════════════════════════════════════════
-- VOLLEYPÉI — SCHÉMA SUPABASE COMPLET
-- ═══════════════════════════════════════════════════════════════════════════
-- 👉 Colle tout ce fichier dans :
--    Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── EXTENSIONS ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── TABLE : joueurs ────────────────────────────────────────────────────────
create table if not exists joueurs (
  id         uuid primary key default uuid_generate_v4(),
  prenom     text not null,
  nom        text not null,
  email      text not null unique,
  ville      text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists joueurs_email_idx on joueurs (email);

alter table joueurs enable row level security;

create policy "joueurs_select" on joueurs
  for select using (true);

create policy "joueurs_insert" on joueurs
  for insert with check (true);

-- ─── TABLE : adhesions ──────────────────────────────────────────────────────
-- Demandes organisateur avant validation admin
create table if not exists adhesions (
  id           uuid primary key default uuid_generate_v4(),
  prenom       text not null,
  nom          text not null,
  association  text not null,
  email        text not null unique,
  mdp_tmp      text not null default '',  -- effacé après validation
  statut       text not null default 'en_attente', -- en_attente | validee | refusee
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists adhesions_email_idx  on adhesions (email);
create index if not exists adhesions_statut_idx on adhesions (statut);

alter table adhesions enable row level security;

-- Insertion publique (formulaire demande)
create policy "adhesions_insert" on adhesions
  for insert with check (true);

-- Lecture et modification réservées au service_role (Edge Function admin)
create policy "adhesions_service_role" on adhesions
  for all using (auth.role() = 'service_role');

-- ─── TABLE : organisateurs ──────────────────────────────────────────────────
-- Organisateurs validés, liés à auth.users
create table if not exists organisateurs (
  id           uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users (id) on delete cascade,
  prenom       text not null,
  nom          text not null,
  association  text not null,
  email        text not null unique,
  ville        text not null default '',
  created_at   timestamptz not null default now()
);

create index if not exists organisateurs_email_idx on organisateurs (email);

alter table organisateurs enable row level security;

-- Un organisateur lit son propre profil
create policy "organisateurs_select_own" on organisateurs
  for select using (
    auth.uid() = auth_user_id
    or auth.role() = 'service_role'
  );

-- ─── TABLE : tournois ───────────────────────────────────────────────────────
create table if not exists tournois (
  id           uuid primary key default uuid_generate_v4(),
  nom          text not null,
  date         date not null,
  heure        text,
  lieu         text not null,
  ville        text not null default '',
  type         text not null default 'Beach Volley',
  joueurs      integer not null default 0,
  contact      text not null,
  organisateur text not null,
  description  text not null default '',
  affiche_url  text,                       -- URL Supabase Storage
  lat          double precision,
  lng          double precision,
  created_by   text not null default '',   -- email organisateur
  created_at   timestamptz not null default now()
);

create index if not exists tournois_date_idx on tournois (date);

alter table tournois enable row level security;

-- Lecture publique
create policy "tournois_select" on tournois
  for select using (true);

-- Insertion pour les organisateurs authentifiés
create policy "tournois_insert" on tournois
  for insert with check (
    auth.role() = 'authenticated'
    or auth.role() = 'service_role'
  );

-- Suppression par le créateur ou service_role
create policy "tournois_delete" on tournois
  for delete using (
    created_by = (
      select email from auth.users where id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

-- ─── STORAGE : bucket volleypei ─────────────────────────────────────────────
-- Si l'INSERT échoue (bucket déjà existant), ignore l'erreur.
insert into storage.buckets (id, name, public)
  values ('volleypei', 'volleypei', true)
  on conflict (id) do nothing;

create policy "storage_insert_auth" on storage.objects
  for insert with check (
    bucket_id = 'volleypei'
    and auth.role() = 'authenticated'
  );

create policy "storage_select_public" on storage.objects
  for select using (bucket_id = 'volleypei');
