// src/calendar/MonthGrid.jsx — Grille mensuelle (rendu pur)
import { useMemo } from 'react';
import { JOURS_COURTS, MOIS } from '../lib/constants.js';
import { getMonthGrid, formatDateISO, todayISO } from '../lib/dates.js';

/**
 * @param {Object} props
 * @param {number}        props.annee
 * @param {number}        props.mois
 * @param {string|null}   props.selected    - date ISO sélectionnée
 * @param {Object}        props.eventsByDate - { 'YYYY-MM-DD': [...] }
 * @param {Function}      props.onPrevMonth
 * @param {Function}      props.onNextMonth
 * @param {Function}      props.onSelect    - (dateISO) => void
 */
function MonthGrid({ annee, mois, selected, eventsByDate, onPrevMonth, onNextMonth, onSelect }) {
  const cells = useMemo(() => getMonthGrid(annee, mois), [annee, mois]);
  const today = todayISO();

  return (
    <div className="cal-wrap">
      <div className="cal-hdr">
        <button onClick={onPrevMonth} className="cal-nav" aria-label="Mois précédent">‹</button>
        <div className="cal-title">{MOIS[mois]} {annee}</div>
        <button onClick={onNextMonth} className="cal-nav" aria-label="Mois suivant">›</button>
      </div>

      <div className="cal-grid">
        {JOURS_COURTS.map((d, i) => (
          <div key={i} className="cal-dn">{d}</div>
        ))}

        {cells.map((jour, i) => {
          if (!jour) return <div key={i} className="cal-cell" />;

          const dateISO = formatDateISO(annee, mois, jour);
          const events  = eventsByDate[dateISO];
          const isToday = dateISO === today;
          const isSel   = dateISO === selected;

          return (
            <div
              key={i}
              className={`cal-cell${isSel ? ' sel' : ''}`}
              onClick={() => onSelect(dateISO)}
            >
              <div className={`cal-num${isToday ? ' td' : ''}`}>{jour}</div>
              {events && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 1 }}>
                  {events.map((_, ti) => <div key={ti} className="cal-dot" />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthGrid;
