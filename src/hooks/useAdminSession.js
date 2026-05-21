// src/hooks/useAdminSession.js — Persistance de la session admin
//
// FONCTIONNEMENT :
//   - Au mount, on lit localStorage pour savoir si l'admin était connecté.
//   - login() : marque la session active (et persiste).
//   - logout() : nettoie la session.
//   - La clé est versionnée pour permettre une invalidation côté code si besoin.
//   - Côté sécurité : c'est un simple flag client. La vraie protection passe
//     par les policies Supabase (qui ne lisent pas ce flag). C'est cohérent
//     avec le système simplifié "sans comptes" demandé.

import { useState, useCallback, useEffect } from 'react';

const KEY     = 'volleypei_admin_session';
const VERSION = 'v1'; // bumper en cas de changement de contrat

export function useAdminSession() {
  // Initialisation synchrone (évite un flash "non connecté" au mount)
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      if (typeof localStorage === 'undefined') return false;
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed?.v === VERSION && parsed?.active === true;
    } catch {
      return false;
    }
  });

  // Synchronisation multi-onglets (si l'admin se déconnecte ailleurs, on suit)
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== KEY) return;
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : null;
        setIsAdmin(parsed?.v === VERSION && parsed?.active === true);
      } catch {
        setIsAdmin(false);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: VERSION, active: true, at: Date.now() }));
    } catch {}
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setIsAdmin(false);
  }, []);

  return { isAdmin, login, logout };
}
