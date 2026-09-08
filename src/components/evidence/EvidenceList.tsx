import { useState } from 'react';
import {
  Film,
  Copy,
  Check,
  ChevronRight,
  Camera,
  Clock,
} from 'lucide-react';
import type { EvidenceItem, EvidenceStatus } from '../../types/evidence';
import { Badge, MonoLabel } from '../ui/primitives';
import { FormatBadge } from '../forensics/FormatBadge';
import {
  formatFileSize,
  formatDuration,
  formatDateTime,
  truncateHash,
} from '../../utils/format';

interface EvidenceListProps {
  items: EvidenceItem[];
  onSelect?: (item: EvidenceItem) => void;
}

const EVIDENCE_BADGE_MAP: Record<EvidenceStatus, 'active' | 'processing' | 'closed' | 'critical' | 'neutral'> = {
  queued:   'neutral',
  hashing:  'processing',
  verified: 'active',
  ingested: 'active',
  error:    'critical',
};

const BADGE_LABEL: Record<EvidenceStatus, string> = {
  queued:   'Queued',
  hashing:  'Hashing',
  verified: 'Verified',
  ingested: 'Ingested',
  error:    'Error',
};

function HashCell({ hash }: { hash?: string }) {
  const [copied, setCopied] = useState(false);
  if (!hash) return <span className="text-text-tertiary text-xs font-mono">—</span>;

  const copyHash = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyHash}
      className="flex items-center gap-1.5 group"
      title="Copy full SHA-256"
    >
      <span className="font-mono text-xs text-text-secondary group-hover:text-text-primary transition-colors">
        {truncateHash(hash, 12)}
      </span>
      <span className="text-text-tertiary group-hover:text-accent transition-colors">
        {copied ? <Check size={11} className="text-green" /> : <Copy size={11} />}
      </span>
    </button>
  );
}

export function EvidenceList({ items, onSelect }: EvidenceListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <div className="w-12 h-12 rounded-xl bg-surface-01 border border-border-subtle flex items-center justify-center">
          <Film size={20} className="text-text-tertiary" />
        </div>
        <p className="text-sm text-text-secondary">No evidence registered yet</p>
        <p className="text-xs text-text-tertiary">
          Use the upload zone above to add footage files.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-subtle overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[90px_1fr_110px_90px_90px_100px_32px] items-center gap-3 px-4 py-2.5 bg-surface-02 border-b border-border-subtle">
        {[
          'ID',
          'Filename',
          'Device',
          'Size',
          'Duration',
          'Integrity',
          '',
        ].map((col, i) => (
          <span key={i} className="text-2xs font-medium text-text-tertiary uppercase tracking-wider">
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border-subtle">
        {items.map((item) => (
          <EvidenceRow key={item.id} item={item} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function EvidenceRow({
  item,
  onSelect,
}: {
  item: EvidenceItem;
  onSelect?: (item: EvidenceItem) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="row"
      className={`
        w-full text-left grid grid-cols-[90px_1fr_110px_90px_90px_100px_32px]
        items-center gap-3 px-4 py-3 cursor-pointer
        transition-colors duration-150
        ${hovered ? 'bg-surface-02' : 'bg-surface-01'}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40
      `}
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(item)}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect?.(item); }}
    >
      {/* ID */}
      <MonoLabel className="text-accent">{item.id}</MonoLabel>

      {/* Filename + metadata */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-text-primary truncate font-medium">{item.filename}</p>
          {item.forensicProfile && (
            <FormatBadge
              vendor={item.forensicProfile.vendor}
              container={item.forensicProfile.containerFormat}
              size="sm"
              showConfidence={false}
            />
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-2xs text-text-tertiary">
            <Camera size={10} />
            {item.cameraChannel}
          </span>
          <span className="flex items-center gap-1 text-2xs text-text-tertiary">
            <Clock size={10} />
            {formatDateTime(item.collectionTime)}
          </span>
        </div>
      </div>

      {/* Device type */}
      <div>
        <p className="text-xs text-text-secondary capitalize">
          {item.deviceType.replace('_', ' ')}
        </p>
        <p className="text-2xs text-text-tertiary truncate">{item.deviceModel}</p>
      </div>

      {/* Size */}
      <span className="text-xs font-mono text-text-secondary">
        {formatFileSize(item.fileSize)}
      </span>

      {/* Duration */}
      <span className="text-xs font-mono text-text-secondary">
        {item.duration ? formatDuration(item.duration) : '—'}
      </span>

      {/* Hash + status */}
      <div className="flex flex-col gap-1">
        <Badge
          variant={EVIDENCE_BADGE_MAP[item.status]}
          label={BADGE_LABEL[item.status]}
          dot={false}
        />
        <HashCell hash={item.sha256} />
      </div>

      {/* Arrow */}
      <ChevronRight
        size={14}
        className={`text-text-tertiary transition-all duration-150 ${hovered ? 'text-accent translate-x-0.5' : ''}`}
      />
    </div>
  );
}
