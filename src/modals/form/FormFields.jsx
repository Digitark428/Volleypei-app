// src/modals/form/FormFields.jsx — Champs du formulaire (présentation seulement)
//
// Champs conservés (publication ultra-simple) :
//   nom, date, heure, ville, lieu, type, nombre de joueurs,
//   téléphone, email, description.
//
// Champs supprimés (v8) :
//   nom_association, numero_identification (administratifs, friction inutile).

const Required = () => <span style={{ color: 'var(--red)' }}>*</span>;

/** Types de tournoi proposés — peut être étendu sans toucher au reste */
const TYPES = [
  'Beach volley',
  'Volley en salle',
  'Tournoi mixte',
  'Tournoi 4×4',
  'Tournoi 6×6',
  'Compétition jeune',
  'Tournoi amical',
  'Autre',
];

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
            autoComplete="off"
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
          <label className="lbl">Heure <Required /></label>
          <input
            type="time"
            value={form.heure}
            onChange={e => onChange('heure', e.target.value)}
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
            autoComplete="address-level2"
          />
        </div>

        <div>
          <label className="lbl">Type de tournoi <Required /></label>
          <select
            value={form.type || ''}
            onChange={e => onChange('type', e.target.value)}
            className="field"
          >
            <option value="" disabled>— Choisir —</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ gridColumn: '1/-1' }}>
          <label className="lbl">Lieu (adresse précise) <Required /></label>
          <input
            type="text"
            placeholder="Plage de Boucan Canot"
            value={form.lieu}
            onChange={e => onChange('lieu', e.target.value)}
            className="field"
            autoComplete="street-address"
          />
        </div>

        <div>
          <label className="lbl">Nombre de joueurs <Required /></label>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            placeholder="32"
            value={form.nombre_joueurs}
            onChange={e => onChange('nombre_joueurs', e.target.value)}
            className="field"
          />
        </div>

        <div>
          <label className="lbl">Téléphone contact <Required /></label>
          <input
            type="tel"
            inputMode="tel"
            placeholder="0692 00 00 00"
            value={form.telephone}
            onChange={e => onChange('telephone', e.target.value)}
            className="field"
            autoComplete="tel"
          />
        </div>

        <div style={{ gridColumn: '1/-1' }}>
          <label className="lbl">Email <Required /></label>
          <input
            type="email"
            inputMode="email"
            placeholder="contact@club.re"
            value={form.email}
            onChange={e => onChange('email', e.target.value)}
            className="field"
            autoComplete="email"
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
