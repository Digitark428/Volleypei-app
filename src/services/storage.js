// src/services/storage.js — Upload des images dans Supabase Storage
//
// PIPELINE :
//   1. validateImage()  → vérifications dures (taille, type)
//   2. compressImage()  → best-effort canvas (downscale + JPEG 0.82)
//   3. upload bucket    → 'volleypei' (public)
//   4. getPublicUrl()   → URL pérenne, exposée au front
//
// SÉCURITÉ :
//   - Pas de path traversal possible (id généré côté front, extension nettoyée)
//   - Cache-control 1 an (les fichiers ont un id unique → aucun risque de stale)
//   - Si compression rate ou alourdit, on garde l'original (jamais bloquant)

import { supabase, supabaseConfigured } from '../lib/supabase.js';

const BUCKET   = 'volleypei';
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo (aligné avec la consigne formulaire)

// Compression : déclenchée si l'image dépasse l'un de ces seuils
const COMPRESS_MIN_SIZE = 1 * 1024 * 1024; // 1 Mo
const COMPRESS_MAX_DIM  = 1600;            // px (côté le plus long)
const COMPRESS_QUALITY  = 0.82;            // JPEG

/**
 * Valide un fichier image AVANT upload.
 * @returns {string|null} message d'erreur ou null si OK
 */
export function validateImage(file) {
  if (!file)                            return "Aucune image sélectionnée.";
  if (file.size > MAX_SIZE)             return `Image trop volumineuse (max ${MAX_SIZE / 1024 / 1024} Mo).`;
  if (!file.type.startsWith('image/'))  return "Le fichier doit être une image.";
  return null;
}

/**
 * Compresse une image côté navigateur via <canvas>.
 * Best-effort : si la compression échoue ou est plus lourde que l'original, renvoie l'original.
 */
async function compressImage(file) {
  // Pas de compression nécessaire si déjà légère ET pas un format exotique
  if (file.size < COMPRESS_MIN_SIZE && !/heic|heif/i.test(file.type)) {
    return file;
  }
  if (typeof document === 'undefined') return file; // SSR safety

  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('read'));
      reader.readAsDataURL(file);
    });

    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload  = () => resolve(i);
      i.onerror = () => reject(new Error('decode'));
      i.src     = dataUrl;
    });

    let { width, height } = img;
    if (width > COMPRESS_MAX_DIM || height > COMPRESS_MAX_DIM) {
      const ratio = Math.min(COMPRESS_MAX_DIM / width, COMPRESS_MAX_DIM / height);
      width  = Math.round(width  * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width  = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', COMPRESS_QUALITY)
    );

    if (!blob || blob.size >= file.size) return file;
    return blob;
  } catch {
    return file;
  }
}

/** Génère un nom de fichier unique sans risque d'extension douteuse. */
function makeUniquePath(extHint, folder = 'tournois') {
  const cleanExt = (extHint || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const ext = cleanExt.length > 0 && cleanExt.length <= 5 ? cleanExt : 'jpg';
  const id  = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${folder}/${id}.${ext}`;
}

/**
 * Upload une image et retourne l'URL publique.
 * Compression best-effort automatique pour les images > 1 Mo ou HEIC/HEIF.
 * Lance une exception en cas d'erreur.
 */
export async function uploadImage(file, folder = 'tournois') {
  if (!supabaseConfigured) {
    // Mode dev sans Supabase : on génère un blob URL local (utile pour preview)
    if (typeof URL !== 'undefined' && file) return URL.createObjectURL(file);
    return null;
  }

  const err = validateImage(file);
  if (err) throw new Error(err);

  const blob = await compressImage(file);

  // Si on a re-encodé en JPEG, l'extension change
  const isCompressed = blob !== file && blob.type === 'image/jpeg';
  const extHint      = isCompressed
    ? 'jpg'
    : (file.name.split('.').pop() || 'jpg');
  const contentType  = isCompressed
    ? 'image/jpeg'
    : (file.type || 'image/jpeg');

  const path = makeUniquePath(extHint, folder);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      upsert: false,
      contentType,
      cacheControl: '31536000',
    });

  if (error) {
    // Erreur fréquente : bucket inexistant ou policy manquante
    if (/bucket/i.test(error.message || '')) {
      throw new Error(
        "Bucket Storage introuvable. Crée le bucket 'volleypei' dans Supabase " +
        "(Storage → New bucket → Public) puis exécute le schema.sql."
      );
    }
    throw new Error("Upload échoué : " + error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Impossible d'obtenir l'URL publique de l'image.");
  }
  return data.publicUrl;
}

/**
 * Supprime une image du bucket à partir de son URL publique.
 * Best-effort : ne lance pas en cas d'échec (fichier déjà absent, etc.).
 */
export async function deleteImage(publicUrl) {
  if (!supabaseConfigured || !publicUrl) return;
  try {
    // Extrait le path depuis l'URL publique
    // Forme : https://<project>.supabase.co/storage/v1/object/public/volleypei/<folder>/<file>
    const marker = `/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx < 0) return;
    const path = publicUrl.slice(idx + marker.length);
    await supabase.storage.from(BUCKET).remove([path]);
  } catch (e) {
    console.warn('deleteImage: non bloquant', e?.message);
  }
}
