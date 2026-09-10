import {
  Search,
  Crosshair,
  User,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { Investigation } from '../../types/investigation';
import type { Case } from '../../types/case';
import { MonoLabel } from '../ui/primitives';
import { formatRelativeTime } from '../../utils/format';

interface ActiveInvestigationsListProps {
  investigations: Investigation[];
  cases: Case[];
  onNavigate: (path: string) => void;
}

export function ActiveInvestigationsList({
  investigations,
  cases,
  onNavigate,
}: ActiveInvestigationsListProps) {
  const caseMap = new Map(cases.map((c) => [c.id, c]));

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-text-primary">
              Active Investigations ({investigations.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('/investigate')}
            className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
          >
            <span>Global View</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-3">
          {investigations.map((inv) => {
            const parentCase = caseMap.get(inv.caseId);
            const isHighPriority = parentCase?.priority === 'high';

            return (
              <div
                key={inv.id}
                onClick={() => onNavigate(`/case/${inv.caseId}?tab=investigate`)}
                className="group p-3.5 rounded-lg bg-surface-02/80 border border-border-subtle hover:border-accent/50 hover:bg-surface-02 cursor-pointer transition-all space-y-2 shadow-xs"
              >
                {/* Header row: ID, Case ID, Priority badge */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <MonoLabel className="text-accent font-semibold">{inv.id}</MonoLabel>
                    <span className="text-text-tertiary text-2xs">/</span>
                    <MonoLabel className="text-text-primary">{inv.caseId}</MonoLabel>
                  </div>

                  <div className="flex items-center gap-2">
                    {isHighPriority && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-mono uppercase bg-red/10 text-red border border-red/30 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                        High Priority
                      </span>
                    )}
                    <span
                      className={`text-3xs font-mono px-2 py-0.5 rounded-full uppercase ${
                        inv.status === 'in_progress'
                          ? 'bg-amber/10 text-amber border border-amber/30'
                          : inv.status === 'concluded'
                          ? 'bg-green/10 text-green border border-green/30'
                          : 'bg-accent/10 text-accent border border-accent/30'
                      }`}
                    >
                      {inv.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
                  {inv.title}
                </h4>

                {/* Objective line */}
                <p className="text-3xs text-text-secondary line-clamp-1 leading-relaxed">
                  {inv.objective}
                </p>

                {/* Meta details */}
                <div className="pt-2 border-t border-border-subtle/40 flex items-center justify-between text-3xs font-mono text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <Crosshair size={10} className="text-accent" />
                    {inv.detectionIds.length} Pinned Detections
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={10} />
                    {inv.leadAnalyst}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {formatRelativeTime(inv.updatedAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-border-subtle flex justify-end">
        <button
          onClick={() => onNavigate('/cases')}
          className="text-xs font-medium text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
        >
          <span>View All Registered Cases</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
