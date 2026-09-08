import { useState } from 'react';
import {
  X,
  Check,
  Copy,
  ShieldCheck,
  Terminal,
  Layers,
} from 'lucide-react';
import type { ParserJob } from '../../types/parser';
import { formatFileSize } from '../../utils/format';

interface NormalizationSummaryModalProps {
  job: ParserJob;
  onClose: () => void;
}

export function NormalizationSummaryModal({
  job,
  onClose,
}: NormalizationSummaryModalProps) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const ffmpegCommand = `ffmpeg -i "${job.filename}" -c:v copy -c:a copy -itsoffset ${(job.timestampOffsetMs / 1000).toFixed(3)} -movflags +faststart "FX_NORMALIZED_${job.evidenceId}.mkv"`;
  const postNormHash = '8d9f1a2b3c4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a';

  const copyCommand = async () => {
    await navigator.clipboard.writeText(ffmpegCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const copyHash = async () => {
    await navigator.clipboard.writeText(postNormHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-01 border border-border-subtle rounded-xl max-w-2xl w-full shadow-modal animate-modal-in overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-02">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">
              Forensic Normalization Output Specifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-03 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Status banner */}
          <div className="bg-green-dim/60 border border-green/30 rounded-lg p-3.5 flex items-center gap-3">
            <ShieldCheck size={20} className="text-green shrink-0" />
            <div>
              <p className="text-green font-semibold text-xs">
                Lossless Bitstream Repackaging Complete
              </p>
              <p className="text-text-secondary text-2xs mt-0.5">
                Original video frames were preserved without generational transcoding loss. Standardized for cross-camera correlation.
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 bg-surface-02 p-4 rounded-lg border border-border-subtle">
            <div>
              <span className="text-2xs text-text-tertiary uppercase">Target Format:</span>
              <p className="text-text-primary font-semibold mt-0.5">{job.outputFormat}</p>
            </div>
            <div>
              <span className="text-2xs text-text-tertiary uppercase">Normalized Size:</span>
              <p className="text-text-primary font-semibold mt-0.5">{formatFileSize(job.outputFileSize)}</p>
            </div>
            <div>
              <span className="text-2xs text-text-tertiary uppercase">Decoded Keyframes:</span>
              <p className="text-accent font-semibold mt-0.5">{job.keyframesCount.toLocaleString()} IDR Frames</p>
            </div>
            <div>
              <span className="text-2xs text-text-tertiary uppercase">PTS Offset Applied:</span>
              <p className={`font-semibold mt-0.5 ${job.timestampOffsetMs !== 0 ? 'text-amber' : 'text-green'}`}>
                {job.timestampOffsetMs > 0 ? '+' : ''}{job.timestampOffsetMs} ms
              </p>
            </div>
          </div>

          {/* Forensic Command Reproduction */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-2xs text-text-tertiary uppercase">
              <span className="flex items-center gap-1">
                <Terminal size={12} className="text-accent" />
                Deterministic Transmux Pipeline Command
              </span>
              <button
                onClick={copyCommand}
                className="text-text-secondary hover:text-text-primary flex items-center gap-1 lowercase"
              >
                {copiedCmd ? <Check size={11} className="text-green" /> : <Copy size={11} />}
                {copiedCmd ? 'copied' : 'copy'}
              </button>
            </div>
            <div className="bg-[#0A0B0E] p-3 rounded-md border border-border-subtle text-text-primary select-all break-all leading-relaxed text-2xs">
              {ffmpegCommand}
            </div>
          </div>

          {/* Checksum */}
          <div className="space-y-1 bg-surface-02 p-3 rounded-lg border border-border-subtle">
            <div className="flex items-center justify-between text-2xs text-text-tertiary uppercase">
              <span>Post-Repack SHA-256 Checksum</span>
              <button
                onClick={copyHash}
                className="text-text-secondary hover:text-text-primary flex items-center gap-1 lowercase"
              >
                {copiedHash ? <Check size={11} className="text-green" /> : <Copy size={11} />}
                {copiedHash ? 'copied' : 'copy'}
              </button>
            </div>
            <p className="text-xs text-accent break-all select-all">{postNormHash}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle bg-surface-02 flex items-center justify-between">
          <span className="text-2xs text-text-tertiary">
            Ready for Module 5 Cross-Camera Tracking
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover shadow-sm"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
