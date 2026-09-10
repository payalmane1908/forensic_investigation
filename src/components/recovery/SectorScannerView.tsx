import {
  Activity,
  Hash,
} from 'lucide-react';
import type { SectorScanMetrics } from '../../types/recovery';
import { formatBytes } from '../../utils/format';

interface SectorScannerViewProps {
  metrics: SectorScanMetrics | null;
  isScanning: boolean;
}

export function SectorScannerView({
  metrics,
  isScanning,
}: SectorScannerViewProps) {
  if (!metrics) {
    return (
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm text-center">
        <Activity size={20} className="text-accent animate-pulse mx-auto mb-2" />
        <p className="text-xs font-mono text-text-secondary">Initializing raw disk sector scanner...</p>
      </div>
    );
  }

  const progressPct = Math.round((metrics.currentLba / (metrics.totalLba || 1)) * 100);

  // Generate sector heatmap cluster blocks
  const clusterCount = 36;
  const activeClusterIndex = Math.floor((metrics.currentLba / (metrics.totalLba || 1)) * clusterCount);

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-accent animate-pulse" />
          <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-text-primary">
            2. Low-Level Sector Scanner &amp; GOP Reconstructor
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-text-tertiary">
            LBA Address: 0x{metrics.currentLba.toString(16).toUpperCase().padStart(8, '0')}
          </span>
          <span className="text-xs font-mono font-bold text-accent">
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Progress Bar & LBA Extent */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full bg-surface-base border border-border-subtle overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-3xs font-mono text-text-tertiary">
          <span>Scanned: {formatBytes(metrics.scannedBytes)}</span>
          <span>Sectors: {metrics.currentLba.toLocaleString()} / {metrics.totalLba.toLocaleString()} LBA</span>
        </div>
      </div>

      {/* Visual Cluster Heatmap */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-3xs font-mono text-text-tertiary">
          <span>Physical Cluster Heatmap (512B Sectors)</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green" /> Recovered</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber" /> Fragmented</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-surface-03" /> Unscanned</span>
          </span>
        </div>

        <div className="grid grid-cols-18 gap-1 p-2.5 rounded-lg bg-surface-base border border-border-subtle">
          {Array.from({ length: clusterCount }).map((_, idx) => {
            const isScanned = idx <= activeClusterIndex;
            const isCurrent = idx === activeClusterIndex && isScanning;
            const isRecovered = isScanned && idx % 3 === 0;
            const isFragmented = isScanned && idx % 5 === 0;

            let bg = 'bg-surface-03/60';
            if (isCurrent) bg = 'bg-accent animate-ping';
            else if (isRecovered) bg = 'bg-green/80';
            else if (isFragmented) bg = 'bg-amber/80';
            else if (isScanned) bg = 'bg-blue-500/50';

            return (
              <div
                key={idx}
                className={`h-4 rounded-xs transition-colors ${bg}`}
                title={`Cluster block ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* NAL Unit Discovery Matrix */}
      <div className="space-y-2">
        <h4 className="text-2xs font-mono uppercase tracking-wider text-text-tertiary">
          Identified NAL Unit Headers &amp; Candidate GOPs
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="p-3 rounded-lg bg-surface-02 border border-border-subtle text-center">
            <p className="text-3xs font-mono uppercase text-text-tertiary">SPS (Config)</p>
            <p className="text-base font-bold font-mono text-accent mt-0.5">{metrics.nalDistribution.spsCount}</p>
            <p className="text-3xs font-mono text-text-tertiary">0x67 Headers</p>
          </div>

          <div className="p-3 rounded-lg bg-surface-02 border border-border-subtle text-center">
            <p className="text-3xs font-mono uppercase text-text-tertiary">PPS (Picture)</p>
            <p className="text-base font-bold font-mono text-accent mt-0.5">{metrics.nalDistribution.ppsCount}</p>
            <p className="text-3xs font-mono text-text-tertiary">0x68 Headers</p>
          </div>

          <div className="p-3 rounded-lg bg-surface-02 border border-border-subtle text-center">
            <p className="text-3xs font-mono uppercase text-text-tertiary">IDR Keyframes</p>
            <p className="text-base font-bold font-mono text-green mt-0.5">{metrics.nalDistribution.idrCount}</p>
            <p className="text-3xs font-mono text-text-tertiary">0x65 Slices</p>
          </div>

          <div className="p-3 rounded-lg bg-surface-02 border border-border-subtle text-center">
            <p className="text-3xs font-mono uppercase text-text-tertiary">SEI (Timestamps)</p>
            <p className="text-base font-bold font-mono text-purple-400 mt-0.5">{metrics.nalDistribution.seiCount}</p>
            <p className="text-3xs font-mono text-text-tertiary">0x06 OSD Sync</p>
          </div>

          <div className="p-3 rounded-lg bg-surface-02 border border-border-subtle text-center">
            <p className="text-3xs font-mono uppercase text-text-tertiary">Rebuilt GOPs</p>
            <p className="text-base font-bold font-mono text-amber mt-0.5">{metrics.reconstructedGops}</p>
            <p className="text-3xs font-mono text-text-tertiary">Candidate Sequences</p>
          </div>
        </div>
      </div>

      {/* Real-time Sector Byte Feed */}
      <div className="p-3 rounded-lg bg-surface-base border border-border-subtle space-y-1 font-mono text-3xs text-text-tertiary">
        <div className="flex justify-between items-center text-text-secondary pb-1 border-b border-border-subtle/50">
          <span className="flex items-center gap-1">
            <Hash size={11} /> Real-time Traversal Stream (Raw Sector Readout)
          </span>
          <span className="text-green text-3xs">BYTE-STREAM PARSER ACTIVE</span>
        </div>
        {metrics.currentSectorHex.map((line, i) => (
          <p key={i} className="truncate text-text-secondary">{line}</p>
        ))}
      </div>
    </div>
  );
}
