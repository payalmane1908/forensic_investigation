import type {
  RecoveredClip,
  SectorScanMetrics,
  RecoveryFilesystem,
  CarveScanMode,
} from '../../types/recovery';
import type { EvidenceItem } from '../../types/evidence';
import { MOCK_RECOVERED_CLIPS } from '../../data/mockRecovery';

export interface RecoveryService {
  scanStorage(
    sourceId: string,
    fs: RecoveryFilesystem,
    mode: CarveScanMode,
    onProgress: (metrics: SectorScanMetrics) => void
  ): Promise<RecoveredClip[]>;
  promoteClipToEvidence(
    clip: RecoveredClip,
    caseId: string,
    officer: string
  ): EvidenceItem;
}

/**
 * DemoRecoveryAdapter simulates low-level disk sector traversal, NAL unit header detection,
 * fragmented GOP reconstruction, and PTS/DTS continuity checks.
 *
 * In a native deployment, this adapter communicates directly with the C++/Rust raw sector
 * carving engine and physical write-blocker drivers.
 */
class DemoRecoveryAdapter implements RecoveryService {
  async scanStorage(
    _sourceId: string,
    _fs: RecoveryFilesystem,
    _mode: CarveScanMode,
    onProgress: (metrics: SectorScanMetrics) => void
  ): Promise<RecoveredClip[]> {
    const totalSectors = 1_048_576; // ~512 MB disk range simulated
    const steps = 12;

    for (let i = 1; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const currentLba = Math.floor((totalSectors / steps) * i);
      const ratio = i / steps;

      onProgress({
        currentLba,
        totalLba: totalSectors,
        scannedBytes: currentLba * 512,
        foundHeaders: Math.floor(ratio * 128),
        candidateFragments: Math.floor(ratio * 42),
        reconstructedGops: Math.floor(ratio * 34),
        nalDistribution: {
          spsCount: Math.floor(ratio * 34),
          ppsCount: Math.floor(ratio * 34),
          idrCount: Math.floor(ratio * 34),
          seiCount: Math.floor(ratio * 85),
          sliceCount: Math.floor(ratio * 8400),
        },
        currentSectorHex: [
          `0x${(currentLba * 512).toString(16).toUpperCase().padStart(8, '0')}: 00 00 00 01 67 64 00 28  AC D9 40 78 02 27 E5 C0  | ....gd.(..@x.'..`,
          `0x${(currentLba * 512 + 16).toString(16).toUpperCase().padStart(8, '0')}: 5A 80 80 80 A0 00 00 03  00 20 00 00 07 91 E2 85  | Z........ ......`,
          `0x${(currentLba * 512 + 32).toString(16).toUpperCase().padStart(8, '0')}: 54 00 00 00 01 68 EB EC  B2 2C 00 00 00 01 65 88  | T....h...,...e.`,
        ],
      });
    }

    return MOCK_RECOVERED_CLIPS;
  }

  promoteClipToEvidence(
    clip: RecoveredClip,
    caseId: string,
    officer: string
  ): EvidenceItem {
    const promotedId = `EV-REC-${clip.id.replace('REC-', '')}`;
    const filename = `CARVED_${clip.channelId}_${clip.lbaStart}_${clip.lbaEnd}.mp4`;

    const evidenceItem: EvidenceItem = {
      id: promotedId,
      caseId,
      filename,
      fileSize: clip.fileSize,
      format: 'MP4',
      duration: clip.durationSeconds,
      deviceType: 'dvr',
      deviceModel: `${clip.filesystem} Carved Stream (${clip.confidence.verdict.replace('_', ' ')})`,
      cameraChannel: clip.channelId,
      collectionOfficer: officer,
      collectionTime: new Date().toISOString(),
      location: `${clip.channelName} (Carved Extent: ${clip.lbaStart} → ${clip.lbaEnd})`,
      sha256: clip.sha256,
      status: 'ingested',
      notes: `[FORENSIC CARVING RECOVERY] Carved from ${clip.filesystem} sectors ${clip.lbaStart}–${clip.lbaEnd}. Recovery Confidence: ${clip.confidence.overallScore}% (${clip.confidence.verdict}). ${clip.confidence.droppedFramesCount} frames dropped / ${clip.confidence.fragmentGapsCount} gaps.`,
      addedAt: new Date().toISOString(),
      chainOfCustody: [
        {
          id: `COC-REC-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'Deleted Footage Sector Carving & GOP Assembly',
          officer,
          badgeNumber: 'FX-8842',
          agency: 'Cyber & Forensic Crime Division',
          location: `Physical Sector ${clip.lbaStart}`,
          hashSnapshot: clip.sha256,
          notes: `Reconstructed ${clip.frameCount} frames from unallocated/deleted ${clip.filesystem} sectors. Integrity score: ${clip.confidence.overallScore}%.`,
          verified: true,
        },
      ],
    };

    return evidenceItem;
  }
}

export const recoveryService = new DemoRecoveryAdapter();
