-- =====================================================
-- MIGRATION : Compteur de vues sur les tournois
-- À exécuter dans le SQL Editor Supabase
-- =====================================================

-- 1. Ajouter la colonne views_count
alter table public.tournaments
  add column if not exists views_count integer not null default 0;

-- 2. Fonction RPC pour incrémenter atomiquement (évite les conflits de concurrence)
create or replace function public.increment_tournament_views(tournament_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  new_count integer;
begin
  update public.tournaments
  set views_count = views_count + 1
  where id = tournament_id
  returning views_count into new_count;

  return new_count;
end;
$$;

-- 3. Permettre à n'importe qui d'appeler la fonction (lecture/incrémentation publiques)
grant execute on function public.increment_tournament_views(uuid) to anon, authenticated;

-- 4. Index pour les requêtes tri par popularité (optionnel mais propre)
create index if not exists tournaments_views_idx on public.tournaments(views_count desc);
