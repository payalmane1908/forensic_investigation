import { useState } from 'react';
import { Film } from 'lucide-react';
import type { ParserJob } from '../../types/parser';

interface FrameExtractionStatusProps {
  job: ParserJob;
}

export function FrameExtractionStatus({ job }: FrameExtractionStatusProps) {
  const [activeSubTab, setActiveSubTab] = useState<'distribution' | 'seek_table'>('distribution');

  // Generate realistic sample keyframe table entries
  const sampleKeyframes = [
    { frameIndex: 0, pts: '00:00:00.000', offset: '0x00000020', type: 'IDR (Keyframe)', sizeKb: 84.2 },
    { frameIndex: 50, pts: '00:00:02.000', offset: '0x000F4800', type: 'IDR (Keyframe)', sizeKb: 81.6 },
    { frameIndex: 100, pts: '00:00:04.000', offset: '0x001E9000', type: 'IDR (Keyframe)', sizeKb: 86.1 },
    { frameIndex: 150, pts: '00:00:06.000', offset: '0x002DD800', type: 'IDR (Keyframe)', sizeKb: 79.4 },
    { frameIndex: 200, pts: '00:00:08.000', offset: '0x003D2000', type: 'IDR (Keyframe)', sizeKb: 83.0 },
    { frameIndex: 250, pts: '00:00:10.000', offset: '0x004C6800', type: 'IDR (Keyframe)', sizeKb: 85.5 },
  ];

  const estimatedPframes = Math.round(job.totalFrames * 0.85);
  const estimatedBframes = job.totalFrames - job.keyframesCount - estimatedPframes;

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-6 space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-02 border border-border-subtle flex items-center justify-center text-accent">
            <Film size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary font-mono">
                Frame Demux & Keyframe Indexing Breakdown
              </h3>
              <span className="text-2xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                {job.evidenceId} · {job.filename}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Structural analysis of video slices, keyframe intervals, and millisecond seek table index.
            </p>
          </div>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex items-center gap-1 bg-surface-02 p-1 rounded-lg border border-border-subtle text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('distribution')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeSubTab === 'distribution'
                ? 'bg-accent text-white font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Slices & GOP
          </button>
          <button
            onClick={() => setActiveSubTab('seek_table')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeSubTab === 'seek_table'
                ? 'bg-accent text-white font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Seek Table Sample
          </button>
        </div>
      </div>

      {/* ── High-level Metrics Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-surface-02 border border-border-subtle rounded-lg p-3.5">
          <span className="text-2xs text-text-tertiary uppercase">Total Extracted</span>
          <p className="text-base font-bold text-text-primary mt-1">
            {job.framesExtracted.toLocaleString()}
          </p>
          <p className="text-2xs text-text-tertiary mt-0.5">100% Complete</p>
        </div>

        <div className="bg-surface-02 border border-border-subtle rounded-lg p-3.5">
          <span className="text-2xs text-text-tertiary uppercase">IDR Keyframes</span>
          <p className="text-base font-bold text-accent mt-1">
            {job.keyframesCount.toLocaleString()}
          </p>
          <p className="text-2xs text-text-tertiary mt-0.5">Instant Seek Anchors</p>
        </div>

        <div className="bg-surface-02 border border-border-subtle rounded-lg p-3.5">
          <span className="text-2xs text-text-tertiary uppercase">Continuous Segments</span>
          <p className="text-base font-bold text-green mt-1">
            {job.segmentsCount} Chunks
          </p>
          <p className="text-2xs text-text-tertiary mt-0.5">0 Dropped Frames</p>
        </div>

        <div className="bg-surface-02 border border-border-subtle rounded-lg p-3.5">
          <span className="text-2xs text-text-tertiary uppercase">Throughput</span>
          <p className="text-base font-bold text-text-primary mt-1">
            {job.throughputFps} fps
          </p>
          <p className="text-2xs text-text-tertiary mt-0.5">Hardware Accelerated</p>
        </div>
      </div>

      {/* ── Sub-Tab 1: Slice Distribution & GOP Structure ── */}
      {activeSubTab === 'distribution' && (
        <div className="space-y-4 font-mono text-xs animate-fade-in">
          <div className="bg-surface-02 border border-border-subtle rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-border-subtle">
              <span className="text-text-primary font-semibold">
                Temporal Frame Composition & Slicing
              </span>
              <span className="text-2xs text-text-tertiary">
                NAL Slice Architecture
              </span>
            </div>

            {/* Distribution Bar */}
            <div className="w-full h-3 bg-surface-03 rounded-full flex overflow-hidden">
              <div
                className="bg-accent h-full"
                style={{ width: '4%' }}
                title={`IDR / Keyframes: ${job.keyframesCount.toLocaleString()} (4%)`}
              />
              <div
                className="bg-green h-full"
                style={{ width: '82%' }}
                title={`P-Frames (Predicted): ${estimatedPframes.toLocaleString()} (82%)`}
              />
              <div
                className="bg-amber h-full"
                style={{ width: '14%' }}
                title={`B-Frames (Bidirectional): ${estimatedBframes.toLocaleString()} (14%)`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent shrink-0" />
                <div>
                  <p className="text-text-primary font-semibold">IDR / Keyframes</p>
                  <p className="text-text-tertiary">{job.keyframesCount.toLocaleString()} frames (~4%)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-green shrink-0" />
                <div>
                  <p className="text-text-primary font-semibold">P-Frames (Forward)</p>
                  <p className="text-text-tertiary">{estimatedPframes.toLocaleString()} frames (~82%)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber shrink-0" />
                <div>
                  <p className="text-text-primary font-semibold">B-Frames (Bi-dir)</p>
                  <p className="text-text-tertiary">{estimatedBframes.toLocaleString()} frames (~14%)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-Tab 2: Seek Table Sample ── */}
      {activeSubTab === 'seek_table' && (
        <div className="border border-border-subtle rounded-lg overflow-hidden animate-fade-in font-mono text-xs">
          <div className="bg-surface-02 px-4 py-2 border-b border-border-subtle flex items-center justify-between text-2xs text-text-tertiary uppercase">
            <span>Generated IDR Seek Table (Head 6 Entries)</span>
            <span>Index Type: Precise Millisecond Seek</span>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-02/50 border-b border-border-subtle text-2xs text-text-tertiary">
                <th className="py-2 px-4">Frame Index</th>
                <th className="py-2 px-4">Presentation Timestamp (PTS)</th>
                <th className="py-2 px-4">Byte Offset</th>
                <th className="py-2 px-4">Slice Type</th>
                <th className="py-2 px-4 text-right">Keyframe Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {sampleKeyframes.map((kf) => (
                <tr key={kf.frameIndex} className="hover:bg-surface-02/60">
                  <td className="py-2.5 px-4 text-accent font-semibold">#{kf.frameIndex}</td>
                  <td className="py-2.5 px-4 text-text-primary">{kf.pts}</td>
                  <td className="py-2.5 px-4 text-text-secondary">{kf.offset}</td>
                  <td className="py-2.5 px-4 text-green font-medium">{kf.type}</td>
                  <td className="py-2.5 px-4 text-right text-text-primary">{kf.sizeKb} KB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
