export type CaseStatus = 'active' | 'processing' | 'closed' | 'critical';

export type CasePriority = 'high' | 'medium' | 'low';

export interface Case {
  id: string;          // e.g. "CASE-024"
  title: string;
  description: string;
  investigator: string;
  cameraCount: number;
  evidenceCount: number;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
  status: CaseStatus;
  priority: CasePriority;
  incidentAt?: string; // ISO 8601 — actual incident time (distinct from case creation)
}

export interface CreateCasePayload {
  id: string;
  title: string;
  description: string;
  investigator: string;
  priority: CasePriority;
  incidentAt?: string;
}
