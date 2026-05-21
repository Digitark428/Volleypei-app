// src/hooks/useTournoiForm.js — État + validation + soumission du formulaire tournoi
//
// v9 — Publication directe : plus de pending/status.
//      Le tournoi est visible immédiatement après soumission.

import { useState, useCallback } from 'react';
import { createTournoi, geocode, validateImage } from '../services/index.js';

const INITIAL_FORM = {
  nom: '',
  description: '',
  date: '',
  heure: '',
  ville: '',
  lieu: '',
  type: '',
  telephone: '',
  email: '',
  nombre_joueurs: '',
  image: null,
  latitude: null,
  longitude: null,
};

/** Validation pure (sans side-effects). Renvoie le 1er message ou null si OK. */
function validateForm(form, imageFile) {
  if (!form.nom.trim())                  return 'Le nom du tournoi est obligatoire.';
  if (!form.date)                        return 'La date est obligatoire.';
  if (!form.heure || !form.heure.trim()) return "L'heure est obligatoire.";
  if (!form.lieu.trim())                 return 'Le lieu est obligatoire.';
  if (!form.ville.trim())                return 'La ville est obligatoire.';
  if (!form.type || !form.type.trim())   return 'Le type de tournoi est obligatoire.';
  if (!form.description.trim())          return 'La description est obligatoire.';

  if (!form.telephone.trim())            return 'Le numéro de téléphone est obligatoire.';
  const digits = form.telephone.replace(/\D/g, '');
  if (digits.length < 8)                 return 'Le numéro doit être un vrai téléphone (≥ 8 chiffres).';

  if (!form.email.trim() || !form.email.includes('@')) {
    return "L'email est obligatoire et doit être valide.";
  }

  const nbJ = parseInt(form.nombre_joueurs, 10);
  if (!form.nombre_joueurs || isNaN(nbJ) || nbJ <= 0) {
    return 'Le nombre de joueurs est obligatoire (entier positif).';
  }

  if (!imageFile) return "L'affiche de l'événement est obligatoire.";
  return null;
}

/**
 * Hook principal du formulaire de publication.
 *
 * @param {string|null} initialDate - Date pré-remplie (ISO YYYY-MM-DD) ou null.
 */
export function useTournoiForm(initialDate) {
  const [form, setForm]             = useState({ ...INITIAL_FORM, date: initialDate || '' });
  const [imageFile, setImageFileSt] = useState(null);
  const [err, setErr]               = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback((key, value) => {
    setForm(f => ({ ...f, [key]: value }));
  }, []);

  const setImage = useCallback((file) => {
    if (!file) {
      setImageFileSt(null);
      setForm(f => ({ ...f, image: null }));
      return;
    }
    const e = validateImage(file);
    if (e) { setErr(e); return; }
    setErr('');
    setImageFileSt(file);

    const reader = new FileReader();
    reader.onload  = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.onerror = () => setErr("Impossible de lire l'image.");
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => setImage(null), [setImage]);

  /**
   * Soumet le tournoi à Supabase et le publie immédiatement.
   *   1. Validation front
   *   2. Géocodage best-effort
   *   3. createTournoi (upload image + insert SQL)
   */
  const submit = useCallback(async () => {
    const validationErr = validateForm(form, imageFile);
    if (validationErr) {
      setErr(validationErr);
      throw new Error(validationErr);
    }

    setSubmitting(true);
    setErr('');
    try {
      let { latitude, longitude } = form;
      if ((!latitude || !longitude) && form.lieu && form.ville) {
        const coords = await geocode(form.lieu, form.ville);
        if (coords) { latitude = coords.latitude; longitude = coords.longitude; }
      }

      return await createTournoi({
        ...form,
        nombre_joueurs: parseInt(form.nombre_joueurs, 10),
        latitude,
        longitude,
      }, imageFile);
    } catch (e) {
      const msg = 'Erreur : ' + (e.message || 'inconnue');
      setErr(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [form, imageFile]);

  return {
    form,
    imageFile,
    err,
    submitting,
    updateField,
    setImage,
    clearImage,
    setErr,
    submit,
  };
}
