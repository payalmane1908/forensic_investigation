import type { VendorBrand } from './evidence';

export type PipelineStepId =
  | 'container_decode'
  | 'stream_demux'
  | 'codec_identification'
  | 'timestamp_extraction'
  | 'frame_indexing'
  | 'normalization';

export type JobStatus = 'pending' | 'running' | 'complete' | 'error';

export interface PipelineStep {
  id: PipelineStepId;
  label: string;
  sublabel: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  elapsedMs?: number;
  throughput?: string;
  details: string[];
}

export interface ParserJob {
  id: string;
  evidenceId: string;
  caseId: string;
  filename: string;
  vendor: VendorBrand;
  container: string;
  cameraChannel: string;
  status: JobStatus;
  currentStepIndex: number; // 0 to 5
  progress: number;         // 0 to 100
  totalFrames: number;
  framesExtracted: number;
  keyframesCount: number;
  segmentsCount: number;
  timestampOffsetMs: number; // e.g. -2420 for EV-005, or +12 for EV-001
  rawStartTimestamp: string;
  correctedStartTimestamp: string;
  driftDirection: 'advance' | 'retard' | 'synchronized';
  throughputFps: number;
  outputFormat: string;
  outputFileSize: number;
  completedAt?: string;
  errorReason?: string;
  steps: PipelineStep[];
}

export interface CalibrationResult {
  evidenceId: string;
  channel: string;
  rawRtcTime: string;
  osdWatermarkTime: string;
  calculatedDriftMs: number;
  appliedOffsetMs: number;
  calibratedTime: string;
  confidenceScore: number;
  method: 'OSD OCR & PTS Sync' | 'Hardware RTC Clock Lock' | 'GPS Atomic Beacon';
}
