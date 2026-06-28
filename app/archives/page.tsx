'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Archive, Eye, TrendingUp, Filter } from 'lucide-react';
import { supabase, type Tournament, type TournamentType } from '@/lib/supabase';
import TypeBadge from '@/components/ui/TypeBadge';
import { formatDate, formatTime, TOURNAMENT_TYPES, TYPE_COLORS, classNames } from '@/lib/utils';

type FilterValue = 'all' | TournamentType;
type SortValue = 'recent' | 'popular';

export default function ArchivesPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [sort, setSort] = useState<SortValue>('recent');

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .lt('date', today)
        .order('date', { ascending: false });
      setTournaments(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = tournaments;
    if (filter !== 'all') list = list.filter((t) => t.type === filter);

    if (sort === 'popular') {
      list = [...list].sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0));
    } else {
      list = [...list].sort((a, b) => b.date.localeCompare(a.date));
    }

    return list;
  }, [tournaments, filter, sort]);

  const totalViews = tournaments.reduce((acc, t) => acc + (t.views_count ?? 0), 0);
  const mostViewed = [...tournaments].sort(
    (a, b) => (b.views_count ?? 0) - (a.views_count ?? 0)
  )[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-12">
      {/* HEADER */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 sm:mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink-100 border border-ink-200/60 text-[11px] font-medium text-ink-600 tracking-wide uppercase mb-4">
          <Archive className="w-3 h-3" />
          Archives
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink-900 leading-[1.1]">
          Les tournois passés
        </h1>
        <p className="mt-3 text-base sm:text-lg text-ink-500 max-w-2xl">
          Retrouvez l&apos;historique des tournois et leurs statistiques de consultation.
        </p>
      </motion.section>

      {/* STATS */}
      {!loading && tournaments.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12"
        >
          <StatCard
            label="Tournois archivés"
            value={tournaments.length.toString()}
            icon={Archive}
          />
          <StatCard
            label="Vues totales"
            value={totalViews.toLocaleString('fr-FR')}
            icon={Eye}
            highlight
          />
          {mostViewed && (
            <StatCard
              label="Le plus vu"
              value={mostViewed.name}
              subValue={`${mostViewed.views_count ?? 0} vues`}
              icon={TrendingUp}
              className="col-span-2 sm:col-span-1"
            />
          )}
        </motion.section>
      )}

      {/* FILTRES */}
      <div className="bg-white rounded-2xl border border-ink-200/60 shadow-soft p-3 sm:p-4 mb-6">
        <div className="flex items-center gap-2 mb-2.5 sm:mb-3 px-1">
          <Filter className="w-3.5 h-3.5 text-ink-500" />
          <span className="text-[11px] font-medium tracking-wider uppercase text-ink-500">
            Filtrer & trier
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')} solid="bg-ink-900">
            Tout ({tournaments.length})
          </Chip>
          {TOURNAMENT_TYPES.map((type) => {
            const count = tournaments.filter((t) => t.type === type).length;
            if (count === 0) return null;
            return (
              <Chip
                key={type}
                active={filter === type}
                onClick={() => setFilter(type)}
                solid={TYPE_COLORS[type].solid}
              >
                {type} ({count})
              </Chip>
            );
          })}
          <div className="flex-1" />
          <Chip
            active={sort === 'recent'}
            onClick={() => setSort('recent')}
            solid="bg-ink-800"
          >
            Récent
          </Chip>
          <Chip
            active={sort === 'popular'}
            onClick={() => setSort('popular')}
            solid="bg-ink-800"
          >
            <TrendingUp className="w-3 h-3 mr-1 inline" />
            Populaire
          </Chip>
        </div>
      </div>

      {/* LISTE */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 bg-white rounded-3xl border border-ink-200/60 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-ink-200/60 p-12 text-center">
          <Archive className="w-10 h-10 text-ink-300 mx-auto mb-4" />
          <p className="text-ink-500">
            {tournaments.length === 0
              ? 'Aucun tournoi archivé pour le moment.'
              : 'Aucun tournoi ne correspond à ce filtre.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((t, i) => (
            <ArchiveCard key={t.id} tournament={t} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  highlight,
  className,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        'relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-soft border',
        highlight
          ? 'bg-gradient-to-br from-ink-900 to-ink-800 border-ink-800 text-white'
          : 'bg-white border-ink-200/60',
        className
      )}
    >
      {highlight && (
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-reunion-yellow/10 rounded-full blur-2xl" />
      )}
      <div
        className={classNames(
          'flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider relative',
          highlight ? 'text-ink-300' : 'text-ink-500'
        )}
      >
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div
        className={classNames(
          'mt-1.5 font-display font-bold tabular-nums truncate relative',
          highlight ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl text-ink-900',
          !highlight && subValue && 'text-base sm:text-lg'
        )}
      >
        {value}
      </div>
      {subValue && (
        <div
          className={classNames(
            'text-xs mt-0.5 relative',
            highlight ? 'text-ink-300' : 'text-ink-500'
          )}
        >
          {subValue}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CHIP
// ============================================================

function Chip({
  active,
  onClick,
  children,
  solid,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  solid: string;
}) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-[13px] font-medium whitespace-nowrap transition-all duration-200',
        active
          ? `${solid} text-white shadow-soft scale-[1.02]`
          : 'bg-ink-50 text-ink-700 hover:bg-ink-100 ring-1 ring-inset ring-ink-200/60'
      )}
    >
      {children}
    </button>
  );
}

// ============================================================
// ARCHIVE CARD - format horizontal compact
// ============================================================

function ArchiveCard({ tournament: t, index }: { tournament: Tournament; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
    >
      <Link
        href={`/tournoi/${t.id}`}
        className="group flex bg-white rounded-2xl overflow-hidden border border-ink-200/60 hover:border-ink-300 hover:shadow-lift transition-all duration-300"
      >
        {/* Affiche miniature */}
        <div className="w-28 sm:w-32 aspect-[4/5] flex-shrink-0 bg-ink-100 overflow-hidden">
          {t.poster_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.poster_url}
              alt={t.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale-[0.15] group-hover:grayscale-0"
            />
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-between">
          <div className="min-w-0">
            <TypeBadge type={t.type} size="sm" />
            <h3 className="font-display font-semibold text-sm sm:text-[15px] text-ink-900 leading-tight mt-2 line-clamp-2 tracking-tight">
              {t.name}
            </h3>
            <p className="text-[12px] text-ink-500 mt-1 truncate">
              {formatDate(t.date, { day: 'numeric', month: 'short', year: 'numeric' })} ·{' '}
              {t.city}
            </p>
          </div>

          {/* Stats vues */}
          <div className="flex items-center gap-1.5 mt-2 sm:mt-3 text-[11px] font-medium text-ink-600">
            <Eye className="w-3 h-3" />
            <span className="tabular-nums">
              {(t.views_count ?? 0).toLocaleString('fr-FR')}
            </span>
            <span className="text-ink-400">vue{(t.views_count ?? 0) > 1 ? 's' : ''}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
