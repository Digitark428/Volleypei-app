// src/modals/form/FormDoublonConfirm.jsx — Avertissement doublon de date

function FormDoublonConfirm({ count, onCancel, onConfirm }) {
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Date déjà occupée</div>
        <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.5, marginBottom: 16 }}>
          {count} tournoi{count > 1 ? 's existent' : ' existe'} déjà ce jour-là.
          Confirmer la publication&nbsp;?
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Annuler</button>
          <button className="btn btn-w"    onClick={onConfirm} style={{ flex: 1 }}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}

export default FormDoublonConfirm;
