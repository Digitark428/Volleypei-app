'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2, Edit3, Search, MapPin, Eye, Archive } from 'lucide-react';
import { supabase, type Tournament, type TournamentType } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Field, Input, Textarea, Select } from '@/components/ui/Input';
import TypeBadge from '@/components/ui/TypeBadge';
import { TOURNAMENT_TYPES, formatDate, formatTime } from '@/lib/utils';

export default function AdminTournaments() {
  const [items, setItems] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editTarget, setEditTarget] = useState<Tournament | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Tournament | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tournaments')
      .select('*')
      .order('date', { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const remove = async () => {
    if (!confirmDelete) return;
    await supabase.from('tournaments').delete().eq('id', confirmDelete.id);
    setConfirmDelete(null);
    fetchAll();
  };

  const filtered = items.filter((t) =>
    [t.name, t.city, t.location, t.type]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const todayStr = new Date().toISOString().slice(0, 10);

  // Sépare à venir / passés
  const upcoming = filtered.filter((t) => t.date >= todayStr);
  const past = filtered.filter((t) => t.date < todayStr);

  // Stats globales
  const stats = useMemo(() => {
    const totalViews = items.reduce((acc, t) => acc + (t.views_count ?? 0), 0);
    const mostViewed = [...items].sort(
      (a, b) => (b.views_count ?? 0) - (a.views_count ?? 0)
    )[0];
    return { totalViews, mostViewed, total: items.length };
  }, [items]);

  return (
    <div>
      {/* Stats Admin */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <StatMini label="Total tournois" value={stats.total.toString()} />
          <StatMini label="À venir" value={upcoming.length.toString()} accent="text-emerald-700" />
          <StatMini label="Archivés" value={past.length.toString()} accent="text-ink-500" />
          <StatMini
            label="Vues totales"
            value={stats.totalViews.toLocaleString('fr-FR')}
            icon={Eye}
            highlight
          />
        </div>
      )}

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <Input
            placeholder="Rechercher par nom, ville, type…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-ink-500 hidden sm:block">
          {filtered.length} tournoi{filtered.length > 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-2xl border border-ink-200/60 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink-200/60 p-10 text-center text-ink-500">
          Aucun tournoi.
        </div>
      ) : (
        <div className="space-y-6">
          {/* À venir */}
          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold tracking-wider uppercase text-ink-700">
                  À venir ({upcoming.length})
                </span>
              </div>
              <div className="space-y-2">
                {upcoming.map((t) => (
                  <TournamentRow
                    key={t.id}
                    tournament={t}
                    onEdit={() => setEditTarget(t)}
                    onDelete={() => setConfirmDelete(t)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Archivés */}
          {past.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Archive className="w-3 h-3 text-ink-400" />
                <span className="text-[11px] font-semibold tracking-wider uppercase text-ink-500">
                  Archivés ({past.length})
                </span>
              </div>
              <div className="space-y-2 opacity-80">
                {past.map((t) => (
                  <TournamentRow
                    key={t.id}
                    tournament={t}
                    onEdit={() => setEditTarget(t)}
                    onDelete={() => setConfirmDelete(t)}
                    isPast
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal édition */}
      {editTarget && (
        <EditTournamentModal
          tournament={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            fetchAll();
          }}
        />
      )}

      {/* Confirm suppression */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Supprimer ce tournoi ?"
        description="Cette action est irréversible."
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-ink-50 p-3 text-sm">
            <p className="font-medium text-ink-900">{confirmDelete?.name}</p>
            <p className="text-ink-500 text-xs mt-1">
              {confirmDelete && formatDate(confirmDelete.date)} · {confirmDelete?.city}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmDelete(null)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button variant="danger" onClick={remove} className="flex-1">
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// STAT MINI (cards stats admin)
// ============================================================

function StatMini({
  label,
  value,
  icon: Icon,
  highlight,
  accent,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  accent?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-3 sm:p-4 shadow-soft border ${
        highlight
          ? 'bg-gradient-to-br from-ink-900 to-ink-800 border-ink-800 text-white'
          : 'bg-white border-ink-200/60'
      }`}
    >
      {highlight && (
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-reunion-yellow/10 rounded-full blur-2xl" />
      )}
      <div
        className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider relative ${
          highlight ? 'text-ink-300' : 'text-ink-500'
        }`}
      >
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </div>
      <div
        className={`mt-1 text-xl sm:text-2xl font-display font-bold tabular-nums relative ${
          highlight ? '' : accent ?? 'text-ink-900'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// ============================================================
// TOURNAMENT ROW (item liste admin)
// ============================================================

function TournamentRow({
  tournament: t,
  onEdit,
  onDelete,
  isPast,
}: {
  tournament: Tournament;
  onEdit: () => void;
  onDelete: () => void;
  isPast?: boolean;
}) {
  const views = t.views_count ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-ink-200/60 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:shadow-soft transition-shadow">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-ink-100 flex-shrink-0 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={t.poster_url}
          alt={t.name}
          className={`w-full h-full object-cover ${isPast ? 'grayscale-[0.4]' : ''}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-ink-900 text-[15px] truncate">{t.name}</span>
          <TypeBadge type={t.type} size="sm" />
        </div>
        <div className="text-xs text-ink-500 truncate">
          {formatDate(t.date, { day: 'numeric', month: 'short', year: 'numeric' })} ·{' '}
          {formatTime(t.time)} ·{' '}
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {t.city}
          </span>
        </div>
      </div>

      {/* Stats vues */}
      <div className="hidden sm:flex flex-col items-end justify-center px-3 border-l border-ink-100">
        <div className="flex items-center gap-1 text-[10px] text-ink-400 uppercase tracking-wider font-medium">
          <Eye className="w-3 h-3" />
          Vues
        </div>
        <div className="font-display font-bold text-lg tabular-nums text-ink-900 leading-tight">
          {views.toLocaleString('fr-FR')}
        </div>
      </div>

      {/* Vues mobile */}
      <div className="sm:hidden flex items-center gap-1 text-xs font-medium text-ink-700 px-1">
        <Eye className="w-3.5 h-3.5" />
        <span className="tabular-nums">{views}</span>
      </div>

      <div className="flex gap-1">
        <button
          onClick={onEdit}
          className="w-9 h-9 rounded-full hover:bg-ink-100 flex items-center justify-center transition-colors"
          aria-label="Éditer"
        >
          <Edit3 className="w-4 h-4 text-ink-600" />
        </button>
        <button
          onClick={onDelete}
          className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors"
          aria-label="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-reunion-red" />
        </button>
      </div>
    </div>
  );
}

function EditTournamentModal({
  tournament,
  onClose,
  onSaved,
}: {
  tournament: Tournament;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: tournament.name,
    date: tournament.date,
    time: tournament.time.slice(0, 5),
    city: tournament.city,
    type: tournament.type,
    location: tournament.location,
    players_count: String(tournament.players_count),
    description: tournament.description,
    phone: tournament.phone ?? '',
    email: tournament.email ?? '',
    latitude: tournament.latitude?.toString() ?? '',
    longitude: tournament.longitude?.toString() ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase
      .from('tournaments')
      .update({
        name: form.name,
        date: form.date,
        time: form.time,
        city: form.city,
        type: form.type as TournamentType,
        location: form.location,
        players_count: parseInt(form.players_count, 10),
        description: form.description,
        phone: form.phone || null,
        email: form.email || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      })
      .eq('id', tournament.id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title="Éditer le tournoi" maxWidth="xl">
      <div className="flex flex-col gap-4">
        <Field label="Nom" required>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" required>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Heure" required>
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ville" required>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="Type" required>
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as TournamentType })}
            >
              {TOURNAMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Lieu précis" required>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </Field>
        <Field label="Nombre d'équipes maximum" required>
          <Input
            type="number"
            value={form.players_count}
            onChange={(e) => setForm({ ...form, players_count: e.target.value })}
          />
        </Field>
        <Field label="Description" required>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Téléphone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" hint="Pour afficher sur la carte">
            <Input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="-21.115141"
            />
          </Field>
          <Field label="Longitude">
            <Input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="55.536384"
            />
          </Field>
        </div>

        {error && (
          <div className="rounded-xl bg-reunion-red/5 border border-reunion-red/20 px-4 py-2 text-sm text-reunion-red">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button onClick={save} loading={saving} className="flex-1">
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
