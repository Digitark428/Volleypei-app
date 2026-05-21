// src/hooks/useTournoiForm.js — État + validation + soumission du formulaire tournoi.
// Sépare totalement la logique du composant UI (ModalFormTournoi).
import { useState, useCallback } from 'react';
import { createTournoi, geocode, validateImage } from '../services/index.js';

const INITIAL_FORM = {
  nom: '',
  description: '',
  date: '',
  ville: '',
  lieu: '',
  telephone: '',
  email: '',
  image: null,        // dataURL pour preview locale
  latitude: null,
  longitude: null,
};

/**
 * Validation pure (sans side-effects).
 * Retourne le 1er message d'erreur ou null si tout est OK.
 */
function validateForm(form, imageFile) {
  if (!form.nom.trim())           return "Le nom du tournoi est obligatoire.";
  if (!form.date)                 return "La date est obligatoire.";
  if (!form.lieu.trim())          return "Le lieu est obligatoire.";
  if (!form.ville.trim())         return "La ville est obligatoire.";
  if (!form.description.trim())   return "La description est obligatoire.";

  if (!form.telephone.trim())     return "Le numéro de téléphone est obligatoire.";
  const digits = form.telephone.replace(/\D/g, '');
  if (digits.length < 8)          return "Le numéro doit être un vrai téléphone (≥ 8 chiffres).";

  if (!form.email.trim() || !form.email.includes('@')) {
    return "L'email est obligatoire et doit être valide.";
  }
  if (!imageFile)                 return "L'affiche de l'événement est obligatoire.";
  return null;
}

/**
 * Hook principal du formulaire de publication.
 *
 * @param {string|null} initialDate - Date pré-remplie (ISO YYYY-MM-DD) ou null.
 * @returns API du formulaire : state, setters, validation, submit.
 */
export function useTournoiForm(initialDate) {
  const [form, setForm]         = useState({ ...INITIAL_FORM, date: initialDate || '' });
  const [imageFile, setImageFile] = useState(null);
  const [err, setErr]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Met à jour un champ unique
  const updateField = useCallback((key, value) => {
    setForm(f => ({ ...f, [key]: value }));
  }, []);

  // Définit l'image (file + preview)
  const setImage = useCallback((file) => {
    if (!file) {
      setImageFile(null);
      setForm(f => ({ ...f, image: null }));
      return;
    }
    const e = validateImage(file);
    if (e) { setErr(e); return; }
    setErr('');
    setImageFile(file);

    const reader = new FileReader();
    reader.onload  = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.onerror = () => setErr("Impossible de lire l'image.");
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => setImage(null), [setImage]);

  /**
   * Soumet le tournoi à Supabase :
   *   1. validation front
   *   2. géocodage best-effort
   *   3. createTournoi (upload image + insert SQL)
   *
   * Retourne le tournoi créé en cas de succès.
   * Lance une exception en cas d'échec.
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
      // Géocodage best-effort
      let { latitude, longitude } = form;
      if ((!latitude || !longitude) && form.lieu && form.ville) {
        const coords = await geocode(form.lieu, form.ville);
        if (coords) { latitude = coords.latitude; longitude = coords.longitude; }
      }

      return await createTournoi({ ...form, latitude, longitude }, imageFile);
    } catch (e) {
      const msg = "Erreur : " + (e.message || 'inconnue');
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
