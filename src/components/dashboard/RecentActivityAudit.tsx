import {
  ShieldCheck,
  Radio,
  Search,
  FolderOpen,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { Case } from '../../types/case';
import type { EvidenceItem } from '../../types/evidence';
import type { Investigation } from '../../types/investigation';
import { formatRelativeTime } from '../../utils/format';
import { MonoLabel } from '../ui/primitives';

interface RecentActivityAuditProps {
  cases: Case[];
  evidence: EvidenceItem[];
  investigations: Investigation[];
  onNavigate: (path: string) => void;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  officer: string;
  badge?: string;
  caseId: string;
  evidenceId?: string;
  type: 'custody' | 'investigation' | 'case' | 'acquisition';
  path: string;
}

export function RecentActivityAudit({
  cases,
  evidence,
  investigations,
  onNavigate,
}: RecentActivityAuditProps) {
  // Aggregate real events from state
  const events: AuditEvent[] = [];

  // 1. Evidence Chain of Custody events
  evidence.forEach((ev) => {
    (ev.chainOfCustody || []).forEach((coc) => {
      events.push({
        id: coc.id || `coc-${ev.id}-${coc.timestamp}`,
        timestamp: coc.timestamp,
        title: coc.action,
        description: coc.notes || `Evidence ${ev.filename} logged at ${coc.location}`,
        officer: coc.officer,
        badge: coc.badgeNumber,
        caseId: ev.caseId,
        evidenceId: ev.id,
        type: coc.action.toLowerCase().includes('acqui') ? 'acquisition' : 'custody',
        path: `/case/${ev.caseId}/evidence/${ev.id}`,
      });
    });
  });

  // 2. Investigation updates
  investigations.forEach((inv) => {
    events.push({
      id: `inv-${inv.id}`,
      timestamp: inv.updatedAt,
      title: `Investigation Updated: ${inv.title}`,
      description: inv.objective,
      officer: inv.leadAnalyst,
      caseId: inv.caseId,
      type: 'investigation',
      path: `/case/${inv.caseId}?tab=investigate`,
    });
  });

  // 3. Case registrations
  cases.forEach((c) => {
    events.push({
      id: `case-${c.id}`,
      timestamp: c.createdAt,
      title: `Case Registered: ${c.title}`,
      description: c.description,
      officer: c.investigator,
      caseId: c.id,
      type: 'case',
      path: `/case/${c.id}?tab=overview`,
    });
  });

  // Sort latest first
  const sortedEvents = events
    .filter((e) => !isNaN(new Date(e.timestamp).getTime()))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 7);

  const getEventBadge = (type: AuditEvent['type']) => {
    switch (type) {
      case 'acquisition':
        return { label: 'Acquisition', color: 'text-amber bg-amber/10 border-amber/30', icon: <Radio size={12} className="text-amber" /> };
      case 'custody':
        return { label: 'Chain of Custody', color: 'text-green bg-green/10 border-green/30', icon: <ShieldCheck size={12} className="text-green" /> };
      case 'investigation':
        return { label: 'Investigation', color: 'text-accent bg-accent/10 border-accent/30', icon: <Search size={12} className="text-accent" /> };
      case 'case':
        return { label: 'Case Ledger', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: <FolderOpen size={12} className="text-blue-400" /> };
    }
  };

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-text-primary">
            Recent Forensic Activity (Audit Trail)
          </h3>
        </div>
        <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-text-tertiary">
          Real Ledger Events
        </span>
      </div>

      <div className="space-y-3">
        {sortedEvents.map((evt) => {
          const b = getEventBadge(evt.type);
          return (
            <div
              key={evt.id}
              onClick={() => onNavigate(evt.path)}
              className="group p-3 rounded-lg bg-surface-02/70 border border-border-subtle hover:border-accent/40 hover:bg-surface-02 cursor-pointer transition-all space-y-1.5 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-mono uppercase border font-medium ${b.color}`}>
                    {b.icon}
                    <span>{b.label}</span>
                  </span>
                  <MonoLabel className="text-accent font-semibold">{evt.caseId}</MonoLabel>
                  {evt.evidenceId && (
                    <>
                      <span className="text-text-tertiary text-2xs">/</span>
                      <MonoLabel className="text-text-primary">{evt.evidenceId}</MonoLabel>
                    </>
                  )}
                </div>

                <span className="text-3xs font-mono text-text-tertiary">
                  {formatRelativeTime(evt.timestamp)}
                </span>
              </div>

              <p className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
                {evt.title}
              </p>

              <p className="text-3xs text-text-secondary line-clamp-1 leading-relaxed">
                {evt.description}
              </p>

              <div className="pt-1.5 flex items-center justify-between text-3xs font-mono text-text-tertiary border-t border-border-subtle/40">
                <span>Officer: {evt.officer} {evt.badge ? `(Badge #${evt.badge})` : ''}</span>
                <span className="text-accent group-hover:underline flex items-center gap-0.5">
                  <span>Inspect</span>
                  <ArrowRight size={10} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
