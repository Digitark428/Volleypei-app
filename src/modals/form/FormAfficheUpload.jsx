// src/modals/form/FormAfficheUpload.jsx — Zone d'upload de l'affiche
//
// CONSIGNES VISIBLES :
//   - Format recommandé : vertical 1080×1350
//   - JPG ou PNG
//   - < 5 Mo
//   - Image nette et lisible
//
// ERREURS BLOQUANTES (validées AVANT upload) :
//   - Fichier > 5 Mo → erreur affichée localement
//   - Type non-image → erreur affichée localement
//   - Formats refusés explicitement (HEIC/HEIF non rendus par iOS Safari sur d'autres
//     appareils) → conversion tentée automatiquement par le pipeline de compression.

import { useState } from 'react';

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ACCEPTED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

function localValidate(file) {
  if (!file) return "Aucun fichier sélectionné.";
  if (file.size > MAX_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `Image trop volumineuse (${mb} Mo). Maximum : ${MAX_MB} Mo.`;
  }
  if (!file.type.startsWith('image/')) {
    return "Le fichier doit être une image (JPG, PNG ou WebP).";
  }
  // On accepte HEIC/HEIF (iPhone par défaut) : la compression côté front les ré-encodera en JPEG
  if (!ACCEPTED_MIME.includes(file.type) && !file.type.startsWith('image/')) {
    return "Format non supporté. Utilise JPG, PNG ou WebP.";
  }
  return null;
}

function GuidanceBox() {
  return (
    <div style={{
      background: 'rgba(0,102,204,0.05)',
      border: '1px solid rgba(0,102,204,0.15)',
      borderRadius: 10, padding: '10px 12px',
      fontSize: 11, lineHeight: 1.6, color: 'var(--t2)',
      marginBottom: 8,
    }}>
      <div style={{ fontWeight: 600, color: 'var(--blue)', marginBottom: 4, fontSize: 11 }}>
        📐 Format recommandé
      </div>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        <li>Vertical <strong>1080 × 1350</strong> px</li>
        <li>JPG ou PNG</li>
        <li>Moins de {MAX_MB} Mo</li>
        <li>Image nette et lisible</li>
      </ul>
    </div>
  );
}

function FormAfficheUpload({ preview, onPick, onClear }) {
  const [localErr, setLocalErr] = useState('');

  function handlePick(file) {
    setLocalErr('');
    if (!file) return;
    const err = localValidate(file);
    if (err) { setLocalErr(err); return; }
    onPick(file);
  }

  if (preview) {
    return (
      <>
        <GuidanceBox />
        <div style={{ position: 'relative', borderRadius: 11, overflow: 'hidden', border: '1px solid var(--b1)' }}>
          <img src={preview} alt="Aperçu de l'affiche" style={{ width: '100%', maxHeight: 240, objectFit: 'contain', background: '#f5f5f7', display: 'block' }} />
          <button
            onClick={onClear}
            aria-label="Supprimer l'image"
            style={{
              position: 'absolute', top: 7, right: 7,
              background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
              borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
              fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>
      </>
    );
  }

  return (
    <>
      <GuidanceBox />
      {localErr && (
        <div className="err-box" style={{ marginBottom: 8 }}>
          {localErr}
        </div>
      )}
      <label className="upzone" style={{ minHeight: 96 }}>
        <span style={{ fontSize: 22 }}>🖼️</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue2)' }}>Choisir une affiche</span>
        <span style={{ fontSize: 10, color: 'var(--t3)' }}>
          Touche pour parcourir · max {MAX_MB} Mo
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          style={{ display: 'none' }}
          onChange={e => handlePick(e.target.files?.[0])}
        />
      </label>
    </>
  );
}

export default FormAfficheUpload;
