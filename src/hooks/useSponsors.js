// src/hooks/useSponsors.js — Sponsors actifs (publics)
import { useState, useEffect, useCallback } from 'react';
import { fetchActiveSponsors } from '../services/sponsors.js';

export function useSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading]   = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setSponsors(await fetchActiveSponsors());
    } catch (err) {
      console.error('useSponsors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { sponsors, loading, reload };
}
