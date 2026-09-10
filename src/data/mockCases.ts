import type { Case } from '../types/case';

export const MOCK_CASES: Case[] = [
  {
    id: 'CASE-024',
    title: 'Suspicious Activity — Central Market',
    description:
      'Coordinated analysis of DVR footage from three retail outlets surrounding the Central Market district. Incident reported 2026-09-06 at 21:14.',
    investigator: 'Insp. R. Sharma',
    cameraCount: 4,
    evidenceCount: 17,
    createdAt: '2026-09-06T21:14:00+05:30',
    updatedAt: '2026-09-08T11:58:00+05:30',
    status: 'active',
    priority: 'high',
    incidentAt: '2026-09-06T21:14:00+05:30',
  },
  {
    id: 'CASE-023',
    title: 'Vehicle Tracking — NH-48 Corridor',
    description:
      'Multi-vendor NVR footage correlation for suspect vehicle across eleven highway checkpoints. Cross-referencing with ANPR logs.',
    investigator: 'SI D. Mehta',
    cameraCount: 7,
    evidenceCount: 31,
    createdAt: '2026-09-04T08:30:00+05:30',
    updatedAt: '2026-09-08T09:22:00+05:30',
    status: 'processing',
    priority: 'high',
    incidentAt: '2026-09-03T23:45:00+05:30',
  },
  {
    id: 'CASE-021',
    title: 'ATM Skimming — Sector 14',
    description:
      'Forensic analysis of ATM surveillance footage. Evidence integrity verified. Report pending final approval.',
    investigator: 'Insp. P. Nair',
    cameraCount: 2,
    evidenceCount: 8,
    createdAt: '2026-08-29T14:00:00+05:30',
    updatedAt: '2026-09-07T17:45:00+05:30',
    status: 'closed',
    priority: 'medium',
    incidentAt: '2026-08-28T11:30:00+05:30',
  },
  {
    id: 'CASE-019',
    title: 'Missing Person — Indiranagar',
    description:
      'Systematic sweep of residential CCTV footage across a 2km radius. Chain-of-custody preserved. Active warrant.',
    investigator: 'SI K. Joshi',
    cameraCount: 11,
    evidenceCount: 44,
    createdAt: '2026-08-21T09:15:00+05:30',
    updatedAt: '2026-09-06T20:10:00+05:30',
    status: 'critical',
    priority: 'high',
    incidentAt: '2026-08-20T16:00:00+05:30',
  },
  {
    id: 'CASE-017',
    title: 'Robbery — Heritage Bank Branch',
    description:
      'Three-channel DVR footage from bank premises. Hash verification complete. Pending trial submission.',
    investigator: 'Insp. R. Sharma',
    cameraCount: 3,
    evidenceCount: 12,
    createdAt: '2026-08-15T16:30:00+05:30',
    updatedAt: '2026-09-02T11:00:00+05:30',
    status: 'closed',
    priority: 'medium',
    incidentAt: '2026-08-14T14:15:00+05:30',
  },
];
