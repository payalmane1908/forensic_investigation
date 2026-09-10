import {
  Lock,
  HardDrive,
  Info,
  ShieldAlert,
  Play,
  Loader2,
} from 'lucide-react';
import type { RecoveryFilesystem, CarveScanMode } from '../../types/recovery';
import type { EvidenceItem } from '../../types/evidence';
import { Button } from '../ui/primitives';

interface RecoverySourceSelectorProps {
  evidenceList: EvidenceItem[];
  selectedSourceId: string;
  onSelectSource: (id: string) => void;
  filesystem: RecoveryFilesystem;
  onSelectFilesystem: (fs: RecoveryFilesystem) => void;
  scanMode: CarveScanMode;
  onSelectScanMode: (mode: CarveScanMode) => void;
  isScanning: boolean;
  onStartScan: () => void;
}

export function RecoverySourceSelector({
  evidenceList,
  selectedSourceId,
  onSelectSource,
  filesystem,
  onSelectFilesystem,
  scanMode,
  onSelectScanMode,
  isScanning,
  onStartScan,
}: RecoverySourceSelectorProps) {
  const selectedEvidence = evidenceList.find((e) => e.id === selectedSourceId) ?? evidenceList[0];

  return (
    <div className="space-y-5">
      {/* ── Prominent Forensic Write-Block & Simulation Notice ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-green/10 border border-green/30 text-green">
          <Lock size={16} className="shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-semibold uppercase tracking-wider font-mono">
              RO-LOCK / FORENSIC WRITE-BLOCK ACTIVE
            </p>
            <p className="text-text-secondary leading-relaxed text-3xs">
              All sector traversal, NAL header discovery, and GOP reconstructions operate in strictly read-only bit-stream mode. The primary physical storage medium is never modified.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber/10 border border-amber/30 text-amber">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-semibold uppercase tracking-wider font-mono">
              DEMO / SIMULATION PROFILE ADAPTER
            </p>
            <p className="text-text-secondary leading-relaxed text-3xs">
              Proprietary DVR filesystem structures (DHFS, HIK, WFS) are processed via signature profile adapters. Raw physical controller drivers are modularly abstracted.
            </p>
          </div>
        </div>
      </div>

      {/* ── Configuration Card ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-accent" />
            <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-text-primary">
              1. Source Storage &amp; Filesystem Profile
            </h3>
          </div>
          <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-text-tertiary">
            Carving Input
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Source Selector */}
          <div className="space-y-2">
            <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary">
              Source Evidence Container / Disk Image
            </label>
            <select
              value={selectedSourceId}
              onChange={(e) => onSelectSource(e.target.value)}
              disabled={isScanning}
              className="w-full px-3 py-2 rounded-lg bg-surface-02 border border-border-default text-xs font-mono text-text-primary focus:outline-none focus:border-accent cursor-pointer"
            >
              {evidenceList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.id} — {e.filename} ({e.cameraChannel})
                </option>
              ))}
              <option value="raw_disk_image_01">RAW-01 — case024_dvr_physical_disk.dd</option>
            </select>

            {selectedEvidence && (
              <div className="p-3 rounded-lg bg-surface-base border border-border-subtle text-3xs font-mono text-text-tertiary space-y-1">
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span className="text-text-secondary">{selectedEvidence.deviceModel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Channel:</span>
                  <span className="text-accent">{selectedEvidence.cameraChannel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Container:</span>
                  <span className="text-text-secondary font-bold">.{selectedEvidence.format}</span>
                </div>
              </div>
            )}
          </div>

          {/* Filesystem Signature Profile */}
          <div className="space-y-2">
            <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary">
              Proprietary Filesystem Profile
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'DHFS', label: 'Dahua DHFS', desc: 'DHAV container (0x44484156)' },
                { id: 'HIKVISION', label: 'Hikvision HIK', desc: 'HIKG structure (0x48494B47)' },
                { id: 'WFS', label: 'CP Plus WFS', desc: 'WFS v4.0 unindexed partition' },
                { id: 'GENERIC_RAW', label: 'Generic RAW', desc: 'Raw SPS/PPS/IDR byte carve' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectFilesystem(item.id as RecoveryFilesystem)}
                  disabled={isScanning}
                  className={`p-2.5 rounded-lg text-left border transition-all ${
                    filesystem === item.id
                      ? 'bg-accent/15 border-accent text-accent'
                      : 'bg-surface-02 border-border-subtle text-text-secondary hover:border-border-default'
                  }`}
                >
                  <p className="text-xs font-semibold font-mono">{item.label}</p>
                  <p className="text-3xs text-text-tertiary mt-0.5 line-clamp-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Carve Scan Mode */}
          <div className="space-y-2">
            <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary">
              Sector Carving Scan Mode
            </label>
            <div className="space-y-2">
              {[
                { id: 'deep_sector', label: 'Deep Sector Scan (Recommended)', desc: 'Exhaustive sector traversal with GOP and PTS rebuild' },
                { id: 'fast_header', label: 'Fast Cluster Boundary Scan', desc: 'Fast keyframe index recovery across cluster heads' },
                { id: 'unallocated_only', label: 'Unallocated Cluster Sweep', desc: 'Targets deleted fragments and overwrite boundaries' },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    scanMode === item.id
                      ? 'bg-accent/10 border-accent text-text-primary'
                      : 'bg-surface-02 border-border-subtle text-text-secondary hover:border-border-default'
                  }`}
                >
                  <input
                    type="radio"
                    name="scanMode"
                    value={item.id}
                    checked={scanMode === item.id}
                    onChange={() => onSelectScanMode(item.id as CarveScanMode)}
                    disabled={isScanning}
                    className="mt-0.5 text-accent focus:ring-accent"
                  />
                  <div>
                    <p className="text-xs font-medium font-mono">{item.label}</p>
                    <p className="text-3xs text-text-tertiary">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
          <div className="text-3xs font-mono text-text-tertiary flex items-center gap-1.5">
            <Info size={12} />
            <span>Target: {selectedEvidence?.filename ?? 'case024_disk.dd'} | Profile: {filesystem} | Mode: {scanMode}</span>
          </div>

          <Button
            variant="primary"
            onClick={onStartScan}
            disabled={isScanning}
            icon={isScanning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} className="fill-current" />}
            id="start-carve-scan-btn"
          >
            {isScanning ? 'Carving Sectors...' : 'Start Forensic Carving Scan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
