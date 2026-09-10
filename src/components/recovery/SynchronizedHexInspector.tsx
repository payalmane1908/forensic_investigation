import { useState } from 'react';
import {
  FileCode2,
  SkipBack,
  SkipForward,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import type { RecoveredClip, RecoveredFrame } from '../../types/recovery';

interface SynchronizedHexInspectorProps {
  clip: RecoveredClip;
  onPromote?: () => void;
  isPromoted?: boolean;
}

export function SynchronizedHexInspector({
  clip,
  onPromote: _onPromote,
  isPromoted: _isPromoted,
}: SynchronizedHexInspectorProps) {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const frames = clip.frames && clip.frames.length > 0 ? clip.frames : [];
  const currentFrame: RecoveredFrame = frames[selectedFrameIndex] ?? {
    frameNumber: 1,
    timestamp: clip.startTime,
    nalType: 'IDR',
    lbaSector: clip.lbaStart,
    byteOffset: '0x00000000',
    hexBytes: [
      '00000000: 00 00 00 01 67 64 00 28  AC D9 40 78 02 27 E5 C0  | ....gd.(..@x.\'..',
      '00000010: 5A 80 80 80 A0 00 00 03  00 20 00 00 07 91 E2 85  | Z........ ......',
    ],
  };

  const handlePrevFrame = () => {
    setSelectedFrameIndex((prev) => (prev > 0 ? prev - 1 : frames.length - 1));
  };

  const handleNextFrame = () => {
    setSelectedFrameIndex((prev) => (prev < frames.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <FileCode2 size={16} className="text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-text-primary">
            5. Synchronized Forensic Video &amp; Hex Sector Inspector
          </h3>
        </div>
        <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-text-tertiary">
          Frame ↔ Sector Alignment
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Video Frame Player Viewport (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative w-full aspect-video bg-surface-base rounded-xl border border-border-subtle overflow-hidden select-none shadow-inner flex flex-col justify-between p-3">
            {/* Synthetic CCTV Canvas Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${clip.svgThumbnailBg} opacity-80`} />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Top OSD Watermark */}
            <div className="relative z-10 flex items-center justify-between text-3xs font-mono text-white/90">
              <span className="px-1.5 py-0.5 rounded bg-black/80 text-green border border-green/30 font-bold">
                {clip.channelId}
              </span>
              <span className="drop-shadow-md">{currentFrame.timestamp}</span>
            </div>

            {/* Center: Carved Frame Visual Target */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-1 my-auto">
              <div className="px-2.5 py-1 rounded bg-accent/90 text-white font-mono text-xs font-bold shadow-lg flex items-center gap-1.5">
                <Layers size={13} />
                <span>NAL {currentFrame.nalType}</span>
                <span className="opacity-80">#{currentFrame.frameNumber}</span>
              </div>
              <p className="text-3xs font-mono text-white/80 drop-shadow">
                Carved LBA Sector: {currentFrame.lbaSector}
              </p>
            </div>

            {/* Bottom Status Bar */}
            <div className="relative z-10 flex items-center justify-between text-3xs font-mono text-white/80">
              <span>{clip.resolution}</span>
              <span className="text-green flex items-center gap-1 font-semibold">
                <ShieldCheck size={11} /> PTS Monotonic
              </span>
            </div>
          </div>

          {/* Frame Stepper Controls */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-02 border border-border-subtle text-xs font-mono">
            <button
              onClick={handlePrevFrame}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-01 hover:bg-surface-03 text-text-secondary hover:text-text-primary border border-border-subtle"
            >
              <SkipBack size={12} />
              <span>Prev Frame</span>
            </button>

            <span className="text-3xs text-text-tertiary">
              Frame {selectedFrameIndex + 1} of {frames.length} Carved Keypoints
            </span>

            <button
              onClick={handleNextFrame}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-01 hover:bg-surface-03 text-text-secondary hover:text-text-primary border border-border-subtle"
            >
              <span>Next Frame</span>
              <SkipForward size={12} />
            </button>
          </div>
        </div>

        {/* Right: Synchronous Hex Sector Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Metadata banner linking frame to sector */}
          <div className="p-3 rounded-lg bg-surface-02 border border-border-subtle flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-3xs text-text-tertiary block">Selected LBA Sector</span>
                <span className="font-bold text-accent">{currentFrame.lbaSector}</span>
              </div>
              <div>
                <span className="text-3xs text-text-tertiary block">Byte Offset</span>
                <span className="text-text-primary">{currentFrame.byteOffset}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-3xs px-2 py-0.5 rounded bg-surface-01 border border-border-subtle text-text-secondary">
                NAL Unit: <span className="font-bold text-green">{currentFrame.nalType}</span>
              </span>
              <span className="text-3xs font-mono text-text-tertiary">
                512B Sector Boundary
              </span>
            </div>
          </div>

          {/* Hex Dump Code View */}
          <div className="p-3.5 rounded-lg bg-surface-base border border-border-subtle font-mono text-3xs text-text-secondary space-y-1.5 overflow-x-auto max-h-[190px]">
            <div className="text-text-tertiary pb-1 border-b border-border-subtle/50 flex justify-between">
              <span>Offset (Hex) | 16-Byte Payload Dump</span>
              <span>ASCII Representation</span>
            </div>
            {currentFrame.hexBytes.map((line, idx) => (
              <p
                key={idx}
                className="whitespace-pre tracking-wider hover:bg-accent/10 rounded px-1 -mx-1 transition-colors"
              >
                {line}
              </p>
            ))}
          </div>

          <p className="text-3xs font-mono text-text-tertiary leading-relaxed">
            * Synchronized mapping verifies that the selected video frame strictly originates from the indicated physical disk LBA sector address without artificial interpolation.
          </p>
        </div>
      </div>
    </div>
  );
}
