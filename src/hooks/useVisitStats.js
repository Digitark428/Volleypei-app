// src/hooks/useVisitStats.js — Track + fetch des stats de visites
import { useState, useEffect } from 'react';
import { fetchVisitStats, trackVisit } from '../services/stats.js';

export function useVisitStats(nbJours = 30) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    trackVisit().catch(() => {});
    fetchVisitStats(nbJours)
      .then(setStats)
      .catch(() => setStats({ total: 0, moyenne: 0, moyenne_semaine: 0, jours: [] }));
  }, [nbJours]);

  return stats;
}
