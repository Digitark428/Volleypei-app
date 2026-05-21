// src/hooks/useTournois.js — Charge les tournois publics (validés)
import { useState, useEffect, useCallback } from 'react';
import { fetchApprovedTournois } from '../services/tournois.js';

export function useTournois() {
  const [tournois, setTournois] = useState([]);
  const [loading, setLoading]   = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTournois(await fetchApprovedTournois());
    } catch (err) {
      console.error('useTournois:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { tournois, loading, reload };
}
