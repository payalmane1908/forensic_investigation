import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  LayoutList,
  LayoutGrid,
  Filter,
  FolderOpen,
} from 'lucide-react';
import { Button } from '../components/ui/primitives';
import { CaseCard } from '../components/cases/CaseCard';
import { CreateCaseModal } from '../components/cases/CreateCaseModal';
import type { Case, CaseStatus, CreateCasePayload } from '../types/case';
import { MOCK_CASES } from '../data/mockCases';

type ViewMode = 'list' | 'grid';
type FilterStatus = 'all' | CaseStatus;

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all',        label: 'All' },
  { value: 'active',     label: 'Active' },
  { value: 'processing', label: 'Processing' },
  { value: 'critical',   label: 'Critical' },
  { value: 'closed',     label: 'Closed' },
];

// Current time greeting
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Current date string
function getTodayString(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function CasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const handleCaseClick = (c: Case) => {
    navigate(`/case/${c.id}`);
  };

  // Derived stats
  const stats = useMemo(() => {
    const active       = cases.filter((c) => c.status === 'active').length;
    const processing   = cases.filter((c) => c.status === 'processing').length;
    const critical     = cases.filter((c) => c.status === 'critical').length;
    const highPriority = cases.filter((c) => c.priority === 'high').length;
    return { total: cases.length, active, processing, critical, highPriority };
  }, [cases]);

  // Filtered + searched cases
  const visibleCases = useMemo(() => {
    let result = [...cases];
    if (filterStatus !== 'all') {
      result = result.filter((c) => c.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.investigator.toLowerCase().includes(q)
      );
    }
    return result;
  }, [cases, filterStatus, searchQuery]);

  const handleCreate = (payload: CreateCasePayload) => {
    const newCase: Case = {
      ...payload,
      cameraCount: 0,
      evidenceCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      priority: payload.priority ?? 'medium',
      incidentAt: payload.incidentAt,
    };
    setCases((prev) => [newCase, ...prev]);
    navigate(`/case/${newCase.id}`);
  };

  const existingIds = cases.map((c) => c.id);

  return (
    <main className="max-w-screen-xl mx-auto px-6 pb-16">

      {/* ── Hero zone ─────────────────────────────────────────────────────── */}
      <div className="pt-14 pb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border-subtle">
        <div>
          <p className="text-xs font-mono text-text-tertiary tracking-widest uppercase mb-3">
            {getTodayString()}
          </p>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-1">
            {getGreeting()}.
          </h1>
          <p className="text-base text-text-secondary">
            What are you investigating today?
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-5">
          <StatPill label="Total" value={stats.total} />
          <div className="w-px h-6 bg-border-subtle" />
          <StatPill label="Active" value={stats.active} highlight="green" />
          {stats.processing > 0 && (
            <StatPill label="Processing" value={stats.processing} highlight="amber" />
          )}
          {stats.critical > 0 && (
            <StatPill label="Critical" value={stats.critical} highlight="red" />
          )}
          {stats.highPriority > 0 && (
            <StatPill label="High Priority" value={stats.highPriority} highlight="red" />
          )}
        </div>
      </div>

      {/* ── Primary CTA ─────────────────────────────────────────────────────── */}
      <div className="py-8 flex items-center justify-between gap-4">
        <Button
          variant="primary"
          size="lg"
          icon={<Plus size={17} />}
          onClick={() => setShowCreateModal(true)}
          id="create-investigation-btn"
        >
          Create Investigation
        </Button>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by ID, title, investigator…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full h-9 rounded-md border text-sm pl-9 pr-3
              bg-surface-01 border-border-subtle text-text-primary
              placeholder:text-text-tertiary
              transition-colors duration-150
              focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
            "
            aria-label="Search investigations"
          />
        </div>
      </div>

      {/* ── Cases section header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-semibold text-text-primary">
            Investigations
          </h2>
          <span className="ml-2 px-2 py-0.5 text-2xs font-mono text-text-tertiary bg-surface-02 border border-border-subtle rounded-full">
            {visibleCases.length}
          </span>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2">
          {/* Status filter pills */}
          <div className="hidden md:flex items-center gap-1 bg-surface-01 border border-border-subtle rounded-md p-0.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-sm transition-all duration-150
                  ${
                    filterStatus === f.value
                      ? 'bg-surface-03 text-text-primary'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Mobile filter */}
          <div className="md:hidden relative">
            <Button
              variant="secondary"
              size="sm"
              icon={<Filter size={13} />}
              onClick={() => setFilterMenuOpen((v) => !v)}
            >
              Filter
            </Button>
            {filterMenuOpen && (
              <div className="absolute right-0 top-10 w-40 bg-surface-02 border border-border-subtle rounded-lg shadow-modal py-1 z-30">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setFilterStatus(f.value);
                      setFilterMenuOpen(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2 text-xs transition-colors
                      ${
                        filterStatus === f.value
                          ? 'text-text-primary font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-03'
                      }
                    `}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-surface-01 border border-border-subtle rounded-md p-0.5">
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`
                p-1.5 rounded-sm transition-colors duration-150
                ${viewMode === 'list' ? 'bg-surface-03 text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}
              `}
            >
              <LayoutList size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`
                p-1.5 rounded-sm transition-colors duration-150
                ${viewMode === 'grid' ? 'bg-surface-03 text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}
              `}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Case list / grid ─────────────────────────────────────────────────── */}
      {visibleCases.length === 0 ? (
        <EmptyState hasSearch={searchQuery.trim().length > 0} onClear={() => { setSearchQuery(''); setFilterStatus('all'); }} />
      ) : viewMode === 'list' ? (
        <div className="flex flex-col gap-2">
          {visibleCases.map((c, i) => (
            <div
              key={c.id}
              className={`animate-slide-up stagger-${Math.min(i + 1, 5)}`}
            >
              <CaseCard caseData={c} view="list" onClick={handleCaseClick} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleCases.map((c, i) => (
            <div
              key={c.id}
              className={`animate-slide-up stagger-${Math.min(i + 1, 5)}`}
            >
              <CaseCard caseData={c} view="grid" onClick={handleCaseClick} />
            </div>
          ))}
        </div>
      )}

      {/* ── Create Case Modal ────────────────────────────────────────────────── */}
      <CreateCaseModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        existingIds={existingIds}
      />
    </main>
  );
}

// ─── Stat Pill ───────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: 'green' | 'amber' | 'red';
}) {
  const valueClass = highlight
    ? { green: 'text-green', amber: 'text-amber', red: 'text-red' }[highlight]
    : 'text-text-primary';

  return (
    <div className="text-center">
      <p className={`text-lg font-semibold ${valueClass} leading-none`}>{value}</p>
      <p className="text-2xs text-text-tertiary mt-0.5 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ hasSearch, onClear }: { hasSearch: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-xl bg-surface-01 border border-border-subtle flex items-center justify-center">
        <FolderOpen size={22} className="text-text-tertiary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-text-secondary mb-1">
          {hasSearch ? 'No matching investigations' : 'No investigations yet'}
        </p>
        <p className="text-xs text-text-tertiary max-w-xs">
          {hasSearch
            ? 'Try adjusting your search or filter criteria.'
            : 'Create your first investigation to get started.'}
        </p>
      </div>
      {hasSearch && (
        <button
          onClick={onClear}
          className="text-xs text-accent hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
