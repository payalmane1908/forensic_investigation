export type RecoveryFilesystem =
  | 'DHFS'         // Dahua DHFS / DHAV
  | 'HIKVISION'    // Hikvision HIK / HFS
  | 'WFS'          // CP Plus WFS
  | 'GENERIC_RAW'; // Generic Raw H.264/H.265 Bitstream

export type CarveScanMode =
  | 'fast_header'
  | 'deep_sector'
  | 'unallocated_only';

export type CarveStatus =
  | 'idle'
  | 'scanning'
  | 'assembling'
  | 'completed'
  | 'failed';

export interface NalUnitDistribution {
  spsCount: number;
  ppsCount: number;
  idrCount: number;  // Keyframes
  seiCount: number;  // OSD Timestamps
  sliceCount: number;// P/B frames
}

export interface SectorScanMetrics {
  currentLba: number;
  totalLba: number;
  scannedBytes: number;
  foundHeaders: number;
  candidateFragments: number;
  reconstructedGops: number;
  nalDistribution: NalUnitDistribution;
  currentSectorHex: string[];
}

export interface RecoveryConfidence {
  overallScore: number;          // e.g. 94.7 (%)
  headerIntegrity: boolean;      // Magic bytes valid
  spsPpsAvailability: boolean;   // SPS/PPS present
  idrPresence: boolean;          // Keyframe present
  frameContinuityPct: number;    // e.g. 96.4
  timestampContinuityPct: number;// e.g. 98.1
  fragmentGapsCount: number;     // e.g. 2
  droppedFramesCount: number;    // e.g. 14
  verdict: 'high_confidence' | 'repaired_jitter' | 'partial_fragment' | 'corrupted';
}

export interface RecoveredFrame {
  frameNumber: number;
  timestamp: string;
  nalType: 'IDR' | 'SPS' | 'PPS' | 'SEI' | 'SLICE';
  lbaSector: string;
  byteOffset: string;
  hexBytes: string[];
  isCorrupted?: boolean;
}

export interface RecoveredClip {
  id: string;                    // e.g. "REC-001"
  sourceEvidenceId: string;      // e.g. "EV-001" or raw disk image
  channelId: string;             // e.g. "CH-02"
  channelName: string;           // e.g. "Retail Alley Junction A"
  startTime: string;             // ISO string
  endTime: string;               // ISO string
  durationSeconds: number;       // e.g. 248
  frameCount: number;            // e.g. 6200
  fileSize: number;              // bytes
  lbaStart: string;              // "0x004A2000"
  lbaEnd: string;                // "0x006C8000"
  sha256: string;                // Computed hash of recovered fragment
  codec: string;                 // "H.264 / AVC (High@L4.1)"
  resolution: string;            // "1920 × 1080 (1080p)"
  fps: number;                   // 25
  filesystem: RecoveryFilesystem;
  confidence: RecoveryConfidence;
  frames: RecoveredFrame[];
  isPromoted?: boolean;
  promotedEvidenceId?: string;
  svgThumbnailBg: string;
}

export interface TimelineRegion {
  id: string;
  channelId: string;
  startTime: string;
  endTime: string;
  type: 'recovered' | 'fragmented' | 'corrupted' | 'unrecoverable';
  clipId?: string;
  label: string;
}
