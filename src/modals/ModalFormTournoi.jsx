// src/modals/ModalFormTournoi.jsx — Modal de publication d'un tournoi
// v9 : publication directe, plus de validation admin.
import { useState } from 'react';
import { useTournoiForm } from '../hooks/useTournoiForm.js';
import FormAfficheUpload  from './form/FormAfficheUpload.jsx';
import FormFields         from './form/FormFields.jsx';
import FormSuccess        from './form/FormSuccess.jsx';
import FormDoublonConfirm from './form/FormDoublonConfirm.jsx';

function ModalFormTournoi({ tournois = [], initialDate, onClose, onPublished }) {
  const form = useTournoiForm(initialDate);

  const [success, setSuccess]           = useState(false);
  const [doublonCount, setDoublonCount] = useState(0);

  // ─── Soumission orchestrée ────────────────────────────────────────────────
  async function trySubmit() {
    // Vérifie d'abord les doublons (avertissement avant publication)
    const doublons = tournois.filter(t => t.date === form.form.date);
    if (doublons.length > 0 && doublonCount === 0) {
      setDoublonCount(doublons.length);
      return;
    }
    await doSubmit();
  }

  async function doSubmit() {
    setDoublonCount(0);
    try {
      await form.submit();
      setSuccess(true);
    } catch {
      // L'erreur est déjà dans form.err
    }
  }

  function handleSuccessClose() {
    setSuccess(false);
    onPublished?.();
    onClose?.();
  }

  // ─── Écrans secondaires ──────────────────────────────────────────────────
  if (success)      return <FormSuccess onClose={handleSuccessClose} />;
  if (doublonCount) return <FormDoublonConfirm count={doublonCount} onCancel={() => setDoublonCount(0)} onConfirm={doSubmit} />;

  // ─── Écran principal ─────────────────────────────────────────────────────
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>Publier un tournoi</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
              Visible immédiatement dans le calendrier public
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Fermer">×</button>
        </div>

        {form.err && <div className="err-box">{form.err}</div>}

        <div style={{ marginBottom: 16 }}>
          <label className="lbl">Affiche de l'événement <span style={{ color: 'var(--red)' }}>*</span></label>
          <FormAfficheUpload
            preview={form.form.image}
            onPick={form.setImage}
            onClear={form.clearImage}
          />
        </div>

        <FormFields form={form.form} onChange={form.updateField} />

        <div style={{ display: 'flex', gap: 9 }}>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={form.submitting}
            style={{ flex: 1 }}
          >
            Annuler
          </button>
          <button
            className="btn btn-w"
            onClick={trySubmit}
            disabled={form.submitting}
            style={{ flex: 2, padding: '13px' }}
          >
            {form.submitting ? 'Publication…' : 'Publier le tournoi'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalFormTournoi;
