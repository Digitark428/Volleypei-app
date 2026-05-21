// src/modals/form/FormFields.jsx — Champs du formulaire (présentation seulement)

const Required = () => <span style={{ color: 'var(--red)' }}>*</span>;

function FormFields({ form, onChange }) {
  return (
    <>
      <div className="form-grid" style={{ marginBottom: 10 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label className="lbl">Nom du tournoi <Required /></label>
          <input
            type="text"
            placeholder="Open Beach de Saint-Gilles"
            value={form.nom}
            onChange={e => onChange('nom', e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="lbl">Date <Required /></label>
          <input
            type="date"
            value={form.date}
            onChange={e => onChange('date', e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="lbl">Ville <Required /></label>
          <input
            type="text"
            placeholder="Saint-Gilles"
            value={form.ville}
            onChange={e => onChange('ville', e.target.value)}
            className="field"
          />
        </div>

        <div style={{ gridColumn: '1/-1' }}>
          <label className="lbl">Lieu <Required /></label>
          <input
            type="text"
            placeholder="Plage de Boucan Canot"
            value={form.lieu}
            onChange={e => onChange('lieu', e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="lbl">Téléphone <Required /></label>
          <input
            type="tel"
            inputMode="tel"
            placeholder="0692 00 00 00"
            value={form.telephone}
            onChange={e => onChange('telephone', e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="lbl">Email <Required /></label>
          <input
            type="email"
            inputMode="email"
            placeholder="contact@club.re"
            value={form.email}
            onChange={e => onChange('email', e.target.value)}
            className="field"
          />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label className="lbl">Description <Required /></label>
        <textarea
          rows={3}
          placeholder="Format, ambiance, public visé, lots à gagner..."
          value={form.description}
          onChange={e => onChange('description', e.target.value)}
          className="field"
          style={{ resize: 'vertical' }}
        />
      </div>
    </>
  );
}

export default FormFields;
