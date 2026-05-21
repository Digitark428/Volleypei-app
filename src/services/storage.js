// src/services/storage.js — Upload des images dans Supabase Storage
import { supabase, supabaseConfigured } from '../lib/supabase.js';

const BUCKET   = 'volleypei';
const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo

// Compression : déclenchée si l'image dépasse l'un de ces seuils
const COMPRESS_MIN_SIZE = 1 * 1024 * 1024; // 1 Mo
const COMPRESS_MAX_DIM  = 1600;            // px (côté le plus long)
const COMPRESS_QUALITY  = 0.82;            // JPEG

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
 * Compresse une image côté navigateur via <canvas>.
 * Best-effort : si la compression échoue ou est plus lourde que l'original,
 * renvoie l'original.
 *
 * @returns {Promise<Blob>}
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

    // Redimensionnement proportionnel
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

    // Si la compression a paradoxalement grossi le fichier (rare, petites images),
    // on garde l'original.
    if (!blob || blob.size >= file.size) return file;
    return blob;
  } catch {
    return file; // best-effort, non bloquant
  }
}

/**
 * Génère un nom de fichier unique sans risquer d'extension douteuse.
 */
function makeUniquePath(extHint, folder = 'tournois') {
  const cleanExt = (extHint || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const ext = cleanExt.length > 0 && cleanExt.length <= 5 ? cleanExt : 'jpg';
  const id  = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${folder}/${id}.${ext}`;
}

/**
 * Upload une image et retourne l'URL publique.
 * Compression best-effort automatique pour les images > 1 Mo ou HEIC/HEIF.
 * Lance une exception si erreur.
 */
export async function uploadImage(file, folder = 'tournois') {
  if (!supabaseConfigured) return null;

  const err = validateImage(file);
  if (err) throw new Error(err);

  // Compression (best-effort, ne casse jamais l'upload)
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

  if (error) throw new Error("Upload échoué : " + error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
