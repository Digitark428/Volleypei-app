// src/hooks/useTournois.js — Charge tous les tournois (publication directe)
import { useState, useEffect, useCallback } from 'react';
import { fetchTournois } from '../services/tournois.js';

export function useTournois() {
  const [tournois, setTournois] = useState([]);
  const [loading, setLoading]   = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTournois(await fetchTournois());
    } catch (err) {
      console.error('useTournois:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { tournois, loading, reload };
}
