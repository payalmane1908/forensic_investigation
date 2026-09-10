import { useState } from 'react';
import { Camera, FolderOpen, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import type { Case, CasePriority } from '../../types/case';
import { Badge, MonoLabel } from '../ui/primitives';
import { formatRelativeTime, formatDate } from '../../utils/format';

interface CaseCardProps {
  caseData: Case;
  onClick?: (c: Case) => void;
  view?: 'list' | 'grid';
}

// Priority indicator — compact dot + label using design-system tokens
function PriorityPip({ priority }: { priority: CasePriority }) {
  const cfg: Record<CasePriority, { dot: string; text: string; label: string }> = {
    high:   { dot: 'bg-red',   text: 'text-red',   label: 'High' },
    medium: { dot: 'bg-amber', text: 'text-amber',  label: 'Med' },
    low:    { dot: 'bg-text-tertiary', text: 'text-text-tertiary', label: 'Low' },
  };
  const c = cfg[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-2xs font-mono uppercase tracking-wide ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function CaseCard({ caseData, onClick, view = 'list' }: CaseCardProps) {
  const [hovered, setHovered] = useState(false);

  const incidentLine = caseData.incidentAt
    ? `Incident: ${formatDate(caseData.incidentAt)}`
    : null;

  if (view === 'grid') {
    return (
      <button
        className={`
          group relative w-full text-left rounded-lg border
          bg-surface-01 border-border-subtle
          transition-all duration-200 ease-out
          hover:border-border-default hover:bg-surface-02
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
          p-5
        `}
        onClick={() => onClick?.(caseData)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Accent left bar */}
        <span
          className={`
            absolute left-0 top-4 bottom-4 w-0.5 rounded-full
            transition-all duration-200
            ${hovered ? 'bg-accent opacity-100' : 'opacity-0'}
          `}
        />

        {/* Top row: ID + status + priority */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <MonoLabel>{caseData.id}</MonoLabel>
            <PriorityPip priority={caseData.priority} />
          </div>
          <Badge variant={caseData.status} />
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-text-primary mb-1 leading-snug line-clamp-2">
          {caseData.title}
        </h3>

        {/* Incident line */}
        {incidentLine && (
          <p className="flex items-center gap-1 text-2xs text-text-tertiary mb-2">
            <AlertTriangle size={10} className="shrink-0" />
            {incidentLine}
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-text-tertiary leading-relaxed mb-4 line-clamp-2">
          {caseData.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Camera size={12} className="text-text-tertiary" />
            {caseData.cameraCount} cameras
          </span>
          <span className="flex items-center gap-1">
            <FolderOpen size={12} className="text-text-tertiary" />
            {caseData.evidenceCount} evidence
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
          <span className="flex items-center gap-1 text-xs text-text-tertiary">
            <Clock size={11} />
            {formatRelativeTime(caseData.updatedAt)}
          </span>
          <span
            className={`
              text-xs text-text-tertiary transition-colors duration-150
              ${hovered ? 'text-accent' : ''}
            `}
          >
            <ChevronRight size={14} />
          </span>
        </div>
      </button>
    );
  }

  // ── List view ──
  return (
    <button
      className={`
        group relative w-full text-left rounded-lg border
        bg-surface-01 border-border-subtle
        transition-all duration-200 ease-out
        hover:border-border-default hover:bg-surface-02
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
        px-5 py-4
      `}
      onClick={() => onClick?.(caseData)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent left bar */}
      <span
        className={`
          absolute left-0 top-3 bottom-3 w-0.5 rounded-full
          transition-all duration-200
          ${hovered ? 'bg-accent opacity-100' : 'opacity-0'}
        `}
      />

      <div className="flex items-center gap-5">
        {/* ID + Title + incident */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1">
            <MonoLabel className="shrink-0">{caseData.id}</MonoLabel>
            <Badge variant={caseData.status} />
            <PriorityPip priority={caseData.priority} />
          </div>
          <h3 className="text-sm font-medium text-text-primary truncate">
            {caseData.title}
          </h3>
          {incidentLine && (
            <p className="flex items-center gap-1 text-2xs text-text-tertiary mt-0.5">
              <AlertTriangle size={10} className="shrink-0" />
              {incidentLine}
            </p>
          )}
        </div>

        {/* Meta columns */}
        <div className="hidden md:flex items-center gap-6 shrink-0 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <Camera size={12} className="text-text-tertiary" />
            <span>{caseData.cameraCount} cameras</span>
          </span>
          <span className="flex items-center gap-1.5">
            <FolderOpen size={12} className="text-text-tertiary" />
            <span>{caseData.evidenceCount} evidence</span>
          </span>
          <span className="flex items-center gap-1.5 w-32 text-right">
            <Clock size={11} className="text-text-tertiary shrink-0" />
            <span className="truncate">{formatRelativeTime(caseData.updatedAt)}</span>
          </span>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={16}
          className={`
            shrink-0 text-text-tertiary transition-all duration-150
            ${hovered ? 'text-accent translate-x-0.5' : ''}
          `}
        />
      </div>

      {/* Mobile meta */}
      <div className="flex md:hidden items-center gap-4 mt-2 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Camera size={11} />
          {caseData.cameraCount}
        </span>
        <span className="flex items-center gap-1">
          <FolderOpen size={11} />
          {caseData.evidenceCount}
        </span>
        <span className="flex items-center gap-1 text-text-tertiary ml-auto">
          <Clock size={11} />
          {formatRelativeTime(caseData.updatedAt)}
        </span>
      </div>
    </button>
  );
}
