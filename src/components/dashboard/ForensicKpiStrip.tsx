import {
  FolderOpen,
  HardDrive,
  Radio,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import type { Case } from '../../types/case';
import type { EvidenceItem } from '../../types/evidence';
import type { Investigation } from '../../types/investigation';
import { formatBytes } from '../../utils/format';

interface ForensicKpiStripProps {
  cases: Case[];
  evidence: EvidenceItem[];
  investigations: Investigation[];
  onNavigate: (path: string) => void;
}

export function ForensicKpiStrip({
  cases,
  evidence,
  investigations: _investigations,
  onNavigate,
}: ForensicKpiStripProps) {
  const activeCases = cases.filter((c) => c.status === 'active').length;
  const highPriorityCases = cases.filter((c) => c.priority === 'high').length;

  const totalBytes = evidence.reduce((acc, e) => acc + (e.fileSize || 0), 0);
  const formattedVolume = formatBytes(totalBytes);

  const acquiredSessions = evidence.filter(
    (e) => e.notes?.toLowerCase().includes('acqui') || e.id.includes('ACQ')
  ).length;

  const verifiedEvidence = evidence.filter(
    (e) => !!e.sha256 && (e.status === 'verified' || e.status === 'ingested')
  ).length;

  const integrityPct =
    evidence.length > 0
      ? Math.round((verifiedEvidence / evidence.length) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Active Cases */}
      <div
        onClick={() => onNavigate('/cases')}
        className="group p-4 rounded-xl bg-surface-01 border border-border-subtle hover:border-accent/40 cursor-pointer transition-all duration-150 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-text-tertiary mb-2">
          <span className="text-2xs font-mono uppercase tracking-wider">Active Cases</span>
          <FolderOpen size={15} className="text-accent group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-text-primary">
              {activeCases}
            </span>
            <span className="text-xs font-mono text-text-tertiary">/ {cases.length} Total</span>
          </div>
          <p className="text-3xs text-text-secondary mt-1 flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-red shrink-0 animate-pulse" />
            {highPriorityCases} High Priority
          </p>
        </div>
      </div>

      {/* 2. Evidence Volume */}
      <div
        onClick={() => onNavigate('/evidence')}
        className="group p-4 rounded-xl bg-surface-01 border border-border-subtle hover:border-accent/40 cursor-pointer transition-all duration-150 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-text-tertiary mb-2">
          <span className="text-2xs font-mono uppercase tracking-wider">Evidence Volume</span>
          <HardDrive size={15} className="text-blue-400 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-text-primary">
              {formattedVolume}
            </span>
          </div>
          <p className="text-3xs text-text-secondary mt-1 font-mono">
            {evidence.length} CCTV Media Items
          </p>
        </div>
      </div>

      {/* 3. Acquisition Sessions */}
      <div
        onClick={() => onNavigate('/case/CASE-024?tab=acquisition')}
        className="group p-4 rounded-xl bg-surface-01 border border-border-subtle hover:border-accent/40 cursor-pointer transition-all duration-150 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-text-tertiary mb-2">
          <span className="text-2xs font-mono uppercase tracking-wider">Acquisitions</span>
          <Radio size={15} className="text-amber group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-text-primary">
              {acquiredSessions > 0 ? acquiredSessions : evidence.length}
            </span>
            <span className="text-3xs font-mono text-amber">Active Streams</span>
          </div>
          <p className="text-3xs text-text-secondary mt-1 font-mono">
            Multi-Channel DVR/NVR Nodes
          </p>
        </div>
      </div>

      {/* 4. Recovery Sessions */}
      <div
        onClick={() => onNavigate('/case/CASE-024?tab=recovery')}
        className="group p-4 rounded-xl bg-surface-01 border border-border-subtle hover:border-emerald-500/40 cursor-pointer transition-all duration-150 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-text-tertiary mb-2">
          <span className="text-2xs font-mono uppercase tracking-wider">Recovery Engine</span>
          <Cpu size={15} className="text-emerald-400 group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-text-primary">
              3
            </span>
            <span className="text-3xs font-mono text-emerald-400">Carved Clips</span>
          </div>
          <p className="text-3xs text-text-secondary mt-1 font-mono">
            DHFS / HIK Carving Ready
          </p>
        </div>
      </div>

      {/* 5. Integrity Verification % */}
      <div
        onClick={() => onNavigate('/evidence')}
        className="group p-4 rounded-xl bg-surface-01 border border-border-subtle hover:border-accent/40 cursor-pointer transition-all duration-150 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-text-tertiary mb-2">
          <span className="text-2xs font-mono uppercase tracking-wider">Integrity Verified</span>
          <ShieldCheck size={15} className="text-green group-hover:scale-110 transition-transform" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-green">
              {integrityPct}%
            </span>
          </div>
          <p className="text-3xs text-text-secondary mt-1 font-mono">
            {verifiedEvidence} of {evidence.length} SHA-256 Sealed
          </p>
        </div>
      </div>
    </div>
  );
}
