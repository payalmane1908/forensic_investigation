import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Cpu,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import type {
  RecoveredClip,
  SectorScanMetrics,
  RecoveryFilesystem,
  CarveScanMode,
} from '../../types/recovery';
import type { EvidenceItem } from '../../types/evidence';
import { recoveryService } from '../../services/recovery/recoveryService';
import { MOCK_RECOVERED_CLIPS, MOCK_TIMELINE_REGIONS } from '../../data/mockRecovery';
import { MOCK_EVIDENCE } from '../../data/mockEvidence';
import { RecoverySourceSelector } from './RecoverySourceSelector';
import { SectorScannerView } from './SectorScannerView';
import { RecoveredClipsManifest } from './RecoveredClipsManifest';
import { ConfidenceScoreCard } from './ConfidenceScoreCard';
import { RecoveryTimelineView } from './RecoveryTimelineView';
import { SynchronizedHexInspector } from './SynchronizedHexInspector';

interface RecoveryTabProps {
  caseId: string;
  investigator?: string;
  onEvidenceAdded?: (item: EvidenceItem) => void;
  onNavigateToEvidence?: () => void;
}

export const RecoveryTab: React.FC<RecoveryTabProps> = ({
  caseId,
  investigator = 'Inspector R. Sharma',
  onEvidenceAdded,
  onNavigateToEvidence,
}) => {
  const caseEvidence = MOCK_EVIDENCE.filter((e) => e.caseId === caseId);
  const evidenceList = caseEvidence.length > 0 ? caseEvidence : MOCK_EVIDENCE;

  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    evidenceList[0]?.id || 'EV-001'
  );
  const [filesystem, setFilesystem] = useState<RecoveryFilesystem>('DHFS');
  const [scanMode, setScanMode] = useState<CarveScanMode>('deep_sector');

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(true); // Default true for demo exploration
  const [scanMetrics, setScanMetrics] = useState<SectorScanMetrics | null>(null);

  const [recoveredClips, setRecoveredClips] = useState<RecoveredClip[]>(MOCK_RECOVERED_CLIPS);
  const [selectedClipId, setSelectedClipId] = useState<string>('REC-001');
  const [promotedClipIds, setPromotedClipIds] = useState<Set<string>>(new Set());
  const [promotionToast, setPromotionToast] = useState<{ id: string; title: string } | null>(null);

  const selectedClip = recoveredClips.find((c) => c.id === selectedClipId) || recoveredClips[0];

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanMetrics(null);

    try {
      const results = await recoveryService.scanStorage(
        selectedSourceId,
        filesystem,
        scanMode,
        (metrics) => {
          setScanMetrics(metrics);
        }
      );
      setRecoveredClips(results);
      setHasScanned(true);
      if (results.length > 0) {
        setSelectedClipId(results[0].id);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handlePromoteClip = (clip: RecoveredClip) => {
    const evidenceItem = recoveryService.promoteClipToEvidence(clip, caseId, investigator);
    setPromotedClipIds((prev) => new Set(prev).add(clip.id));
    if (onEvidenceAdded) {
      onEvidenceAdded(evidenceItem);
    }
    setPromotionToast({
      id: evidenceItem.id,
      title: `${clip.id} promoted as ${evidenceItem.id}`,
    });
    setTimeout(() => {
      setPromotionToast(null);
    }, 5000);
  };

  const handleSelectTimelineRegion = (clipId?: string) => {
    if (clipId) {
      setSelectedClipId(clipId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recovery Pipeline Workflow Banner */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-subtle pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-text-primary tracking-wide">
                  Deleted Footage Carving &amp; GOP Reconstruction Engine
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                  Module M6
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                  Demo / Simulation Mode
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Physical sector-level raw carving, NAL unit assembly, PTS/DTS continuity analysis, and explainable confidence verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-02 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>FORENSIC SAFE: READ-ONLY BITSTREAM</span>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Breadcrumbs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 text-[11px] font-mono text-text-secondary scrollbar-thin">
          {[
            '01 DVR/NVR Storage',
            '02 Read-Only Loopback',
            '03 Signature Detection',
            '04 Fragment Extraction',
            '05 GOP Reconstruction',
            '06 PTS/DTS Verification',
            '07 Confidence Scoring',
            '08 Evidence Promotion',
          ].map((stage, idx, arr) => (
            <React.Fragment key={stage}>
              <span
                className={`px-2 py-1 rounded whitespace-nowrap ${
                  idx <= 6
                    ? 'bg-surface-02 text-emerald-300 font-medium border border-border-default'
                    : 'bg-surface-base text-text-tertiary'
                }`}
              >
                {stage}
              </span>
              {idx < arr.length - 1 && (
                <ArrowRight className="w-3 h-3 text-text-tertiary shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {promotionToast && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 text-sm shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">{promotionToast.title}</span>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Master SHA-256 registered with Chain of Custody ledger and available in Evidence Workspace.
              </p>
            </div>
          </div>
          {onNavigateToEvidence && (
            <button
              onClick={onNavigateToEvidence}
              className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-medium text-xs rounded-lg hover:bg-emerald-400 transition-colors shadow-sm"
            >
              View in Evidence Tab →
            </button>
          )}
        </div>
      )}

      {/* Top Controls: Source Selection & Scan Initiation */}
      <RecoverySourceSelector
        evidenceList={evidenceList}
        selectedSourceId={selectedSourceId}
        onSelectSource={setSelectedSourceId}
        filesystem={filesystem}
        onSelectFilesystem={setFilesystem}
        scanMode={scanMode}
        onSelectScanMode={setScanMode}
        isScanning={isScanning}
        onStartScan={handleStartScan}
      />

      {/* Scanning Live View */}
      {isScanning && (
        <SectorScannerView
          metrics={scanMetrics}
          isScanning={isScanning}
        />
      )}

      {/* Main Forensic Analysis Workspace (When Scanned) */}
      {hasScanned && (
        <div className="space-y-6">
          {/* Recovery Visual Timeline */}
          <RecoveryTimelineView
            regions={MOCK_TIMELINE_REGIONS}
            selectedClipId={selectedClipId}
            onSelectClip={handleSelectTimelineRegion}
          />

          {/* Dual Panel: Manifest List & Detailed Inspector */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Manifest List */}
            <div className="xl:col-span-5 space-y-4">
              <RecoveredClipsManifest
                clips={recoveredClips}
                selectedClipId={selectedClipId}
                onSelectClip={setSelectedClipId}
                onPromoteClip={handlePromoteClip}
                promotedClipIds={promotedClipIds}
              />
            </div>

            {/* Right Detailed Frame & Hex Inspector + Confidence Card */}
            <div className="xl:col-span-7 space-y-6">
              {selectedClip ? (
                <>
                  {/* Synchronized Video Frame & Hex Viewport */}
                  <SynchronizedHexInspector
                    clip={selectedClip}
                    onPromote={() => handlePromoteClip(selectedClip)}
                    isPromoted={promotedClipIds.has(selectedClip.id)}
                  />

                  {/* Explainable Diagnostic Confidence Breakdown */}
                  <ConfidenceScoreCard
                    confidence={selectedClip.confidence}
                    clipId={selectedClip.id}
                  />
                </>
              ) : (
                <div className="p-12 text-center bg-surface-01 border border-border-subtle rounded-xl">
                  <HardDrive className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                  <p className="text-text-secondary text-sm">Select a recovered clip from the manifest to inspect.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
