import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Radio,
} from 'lucide-react';
import { Button, MonoLabel } from '../components/ui/primitives';
import { ForensicKpiStrip } from '../components/dashboard/ForensicKpiStrip';
import { ForensicPipeline } from '../components/dashboard/ForensicPipeline';
import { ActiveInvestigationsList } from '../components/dashboard/ActiveInvestigationsList';
import { VendorEvidenceSummary } from '../components/dashboard/VendorEvidenceSummary';
import { SystemCapabilitiesStatus } from '../components/dashboard/SystemCapabilitiesStatus';
import { RecentActivityAudit } from '../components/dashboard/RecentActivityAudit';
import { MOCK_CASES } from '../data/mockCases';
import { MOCK_EVIDENCE } from '../data/mockEvidence';
import { MOCK_INVESTIGATIONS, MOCK_DETECTIONS } from '../data/mockInvestigation';

export function DashboardPage() {
  const navigate = useNavigate();

  // Pull actual application state
  const [cases] = useState(MOCK_CASES);
  const [evidence] = useState(MOCK_EVIDENCE);
  const [investigations] = useState(MOCK_INVESTIGATIONS);
  const [detections] = useState(MOCK_DETECTIONS);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-20">
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MonoLabel className="text-accent font-semibold">PS-150 WORKSTATION</MonoLabel>
            <span className="text-text-tertiary">•</span>
            <span className="inline-flex items-center gap-1 text-3xs font-mono uppercase px-2 py-0.5 rounded-full bg-green/10 text-green border border-green/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Forensic Command Center
          </h1>
          <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
            Central operational hub for standardized DVR/NVR acquisition, bit-stream cryptographic verification, proprietary normalizations, and Section 65B court exhibit management.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/cases')}
            icon={<Plus size={13} />}
          >
            Register Case
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/case/CASE-024?tab=acquisition')}
            icon={<Radio size={13} />}
          >
            Acquire Footage
          </Button>
        </div>
      </div>

      {/* ── 1. Top KPI Strip ── */}
      <ForensicKpiStrip
        cases={cases}
        evidence={evidence}
        investigations={investigations}
        onNavigate={(path) => navigate(path)}
      />

      {/* ── 2. Primary Forensic Pipeline (Visual Centerpiece) ── */}
      <ForensicPipeline
        evidence={evidence}
        detections={detections}
        investigations={investigations}
        onNavigate={(path) => navigate(path)}
      />

      {/* ── 3. Operational Intelligence Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Active Investigations & Engine Status */}
        <div className="lg:col-span-7 space-y-6">
          <ActiveInvestigationsList
            investigations={investigations}
            cases={cases}
            onNavigate={(path) => navigate(path)}
          />

          <SystemCapabilitiesStatus evidence={evidence} />
        </div>

        {/* Right Column (5 cols): Vendor Breakdown & Live Audit Trail */}
        <div className="lg:col-span-5 space-y-6">
          <VendorEvidenceSummary
            evidence={evidence}
            onNavigate={(path) => navigate(path)}
          />

          <RecentActivityAudit
            cases={cases}
            evidence={evidence}
            investigations={investigations}
            onNavigate={(path) => navigate(path)}
          />
        </div>
      </div>
    </div>
  );
}
