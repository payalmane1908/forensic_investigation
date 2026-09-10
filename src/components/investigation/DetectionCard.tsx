import {
  Clock,
  Bookmark,
  ShieldCheck,
  Maximize2,
  ArrowUpRight,
  Scan,
  Pin,
} from 'lucide-react';
import type { DetectionEvent } from '../../types/investigation';

interface DetectionCardProps {
  detection: DetectionEvent;
  onInspect: (detection: DetectionEvent) => void;
  onToggleBookmark: (id: string) => void;
  isInvestigationActive?: boolean;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
}

export function DetectionCard({
  detection,
  onInspect,
  onToggleBookmark,
  isInvestigationActive = false,
  isPinned = false,
  onTogglePin,
}: DetectionCardProps) {
  const { boundingBox, attributes } = detection;

  return (
    <div className="group relative bg-surface-01 border border-border-subtle hover:border-accent/40 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-card flex flex-col">
      {/* ── Frame Visual Simulation (CCTV Viewport) ── */}
      <div className="relative w-full aspect-video bg-surface-base overflow-hidden select-none cursor-pointer" onClick={() => onInspect(detection)}>
        {/* Synthetic CCTV Canvas Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${detection.svgThumbnailBg} opacity-80`} />
        
        {/* Subtle CCTV grid & scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        {/* Live OSD Watermark Overlay */}
        <div className="absolute top-2 left-2.5 flex items-center gap-2 pointer-events-none">
          <span className="font-mono text-3xs font-semibold px-1.5 py-0.5 rounded bg-black/75 text-green border border-green/30 tracking-wider">
            {detection.cameraChannel}
          </span>
          <span className="font-mono text-3xs text-white/90 drop-shadow-md">
            {new Date(detection.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
          </span>
        </div>

        {/* Top-Right Pin Action (Investigation Context Only) */}
        {isInvestigationActive && onTogglePin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(detection.id);
            }}
            className={`absolute top-2 right-9 p-1.5 rounded-md backdrop-blur-md transition-all ${
              isPinned
                ? 'bg-accent text-white shadow-md'
                : 'bg-black/60 text-white/70 hover:text-white hover:bg-black/90'
            }`}
            title={isPinned ? 'Remove from Investigation' : 'Pin to Investigation'}
            id={`pin-btn-${detection.id}`}
          >
            <Pin size={13} className={isPinned ? 'fill-current rotate-45' : ''} />
          </button>
        )}

        {/* Top-Right Quick Bookmark Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(detection.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-md backdrop-blur-md transition-all ${
            detection.isBookmarked
              ? 'bg-amber text-black shadow-md'
              : 'bg-black/60 text-white/70 hover:text-white hover:bg-black/90'
          }`}
          title={detection.isBookmarked ? 'Bookmarked' : 'Bookmark as Exhibit'}
        >
          <Bookmark size={13} className={detection.isBookmarked ? 'fill-current' : ''} />
        </button>

        {/* Target Bounding Box Overlay */}
        <div
          className="absolute border-2 border-accent/90 rounded-sm shadow-sm transition-all group-hover:border-accent"
          style={{
            left: `${boundingBox.x}%`,
            top: `${boundingBox.y}%`,
            width: `${boundingBox.width}%`,
            height: `${boundingBox.height}%`,
            boxShadow: '0 0 12px rgba(79, 126, 247, 0.45)',
          }}
        >
          {/* Target category tag floating on top of box */}
          <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-accent text-white font-mono text-3xs uppercase font-bold tracking-wider flex items-center gap-1 shadow">
            <Scan size={9} />
            <span>{detection.targetType}</span>
            <span className="opacity-80">{(detection.confidence * 100).toFixed(0)}%</span>
          </div>

          {/* Corner brackets */}
          <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white pointer-events-none" />
        </div>

        {/* Bottom Bar on Frame */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-3xs font-mono text-white/80 pointer-events-none">
          <span className="truncate max-w-[65%] drop-shadow">
            LOC: {detection.cameraLocation}
          </span>
          <span className="text-accent-hover drop-shadow">
            FRAME #{detection.frameNumber}
          </span>
        </div>

        {/* Hover inspect prompt */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-surface-02/90 border border-border-default text-text-primary text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
            <Maximize2 size={13} className="text-accent" />
            <span>Inspect Forensic Frame</span>
          </div>
        </div>
      </div>

      {/* ── Metadata Body ── */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Label & Confidence */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-1">
              {detection.label}
            </h4>
            <span
              className={`shrink-0 text-2xs font-mono font-bold px-1.5 py-0.5 rounded border ${
                detection.confidence >= 0.95
                  ? 'bg-green-dim text-green border-green/20'
                  : 'bg-accent-dim text-accent border-accent/20'
              }`}
            >
              {(detection.confidence * 100).toFixed(0)}% Match
            </span>
          </div>

          {/* Time & Calibration status */}
          <div className="flex items-center gap-1.5 text-2xs text-text-secondary font-mono mb-2.5">
            <Clock size={11} className="text-text-tertiary" />
            <span>
              {new Date(detection.calibratedTimestamp).toLocaleTimeString('en-GB', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <span className="text-text-tertiary">|</span>
            <span className="text-text-tertiary">RTC Sync: +{detection.timeOffsetAppliedMs}ms</span>
          </div>

          {/* Attributes Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {attributes.clothing && (
              <span className="px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-text-secondary text-3xs font-medium">
                {attributes.clothing}
              </span>
            )}
            {attributes.direction && (
              <span className="px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-accent text-3xs font-medium">
                {attributes.direction}
              </span>
            )}
            {attributes.plateNumber && (
              <span className="px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-green font-mono text-3xs font-bold">
                {attributes.plateNumber}
              </span>
            )}
            {attributes.velocityEstimate && (
              <span className="px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-amber text-3xs font-medium">
                {attributes.velocityEstimate}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2.5 border-t border-border-subtle/50 flex items-center justify-between text-2xs">
          <div className="flex items-center gap-1 text-text-tertiary">
            <ShieldCheck size={12} className="text-green" />
            <span className="font-mono">SHA-256 Verified</span>
          </div>
          <div className="flex items-center gap-2.5">
            {isInvestigationActive && onTogglePin && (
              <button
                onClick={() => onTogglePin(detection.id)}
                className={`flex items-center gap-1 font-medium transition-colors ${
                  isPinned
                    ? 'text-accent hover:text-accent-hover'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title={isPinned ? 'Remove from Investigation' : 'Pin to Investigation'}
              >
                <Pin size={11} className={isPinned ? 'fill-current rotate-45' : ''} />
                <span>{isPinned ? 'Pinned' : 'Pin'}</span>
              </button>
            )}
            <button
              onClick={() => onInspect(detection)}
              className="text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            >
              <span>Analyze</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
