// src/modals/form/FormSuccess.jsx — Écran de succès après publication

function FormSuccess({ onClose }) {
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 420, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{
          width: 64, height: 64,
          background: 'rgba(48,209,88,0.1)',
          border: '1px solid rgba(48,209,88,0.25)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, margin: '0 auto 18px',
        }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, marginBottom: 8 }}>
          Tournoi publié !
        </div>
        <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 18 }}>
          Votre tournoi est maintenant <strong>visible dans le calendrier</strong>.
        </div>
        <button className="btn btn-w" onClick={onClose} style={{ width: '100%' }}>
          OK
        </button>
      </div>
    </div>
  );
}

export default FormSuccess;
