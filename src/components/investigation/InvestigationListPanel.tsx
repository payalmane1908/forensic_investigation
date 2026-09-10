import { Plus, Crosshair, Clock } from 'lucide-react';
import type { Investigation, InvestigationStatus } from '../../types/investigation';
import { MonoLabel } from '../ui/primitives';
import { formatDate } from '../../utils/format';

interface InvestigationListPanelProps {
  investigations: Investigation[];
  selectedId: string | null;
  onSelect: (inv: Investigation) => void;
  onCreateClick: () => void;
}

// Status badge for investigations
function InvStatusBadge({ status }: { status: InvestigationStatus }) {
  const cfg: Record<InvestigationStatus, { label: string; dot: string; text: string; border: string; bg: string }> = {
    open:        { label: 'Open',        dot: 'bg-accent',        text: 'text-accent',        border: 'border-accent/20',   bg: 'bg-accent-dim' },
    in_progress: { label: 'In Progress', dot: 'bg-amber',         text: 'text-amber',         border: 'border-amber/20',    bg: 'bg-amber-dim' },
    concluded:   { label: 'Concluded',   dot: 'bg-green',         text: 'text-green',         border: 'border-green/20',    bg: 'bg-green-dim' },
    archived:    { label: 'Archived',    dot: 'bg-text-tertiary', text: 'text-text-tertiary', border: 'border-border-subtle', bg: 'bg-surface-02' },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-2xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function InvestigationListPanel({
  investigations,
  selectedId,
  onSelect,
  onCreateClick,
}: InvestigationListPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0">
        <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">
          Investigations
        </span>
        <span className="text-2xs font-mono text-text-tertiary bg-surface-02 border border-border-subtle rounded-full px-2 py-0.5">
          {investigations.length}
        </span>
      </div>

      {/* Create button */}
      <div className="px-3 py-3 border-b border-border-subtle shrink-0">
        <button
          onClick={onCreateClick}
          className="
            w-full flex items-center justify-center gap-2 h-9 px-3 rounded-md
            border border-dashed border-border-default
            text-xs font-medium text-text-secondary
            hover:border-accent hover:text-accent hover:bg-accent-dim
            transition-all duration-150
          "
          id="create-investigation-panel-btn"
        >
          <Plus size={13} />
          Create Investigation
        </button>
      </div>

      {/* Investigation list */}
      <div className="flex-1 overflow-y-auto">
        {investigations.map((inv) => {
          const isSelected = inv.id === selectedId;
          return (
            <button
              key={inv.id}
              onClick={() => onSelect(inv)}
              className={`
                w-full text-left px-4 py-3.5 border-b border-border-subtle/60
                transition-colors duration-100
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent/40
                ${isSelected
                  ? 'bg-accent-dim border-l-2 border-l-accent'
                  : 'hover:bg-surface-02'}
              `}
            >
              {/* ID row */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <MonoLabel className={isSelected ? 'text-accent' : ''}>{inv.id}</MonoLabel>
                <InvStatusBadge status={inv.status} />
              </div>

              {/* Title */}
              <p className={`text-xs font-medium leading-snug mb-1.5 ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                {inv.title}
              </p>

              {/* Meta: detections + date */}
              <div className="flex items-center gap-3 text-2xs text-text-tertiary">
                <span className="flex items-center gap-1">
                  <Crosshair size={10} />
                  {inv.detectionIds.length} detections
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {formatDate(inv.createdAt)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
