import {
  Radio,
  ShieldCheck,
  Sliders,
  HardDrive,
  Search,
  FileCheck2,
  ArrowUpRight,
} from 'lucide-react';
import type { EvidenceItem } from '../../types/evidence';
import type { DetectionEvent, Investigation } from '../../types/investigation';

interface ForensicPipelineProps {
  evidence: EvidenceItem[];
  detections: DetectionEvent[];
  investigations: Investigation[];
  onNavigate: (path: string) => void;
}

export function ForensicPipeline({
  evidence,
  detections,
  investigations: _investigations,
  onNavigate,
}: ForensicPipelineProps) {
  const acquiredCount = evidence.length;
  const verifiedCount = evidence.filter((e) => !!e.sha256).length;
  const normalizedCount = evidence.filter((e) => !!e.forensicProfile).length;
  const analyzedCount = detections.length;
  const courtReadyCount = detections.filter(
    (d) => d.flaggedForReport || d.isBookmarked
  ).length;

  const pipelineStages = [
    {
      step: '01',
      name: 'ACQUIRED',
      icon: <Radio size={16} />,
      count: acquiredCount,
      unit: 'Items',
      status: 'Stream Ingested',
      statusColor: 'text-green bg-green/10 border-green/30',
      description: 'Multi-Vendor DVR/NVR stream negotiation & extraction',
      path: '/case/CASE-024?tab=acquisition',
    },
    {
      step: '02',
      name: 'HASH VERIFIED',
      icon: <ShieldCheck size={16} />,
      count: verifiedCount,
      unit: 'Sealed',
      status: 'Cryptographic',
      statusColor: 'text-green bg-green/10 border-green/30',
      description: 'Bit-stream SHA-256 integrity & Chain of Custody ledger',
      path: '/evidence',
    },
    {
      step: '03',
      name: 'NORMALIZED',
      icon: <Sliders size={16} />,
      count: normalizedCount,
      unit: 'Calibrated',
      status: 'PTS Aligned',
      statusColor: 'text-accent bg-accent/10 border-accent/30',
      description: 'Proprietary DAV/DHAV demuxing & RTC drift sync',
      path: '/case/CASE-024?tab=parser',
    },
    {
      step: '04',
      name: 'RECOVERY',
      icon: <HardDrive size={16} />,
      count: 3,
      unit: 'Clips',
      status: '3 Recovered',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'RAW disk sector scanner & fragmented GOP frame carving',
      path: '/case/CASE-024?tab=recovery',
    },
    {
      step: '05',
      name: 'ANALYZED',
      icon: <Search size={16} />,
      count: analyzedCount,
      unit: 'Sightings',
      status: 'Indexed',
      statusColor: 'text-amber bg-amber/10 border-amber/30',
      description: 'AI person & vehicle detection, cross-camera Re-ID timeline',
      path: '/investigate',
    },
    {
      step: '06',
      name: 'COURT READY',
      icon: <FileCheck2 size={16} />,
      count: courtReadyCount,
      unit: 'Exhibits',
      status: 'Sec 65B Dossier',
      statusColor: 'text-green bg-green/10 border-green/30',
      description: 'Court-admissible evidentiary packaging & certificates',
      path: '/reports',
    },
  ];

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-text-primary">
              Primary Forensic Pipeline (PS-150 Workflow)
            </h3>
          </div>
          <p className="text-xs text-text-tertiary mt-0.5">
            Standardized end-to-end evidence lifecycle from raw DVR node acquisition to Section 65B court presentation
          </p>
        </div>
        <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-text-secondary self-start sm:self-auto">
          Operational Lifecycle
        </span>
      </div>

      {/* Horizontal Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        {pipelineStages.map((stage) => (
          <div
            key={stage.name}
            onClick={() => onNavigate(stage.path)}
            className="group relative p-4 rounded-xl bg-surface-02/70 border border-border-subtle hover:border-accent hover:bg-surface-02 transition-all duration-150 cursor-pointer flex flex-col justify-between shadow-xs"
          >
            <div>
              {/* Header: Step & Icon */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-2xs font-bold text-text-tertiary group-hover:text-accent transition-colors">
                  {stage.step}
                </span>
                <div className="p-1.5 rounded-lg bg-surface-01 border border-border-subtle text-text-secondary group-hover:text-accent group-hover:border-accent/40 transition-all">
                  {stage.icon}
                </div>
              </div>

              {/* Stage Name */}
              <h4 className="text-xs font-bold font-mono text-text-primary group-hover:text-accent transition-colors tracking-tight">
                {stage.name}
              </h4>

              {/* Metrics */}
              <div className="flex items-baseline gap-1.5 my-2">
                <span className="text-xl font-mono font-bold text-text-primary">
                  {stage.count}
                </span>
                <span className="text-3xs font-mono text-text-tertiary">
                  {stage.unit}
                </span>
              </div>

              {/* Description */}
              <p className="text-3xs text-text-tertiary leading-relaxed line-clamp-2">
                {stage.description}
              </p>
            </div>

            {/* Footer Badge & Link */}
            <div className="pt-3 mt-3 border-t border-border-subtle/50 flex items-center justify-between">
              <span
                className={`text-3xs font-mono px-1.5 py-0.5 rounded border uppercase font-medium ${stage.statusColor}`}
              >
                {stage.status}
              </span>
              <ArrowUpRight
                size={13}
                className="text-text-tertiary group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
