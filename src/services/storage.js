// src/services/storage.js — Upload des images dans Supabase Storage
import { supabase, supabaseConfigured } from '../lib/supabase.js';

const BUCKET   = 'volleypei';
const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo

/**
 * Valide un fichier image AVANT upload.
 * @returns {string|null} message d'erreur ou null si OK
 */
export function validateImage(file) {
  if (!file)                       return "Aucune image sélectionnée.";
  if (file.size > MAX_SIZE)        return `Image trop volumineuse (max ${MAX_SIZE / 1024 / 1024} Mo).`;
  if (!file.type.startsWith('image/')) return "Le fichier doit être une image.";
  return null;
}

/**
 * Génère un nom de fichier unique sans risquer d'extension douteuse.
 */
function makeUniquePath(file, folder = 'tournois') {
  const cleanExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const ext = cleanExt.length > 0 && cleanExt.length <= 5 ? cleanExt : 'jpg';
  const id  = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${folder}/${id}.${ext}`;
}

/**
 * Upload une image et retourne l'URL publique.
 * Lance une exception si erreur.
 */
export async function uploadImage(file, folder = 'tournois') {
  if (!supabaseConfigured) return null;

  const err = validateImage(file);
  if (err) throw new Error(err);

  const path = makeUniquePath(file, folder);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: false,
      contentType: file.type || 'image/jpeg',
      cacheControl: '31536000',
    });

  if (error) throw new Error("Upload échoué : " + error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
