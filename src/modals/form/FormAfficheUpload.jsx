// src/modals/form/FormAfficheUpload.jsx — Zone d'upload de l'affiche

function FormAfficheUpload({ preview, onPick, onClear }) {
  if (preview) {
    return (
      <div style={{ position: 'relative', borderRadius: 11, overflow: 'hidden', border: '1px solid var(--b1)' }}>
        <img src={preview} alt="" style={{ width: '100%', maxHeight: 170, objectFit: 'cover' }} />
        <button
          onClick={onClear}
          aria-label="Supprimer l'image"
          style={{
            position: 'absolute', top: 7, right: 7,
            background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white',
            borderRadius: '50%', width: 26, height: 26, cursor: 'pointer',
            fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>
      </div>
    );
  }

  return (
    <label className="upzone" style={{ height: 90 }}>
      <span style={{ fontSize: 22 }}>🖼️</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue2)' }}>Choisir l'affiche</span>
      <span style={{ fontSize: 10, color: 'var(--t3)' }}>Max 8 Mo · obligatoire</span>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => onPick(e.target.files?.[0])}
      />
    </label>
  );
}

export default FormAfficheUpload;
