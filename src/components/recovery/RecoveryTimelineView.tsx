import {
  Clock,
  Video,
} from 'lucide-react';
import type { TimelineRegion } from '../../types/recovery';

interface RecoveryTimelineViewProps {
  regions: TimelineRegion[];
  selectedClipId: string;
  onSelectClip: (clipId: string) => void;
}

export function RecoveryTimelineView({
  regions,
  selectedClipId,
  onSelectClip,
}: RecoveryTimelineViewProps) {
  // Group regions by channel
  const channelGroups = Array.from(new Set(regions.map((r) => r.channelId))).map((chId) => ({
    channelId: chId,
    regions: regions.filter((r) => r.channelId === chId),
  }));

  const getRegionStyle = (region: TimelineRegion) => {
    const isSelected = region.clipId && region.clipId === selectedClipId;

    switch (region.type) {
      case 'recovered':
        return isSelected
          ? 'bg-green text-black border-2 border-white shadow-md'
          : 'bg-green/30 text-green border border-green/50 hover:bg-green/40';
      case 'fragmented':
        return isSelected
          ? 'bg-amber text-black border-2 border-white shadow-md'
          : 'bg-amber/30 text-amber border border-amber/50 hover:bg-amber/40';
      case 'corrupted':
        return 'bg-red/20 text-red border border-red/40 cursor-not-allowed opacity-75';
      case 'unrecoverable':
        return 'bg-surface-03/60 text-text-tertiary border border-border-subtle border-dashed cursor-not-allowed opacity-50';
    }
  };

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-text-primary">
            3. Forensic Recovery Timeline (Multi-Channel Reconstruction)
          </h3>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-3xs font-mono text-text-tertiary">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-green/80 border border-green" /> Recovered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber/80 border border-amber" /> Fragmented / Repaired
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-red/60 border border-red" /> Corrupted
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-surface-03 border border-border-subtle border-dashed" /> Overwritten
          </span>
        </div>
      </div>

      {/* Channel Tracks */}
      <div className="space-y-3 pt-1">
        {channelGroups.map((group) => (
          <div
            key={group.channelId}
            className="p-3 rounded-lg bg-surface-02/60 border border-border-subtle/70 space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Video size={13} className="text-accent" />
                <span className="font-bold text-text-primary">{group.channelId}</span>
              </div>
              <span className="text-3xs text-text-tertiary">Timeline Range: 21:00 → 22:30 IST</span>
            </div>

            {/* Time Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {group.regions.map((reg) => (
                <div
                  key={reg.id}
                  onClick={() => reg.clipId && onSelectClip(reg.clipId)}
                  className={`p-2.5 rounded-md text-xs font-mono transition-all flex flex-col justify-between ${getRegionStyle(reg)} ${
                    reg.clipId ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-3xs uppercase">{reg.type}</span>
                    <span className="text-3xs">{reg.startTime} – {reg.endTime}</span>
                  </div>
                  <p className="text-3xs mt-1 truncate font-medium">{reg.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
