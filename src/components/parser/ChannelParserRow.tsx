import {
  Clock,
  Key,
  RotateCw,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import type { ParserJob } from '../../types/parser';
import { FormatBadge } from '../forensics/FormatBadge';
import { MonoLabel } from '../ui/primitives';

interface ChannelParserRowProps {
  job: ParserJob;
  isActive: boolean;
  onSelect: (job: ParserJob) => void;
  onReparse: (job: ParserJob) => void;
  onViewSummary: (job: ParserJob) => void;
}

export function ChannelParserRow({
  job,
  isActive,
  onSelect,
  onReparse,
  onViewSummary,
}: ChannelParserRowProps) {
  const hasSkew = Math.abs(job.timestampOffsetMs) > 100;

  return (
    <div
      onClick={() => onSelect(job)}
      className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
        isActive
          ? 'bg-surface-02 border-accent shadow-sm ring-1 ring-accent/30'
          : 'bg-surface-01 border-border-subtle hover:bg-surface-02/70 hover:border-border-default'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left column: Channel ID, filename, vendor */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <MonoLabel className="text-accent font-bold">{job.evidenceId}</MonoLabel>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-03 border border-border-subtle text-text-primary">
              {job.cameraChannel}
            </span>
            <FormatBadge
              vendor={job.vendor}
              container={job.container}
              size="sm"
              showConfidence={false}
            />
            {hasSkew ? (
              <span className="inline-flex items-center gap-1 text-2xs font-mono text-amber bg-amber/10 border border-amber/20 px-2 py-0.5 rounded">
                <AlertTriangle size={11} />
                Skew Corrected ({job.timestampOffsetMs > 0 ? '+' : ''}{job.timestampOffsetMs}ms)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-2xs font-mono text-green bg-green/10 border border-green/20 px-2 py-0.5 rounded">
                <Clock size={11} />
                Sync Locked (Δt &lt; 50ms)
              </span>
            )}
          </div>

          <p className="text-xs font-mono text-text-primary font-medium truncate">
            {job.filename}
          </p>
        </div>

        {/* Middle column: Frame extraction counters & Progress */}
        <div className="flex items-center gap-6 text-xs font-mono shrink-0">
          <div>
            <span className="text-2xs text-text-tertiary uppercase block">Frames Decoded</span>
            <span className="text-text-primary font-semibold">
              {job.framesExtracted.toLocaleString()} / {job.totalFrames.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-2xs text-text-tertiary uppercase block flex items-center gap-1">
              <Key size={10} className="text-accent" /> Keyframes
            </span>
            <span className="text-text-primary font-semibold">
              {job.keyframesCount.toLocaleString()} IDR
            </span>
          </div>

          <div className="min-w-[120px]">
            <div className="flex items-center justify-between text-2xs mb-1">
              <span className="text-text-tertiary">Progress</span>
              <span className="text-green font-semibold">{job.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-03 rounded-full overflow-hidden">
              <div
                className="h-full bg-green rounded-full transition-all duration-300"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right column: Action buttons */}
        <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border-subtle/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewSummary(job);
            }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-surface-03 hover:bg-surface-02 border border-border-subtle text-xs text-text-secondary hover:text-text-primary transition-colors"
            title="View Normalized Repack Stream Specs"
          >
            <Eye size={13} />
            <span>Repack Specs</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onReparse(job);
            }}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-surface-03 hover:bg-surface-02 border border-border-subtle text-xs text-text-secondary hover:text-accent transition-colors"
            title="Re-run Forensic Normalization Pipeline"
          >
            <RotateCw size={13} className={job.status === 'running' ? 'animate-spin text-accent' : ''} />
            <span>Re-Parse</span>
          </button>
        </div>
      </div>
    </div>
  );
}
