// src/services/geocoding.js — Géocodage best-effort via Nominatim (OpenStreetMap)
// Aucun service payant. Si échec → on continue sans coordonnées.

/**
 * Convertit "lieu, ville" en {lat, lng}.
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function geocode(lieu, ville) {
  if (!lieu || !ville) return null;
  try {
    const q = encodeURIComponent(`${lieu}, ${ville}, La Réunion`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&countrycodes=re`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.length > 0) {
      return {
        latitude:  parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch {
    // Non bloquant
  }
  return null;
}
