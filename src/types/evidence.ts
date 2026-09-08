// ─── Evidence Types ───────────────────────────────────────────────────────────

export type EvidenceStatus =
  | 'queued'        // File selected, not yet processing
  | 'hashing'       // SHA-256 hash being computed
  | 'verified'      // Hash complete, integrity confirmed
  | 'ingested'      // Fully registered into the system
  | 'error';        // Failed

export type DeviceType =
  | 'dvr'
  | 'nvr'
  | 'ip_camera'
  | 'mobile'
  | 'dashcam'
  | 'bodycam'
  | 'other';

export type FileFormat =
  | 'H.264'
  | 'H.265'
  | 'MJPEG'
  | 'MPEG-4'
  | 'AVI'
  | 'MKV'
  | 'MP4'
  | 'DAV'
  | 'NVR'
  | 'Unknown';

export type VendorBrand =
  | 'Hikvision'
  | 'Dahua'
  | 'CP Plus'
  | 'Axon'
  | 'Uniview'
  | 'Bosch'
  | 'Generic';

export interface CustodyEvent {
  id: string;
  timestamp: string;
  action: string;
  officer: string;
  badgeNumber: string;
  agency: string;
  location: string;
  hashSnapshot: string;
  notes?: string;
  verified: boolean;
  tamperSealId?: string;
}

export interface ForensicProfile {
  vendor: VendorBrand;
  vendorConfidence: number; // e.g. 99.4
  containerFormat: string;   // e.g. "DAV (DHAV Proprietary Container v2.1)"
  codec: string;             // e.g. "H.264 / AVC (High@L4.1, CABAC)"
  resolution: string;        // e.g. "1920 × 1080 (1080p FHD)"
  aspectRatio: string;       // e.g. "16:9"
  frameRate: number;         // e.g. 25.00
  bitrate: string;           // e.g. "4.2 Mbps (CBR)"
  gopLength: string;         // e.g. "50 frames (2.0s GOP)"
  scanType: 'Progressive' | 'Interlaced';
  audioTrack: {
    present: boolean;
    codec?: string;
    sampleRate?: string;
    channels?: number;
    bitrate?: string;
  };
  gpsEmbedded: boolean;
  gpsCoordinates?: {
    lat: number;
    lng: number;
    altitude?: string;
    locationName: string;
  };
  timestamps: {
    startTimestamp: string;
    endTimestamp: string;
    osdWatermarkTime: string;
    internalRtcTime: string;
    timeDriftSeconds: number;
    ntpSynchronized: boolean;
  };
  tamperAnalysis: {
    verdict: 'verified_intact' | 'warning' | 'compromised';
    watermarkIntact: boolean;
    spsPpsConsistency: boolean;
    crcChecksumMatch: boolean;
    ptsDtsSequenceValid: boolean;
    indicators: string[];
  };
  hexHeader: {
    magicBytes: string;        // e.g. "44 48 41 56"
    magicAscii: string;        // e.g. "DHAV"
    rawSampleHex: string[];    // forensic hex dump lines
    detectedSignatures: string[];
  };
  vendorMetadata: Record<string, string>; // raw proprietary fields
}

export interface EvidenceItem {
  id: string;               // EV-001
  caseId: string;           // CASE-024
  filename: string;
  fileSize: number;         // bytes
  format: FileFormat;
  duration?: number;        // seconds
  deviceType: DeviceType;
  deviceModel: string;      // e.g. "Hikvision DS-7208HQHI"
  cameraChannel: string;    // e.g. "CH-03"
  collectionOfficer: string;
  collectionTime: string;   // ISO 8601
  location: string;         // Physical location of the source device
  sha256?: string;          // Computed hash
  md5?: string;             // Legacy MD5 hash for cross-verification
  sha1?: string;            // Legacy SHA-1 hash
  status: EvidenceStatus;
  notes: string;
  addedAt: string;          // ISO 8601
  forensicProfile?: ForensicProfile;
  chainOfCustody?: CustodyEvent[];
}

export interface UploadQueueItem {
  uid: string;              // Temporary client-side ID
  file: File;
  progress: number;         // 0–100
  status: EvidenceStatus;
  sha256?: string;
  error?: string;
  // Metadata filled in by user
  deviceType: DeviceType;
  deviceModel: string;
  cameraChannel: string;
  collectionOfficer: string;
  collectionTime: string;
  location: string;
  notes: string;
}

