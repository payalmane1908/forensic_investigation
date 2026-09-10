// ─── Investigation Entity ─────────────────────────────────────────────────────

export type InvestigationStatus =
  | 'open'
  | 'in_progress'
  | 'concluded'
  | 'archived';

export interface Investigation {
  id: string;               // e.g. "INV-001"
  caseId: string;           // Parent case
  title: string;            // e.g. "Primary Suspect — Red Jacket"
  objective: string;        // Brief analyst description of what this investigation is after
  status: InvestigationStatus;
  leadAnalyst: string;      // Officer / analyst name
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
  detectionIds: string[];   // Pinned detection event IDs relevant to this investigation
  tags: string[];           // e.g. ["suspect", "red-jacket", "re-id"]
  notes?: string;           // Optional free-form analyst notes
}

export interface CreateInvestigationPayload {
  caseId: string;
  title: string;
  objective: string;
  leadAnalyst: string;
}

// ─── Investigation & Detection Types ──────────────────────────────────────────

export type DetectionTarget =
  | 'person'
  | 'vehicle'
  | 'face'
  | 'license_plate'
  | 'bag_object'
  | 'motion_anomaly';

export interface BoundingBox {
  x: number;      // percentage 0-100
  y: number;      // percentage 0-100
  width: number;  // percentage 0-100
  height: number; // percentage 0-100
}

export interface DetectionAttributes {
  color?: string;
  clothing?: string;
  vehicleType?: string;
  plateNumber?: string;
  direction?: 'Northbound' | 'Southbound' | 'Eastbound' | 'Westbound' | 'Stationary';
  velocityEstimate?: string;
  faceMatchId?: string;
  faceMatchScore?: number;
  genderEstimate?: 'Male' | 'Female' | 'Unknown';
  ageEstimate?: string;
  anomalyScore?: number;
}

export interface DetectionEvent {
  id: string;                  // e.g. "DET-8491"
  caseId: string;              // e.g. "CASE-024"
  evidenceId: string;          // e.g. "EV-001"
  cameraChannel: string;       // e.g. "CAM-01"
  cameraLocation: string;      // e.g. "South Entrance Gate"
  timestamp: string;           // ISO 8601
  calibratedTimestamp: string; // Corrected RTC / NTP aligned time
  timeOffsetAppliedMs: number; // e.g. -4200 ms
  targetType: DetectionTarget;
  label: string;               // e.g. "Suspect with Red Hooded Jacket"
  confidence: number;          // 0.0 - 1.0 (e.g. 0.94)
  attributes: DetectionAttributes;
  boundingBox: BoundingBox;
  frameNumber: number;
  sha256Snapshot: string;      // Hash of this exact frame for court admissibility
  isBookmarked: boolean;
  flaggedForReport: boolean;
  notes?: string;
  svgThumbnailBg: string;      // visual representation color gradient
}

export interface JourneyWaypoint {
  step: number;
  timestamp: string;
  cameraChannel: string;
  cameraLocation: string;
  detectionId: string;
  thumbnailSummary: string;
  direction: string;
  dwellTimeSeconds: number;
  distanceFromPreviousMeters?: number;
  estimatedTransitSpeedKmph?: number;
  boundingBox: BoundingBox;
}

export interface SuspectJourney {
  id: string;                  // e.g. "SJ-01"
  caseId: string;
  targetName: string;          // e.g. "Suspect #1 (Red Jacket)"
  confidenceScore: number;     // e.g. 0.93
  firstSeen: string;
  lastSeen: string;
  totalCheckpoints: number;
  waypoints: JourneyWaypoint[];
  reIdFeatures: string[];
  status: 'confirmed_track' | 'tentative_match' | 'lost_track';
}

export interface InvestigationFilterState {
  caseId: string;              // 'all' | specific caseId
  targetType: string;          // 'all' | DetectionTarget
  color: string;               // 'all' | 'red' | 'black' | 'blue' | 'white' | etc.
  cameraChannel: string;       // 'all' | channel ID
  minConfidence: number;       // 0 to 1
  searchQuery: string;
  viewMode: 'grid' | 'timeline' | 'journey';
  bookmarkedOnly: boolean;
  timeRange: 'all' | 'incident' | 'last1h' | 'last24h';
}
