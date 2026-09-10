import { useState } from 'react';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  Bookmark,
  FileCheck,
  Sliders,
  Scan,
} from 'lucide-react';
import type { DetectionEvent } from '../../types/investigation';
import { Button, MonoLabel } from '../ui/primitives';

interface DetectionInspectionModalProps {
  detection: DetectionEvent | null;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onToggleFlagReport?: (id: string) => void;
}

export function DetectionInspectionModal({
  detection,
  onClose,
  onToggleBookmark,
  onToggleFlagReport,
}: DetectionInspectionModalProps) {
  if (!detection) return null;

  const [showBox, setShowBox] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);
  const [notes, setNotes] = useState(detection.notes ?? '');
  const [isFlagged, setIsFlagged] = useState(detection.flaggedForReport);

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(detection.sha256Snapshot);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleToggleFlag = () => {
    setIsFlagged(!isFlagged);
    onToggleFlagReport?.(detection.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-surface-01 border border-border-default rounded-2xl shadow-modal overflow-hidden animate-modal flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-02/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-dim border border-accent/30 flex items-center justify-center">
              <Scan size={16} className="text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <MonoLabel className="text-accent">{detection.id}</MonoLabel>
                <span className="text-xs font-semibold text-text-primary">
                  {detection.label}
                </span>
              </div>
              <p className="text-2xs text-text-tertiary mt-0.5">
                Case: {detection.caseId} • Frame #{detection.frameNumber} • Channel {detection.cameraChannel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(detection.id)}
              className={`p-2 rounded-lg border transition-colors ${
                detection.isBookmarked
                  ? 'bg-amber/15 text-amber border-amber/30'
                  : 'bg-surface-02 text-text-tertiary hover:text-text-primary border-border-subtle'
              }`}
              title="Bookmark detection"
            >
              <Bookmark size={15} className={detection.isBookmarked ? 'fill-current' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-02 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Modal Content: 2-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto flex-1">
          {/* Left Column: Visual CCTV Frame (7 cols) */}
          <div className="lg:col-span-7 p-6 bg-surface-base flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border-subtle">
            <div>
              {/* CCTV Viewport */}
              <div className="relative w-full aspect-video rounded-xl bg-black border border-border-default overflow-hidden select-none">
                {/* Background simulation */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${detection.svgThumbnailBg} opacity-85`}
                />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                {/* Bounding Box */}
                {showBox && (
                  <div
                    className="absolute border-2 border-accent rounded-sm transition-all"
                    style={{
                      left: `${detection.boundingBox.x}%`,
                      top: `${detection.boundingBox.y}%`,
                      width: `${detection.boundingBox.width}%`,
                      height: `${detection.boundingBox.height}%`,
                      boxShadow: '0 0 16px rgba(79, 126, 247, 0.6)',
                    }}
                  >
                    <div className="absolute -top-5 left-0 px-2 py-0.5 rounded bg-accent text-white font-mono text-3xs uppercase font-bold tracking-wider">
                      {detection.targetType} ({(detection.confidence * 100).toFixed(0)}%)
                    </div>
                  </div>
                )}

                {/* OSD Watermark Readouts */}
                <div className="absolute top-3 left-3 flex flex-col gap-0.5 font-mono text-3xs text-green drop-shadow-md">
                  <span>REC • {detection.cameraChannel} [{detection.cameraLocation}]</span>
                  <span>RAW CAM: {new Date(detection.timestamp).toISOString()}</span>
                  <span className="text-accent-hover">
                    CALIBRATED NTP: {new Date(detection.calibratedTimestamp).toISOString()}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 font-mono text-3xs text-white/80">
                  FRAME #{detection.frameNumber} • 1920×1080 FHD
                </div>
              </div>

              {/* Viewport Toolbar */}
              <div className="flex items-center justify-between mt-3 text-xs">
                <button
                  onClick={() => setShowBox(!showBox)}
                  className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary"
                >
                  <Sliders size={13} className="text-accent" />
                  <span>{showBox ? 'Hide Bounding Box' : 'Show Bounding Box'}</span>
                </button>
                <span className="font-mono text-3xs text-text-tertiary">
                  Offset: +{detection.timeOffsetAppliedMs}ms
                </span>
              </div>
            </div>

            {/* Frame Hash Admissibility Panel */}
            <div className="mt-5 p-3.5 rounded-xl bg-surface-01 border border-border-subtle">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                  <ShieldCheck size={14} className="text-green" />
                  <span>Frame Hash (SHA-256 Snapshot)</span>
                </div>
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-2xs text-accent hover:text-accent-hover font-mono"
                >
                  {copiedHash ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                  <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
              <p className="font-mono text-3xs text-text-secondary break-all bg-surface-base p-2 rounded border border-border-subtle">
                {detection.sha256Snapshot}
              </p>
            </div>
          </div>

          {/* Right Column: AI Analysis & Investigator Log (5 cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Confidence Score Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                  <span className="text-text-secondary">AI Neural Confidence</span>
                  <span className="font-mono text-accent font-bold">
                    {(detection.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-02 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-green rounded-full"
                    style={{ width: `${detection.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Attributes Grid */}
              <div>
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono mb-2">
                  Extracted Attributes
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface-02 border border-border-subtle">
                    <span className="text-3xs text-text-tertiary block font-mono">PRIMARY COLOR</span>
                    <span className="font-medium capitalize text-text-primary">
                      {detection.attributes.color ?? 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-02 border border-border-subtle">
                    <span className="text-3xs text-text-tertiary block font-mono">DIRECTION</span>
                    <span className="font-medium text-text-primary">
                      {detection.attributes.direction ?? 'Stationary'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-02 border border-border-subtle">
                    <span className="text-3xs text-text-tertiary block font-mono">VELOCITY</span>
                    <span className="font-medium text-text-primary">
                      {detection.attributes.velocityEstimate ?? 'Normal Pace'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-02 border border-border-subtle">
                    <span className="text-3xs text-text-tertiary block font-mono">DEMOGRAPHICS</span>
                    <span className="font-medium text-text-primary">
                      {detection.attributes.genderEstimate ?? 'Unknown'} ({detection.attributes.ageEstimate ?? 'N/A'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1.5">
                  Investigator Log Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record forensic observations or cross-reference FIR notes..."
                  className="w-full bg-surface-base border border-border-subtle rounded-lg p-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent font-sans"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border-subtle space-y-3">
              <button
                onClick={handleToggleFlag}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  isFlagged
                    ? 'bg-green-dim text-green border-green/30'
                    : 'bg-surface-02 text-text-secondary hover:text-text-primary border-border-subtle'
                }`}
              >
                <FileCheck size={14} />
                <span>{isFlagged ? '✓ Included in Section 65B Report' : 'Flag for Court Report'}</span>
              </button>

              <Button variant="secondary" size="sm" className="w-full" onClick={onClose}>
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
