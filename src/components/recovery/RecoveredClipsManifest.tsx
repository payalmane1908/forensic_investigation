import {
  FileVideo,
  CheckCircle2,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import type { RecoveredClip } from '../../types/recovery';
import { formatBytes } from '../../utils/format';
import { Button, MonoLabel } from '../ui/primitives';

interface RecoveredClipsManifestProps {
  clips: RecoveredClip[];
  selectedClipId: string;
  onSelectClip: (id: string) => void;
  onPromoteClip: (clip: RecoveredClip) => void;
  promotedClipIds?: Set<string>;
}

export function RecoveredClipsManifest({
  clips,
  selectedClipId,
  onSelectClip,
  onPromoteClip,
  promotedClipIds,
}: RecoveredClipsManifestProps) {
  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <FileVideo size={16} className="text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-text-primary">
            4. Recovered Video Fragments Manifest ({clips.length} Clips)
          </h3>
        </div>
        <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-text-tertiary">
          Carved Streams
        </span>
      </div>

      <div className="space-y-3">
        {clips.map((clip) => {
          const isSelected = clip.id === selectedClipId;
          const isPromoted = clip.isPromoted || (promotedClipIds?.has(clip.id) ?? false);

          return (
            <div
              key={clip.id}
              onClick={() => onSelectClip(clip.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-accent/10 border-accent shadow-sm'
                  : 'bg-surface-02/70 border-border-subtle hover:border-border-default hover:bg-surface-02'
              }`}
            >
              {/* Row 1: ID, Channel, Confidence Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <MonoLabel className={isSelected ? 'text-accent font-bold' : 'text-text-primary'}>
                    {clip.id}
                  </MonoLabel>
                  <span className="text-xs font-semibold text-text-primary">
                    {clip.channelName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-3xs font-mono px-2 py-0.5 rounded-full bg-surface-01 border border-border-subtle text-text-secondary">
                    LBA: {clip.lbaStart} → {clip.lbaEnd}
                  </span>
                  <span
                    className={`text-2xs font-mono font-bold px-2 py-0.5 rounded border ${
                      clip.confidence.overallScore >= 90
                        ? 'bg-green/10 text-green border-green/30'
                        : 'bg-amber/10 text-amber border-amber/30'
                    }`}
                  >
                    {clip.confidence.overallScore}% Confidence
                  </span>
                </div>
              </div>

              {/* Row 2: Timestamps, Duration, FileSize, Codec */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-3xs font-mono text-text-secondary pt-1 border-t border-border-subtle/50">
                <div>
                  <span className="text-text-tertiary block">Time Range</span>
                  <span className="text-text-primary truncate block">
                    {new Date(clip.startTime).toLocaleTimeString()} – {new Date(clip.endTime).toLocaleTimeString()}
                  </span>
                </div>

                <div>
                  <span className="text-text-tertiary block">Duration &amp; Frames</span>
                  <span className="text-text-primary block">
                    {Math.floor(clip.durationSeconds / 60)}m {clip.durationSeconds % 60}s ({clip.frameCount.toLocaleString()} f)
                  </span>
                </div>

                <div>
                  <span className="text-text-tertiary block">Volume &amp; Codec</span>
                  <span className="text-text-primary block">
                    {formatBytes(clip.fileSize)} • {clip.resolution.split(' ')[0]}
                  </span>
                </div>

                <div>
                  <span className="text-text-tertiary block">Filesystem</span>
                  <span className="text-accent font-semibold block">{clip.filesystem} Carved</span>
                </div>
              </div>

              {/* Row 3: Promotion Action */}
              <div className="pt-2 border-t border-border-subtle/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-3xs font-mono text-text-tertiary">
                  <ShieldCheck size={12} className="text-green" />
                  <span className="truncate max-w-[280px]">SHA-256: {clip.sha256}</span>
                </div>

                {isPromoted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-2xs font-mono font-semibold bg-green/15 text-green border border-green/30">
                    <CheckCircle2 size={12} />
                    Registered as Case Evidence
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPromoteClip(clip);
                    }}
                    icon={<Plus size={12} />}
                    id={`promote-clip-${clip.id}`}
                  >
                    Register as Case Evidence
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
