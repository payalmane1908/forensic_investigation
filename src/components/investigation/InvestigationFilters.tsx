import {
  Search,
  SlidersHorizontal,
  User,
  Car,
  ScanFace,
  CreditCard,
  Briefcase,
  LayoutGrid,
  Clock,
  GitFork,
  Bookmark,
  X,
} from 'lucide-react';
import type { InvestigationFilterState } from '../../types/investigation';
import { MOCK_CASES } from '../../data/mockCases';

interface InvestigationFiltersProps {
  filters: InvestigationFilterState;
  onChange: (filters: Partial<InvestigationFilterState>) => void;
  availableCameras: string[];
  isCaseScoped?: boolean;
}

const TARGET_BUTTONS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Targets', icon: <SlidersHorizontal size={13} /> },
  { id: 'person', label: 'Persons', icon: <User size={13} /> },
  { id: 'vehicle', label: 'Vehicles', icon: <Car size={13} /> },
  { id: 'license_plate', label: 'Plates (ANPR)', icon: <CreditCard size={13} /> },
  { id: 'face', label: 'Faces', icon: <ScanFace size={13} /> },
  { id: 'bag_object', label: 'Objects / Bags', icon: <Briefcase size={13} /> },
];

const COLOR_OPTIONS = [
  { id: 'all', label: 'Any Color', bg: 'bg-surface-03' },
  { id: 'red', label: 'Red', bg: 'bg-red' },
  { id: 'black', label: 'Black / Dark', bg: 'bg-black border border-white/20' },
  { id: 'white', label: 'White / Light', bg: 'bg-white text-black' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
  { id: 'yellow', label: 'Yellow', bg: 'bg-amber-400 text-black' },
];

export function InvestigationFilters({
  filters,
  onChange,
  availableCameras,
  isCaseScoped = false,
}: InvestigationFiltersProps) {
  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-4 space-y-4 mb-6">
      {/* ── Top row: Search bar + View mode switcher ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search detections by label, suspect name, plate number, or attribute..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            className="w-full bg-surface-base border border-border-subtle rounded-lg pl-9 pr-8 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-1 focus:ring-accent transition-all font-sans"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Global Case Selector (if not case-scoped) */}
        {!isCaseScoped && (
          <div className="flex items-center gap-2">
            <span className="text-2xs font-mono uppercase text-text-tertiary tracking-wider shrink-0">
              Case:
            </span>
            <select
              value={filters.caseId}
              onChange={(e) => onChange({ caseId: e.target.value })}
              aria-label="Filter by case"
              className="bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary font-mono focus:border-accent"
            >
              <option value="all">All Cases (Active Index)</option>
              {MOCK_CASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title.slice(0, 24)}...
                </option>
              ))}
            </select>
          </div>
        )}

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center bg-surface-base border border-border-subtle rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => onChange({ viewMode: 'grid' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filters.viewMode === 'grid'
                ? 'bg-surface-02 text-accent shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <LayoutGrid size={13} />
            <span>Detection Grid</span>
          </button>
          <button
            onClick={() => onChange({ viewMode: 'timeline' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filters.viewMode === 'timeline'
                ? 'bg-surface-02 text-accent shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Clock size={13} />
            <span>Multi-Cam Timeline</span>
          </button>
          <button
            onClick={() => onChange({ viewMode: 'journey' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filters.viewMode === 'journey'
                ? 'bg-surface-02 text-accent shadow-sm border border-border-subtle'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <GitFork size={13} />
            <span>Suspect Journey (Re-ID)</span>
          </button>
        </div>
      </div>

      {/* ── Category Pills Row ── */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 shrink-0">
          {TARGET_BUTTONS.map((btn) => {
            const isSelected = filters.targetType === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => onChange({ targetType: btn.id })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-accent text-white shadow-sm shadow-accent/30 font-semibold'
                    : 'bg-surface-base text-text-secondary hover:text-text-primary hover:bg-surface-02 border border-border-subtle'
                }`}
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bookmarked only toggle */}
        <button
          onClick={() => onChange({ bookmarkedOnly: !filters.bookmarkedOnly })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
            filters.bookmarkedOnly
              ? 'bg-amber/15 text-amber border-amber/30'
              : 'bg-surface-base text-text-secondary hover:text-text-primary border-border-subtle'
          }`}
        >
          <Bookmark size={13} className={filters.bookmarkedOnly ? 'fill-amber text-amber' : ''} />
          <span>Bookmarked Exhibits</span>
        </button>
      </div>

      {/* ── Secondary Controls: Color Chips + Camera Dropdown + Confidence Slider ── */}
      <div className="pt-2 border-t border-border-subtle/50 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Color filters */}
        <div className="flex items-center gap-2">
          <span className="text-2xs font-mono uppercase text-text-tertiary">Color:</span>
          <div className="flex items-center gap-1.5">
            {COLOR_OPTIONS.map((c) => {
              const active = filters.color === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onChange({ color: c.id })}
                  className={`px-2.5 py-1 rounded-md text-2xs font-medium border transition-all ${
                    active
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-border-subtle text-text-secondary hover:text-text-primary bg-surface-base'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Camera channel dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-2xs font-mono uppercase text-text-tertiary">Camera:</span>
          <select
            value={filters.cameraChannel}
            onChange={(e) => onChange({ cameraChannel: e.target.value })}
            aria-label="Filter by camera"
            className="bg-surface-base border border-border-subtle rounded-md px-2.5 py-1 text-2xs text-text-primary font-mono focus:border-accent"
          >
            <option value="all">All Channels</option>
            {availableCameras.map((cam) => (
              <option key={cam} value={cam}>
                {cam}
              </option>
            ))}
          </select>
        </div>

        {/* Confidence threshold slider */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xs font-mono uppercase text-text-tertiary">
            Min Confidence:
          </span>
          <input
            type="range"
            min="60"
            max="99"
            step="1"
            value={Math.round(filters.minConfidence * 100)}
            onChange={(e) => onChange({ minConfidence: Number(e.target.value) / 100 })}
            className="w-24 accent-accent h-1.5 bg-surface-03 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-accent text-2xs font-bold w-9 text-right">
            {Math.round(filters.minConfidence * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
