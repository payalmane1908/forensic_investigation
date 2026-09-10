import {
  ShieldCheck,
  Cpu,
  Sliders,
  HardDrive,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { EvidenceItem } from '../../types/evidence';
import { formatBytes } from '../../utils/format';

interface SystemCapabilitiesStatusProps {
  evidence: EvidenceItem[];
}

export function SystemCapabilitiesStatus({
  evidence,
}: SystemCapabilitiesStatusProps) {
  const totalBytes = evidence.reduce((sum, e) => sum + (e.fileSize || 0), 0);

  const capabilities = [
    {
      name: 'Cryptographic Hash Engine',
      protocol: 'SHA-256 / MD5 / SHA-1 Bit-Stream Verification',
      status: 'Operational',
      statusColor: 'text-green bg-green/10 border-green/30',
      icon: <ShieldCheck size={14} className="text-green" />,
    },
    {
      name: 'Multi-Vendor Demuxer',
      protocol: 'Hikvision DHAV / Dahua DHIP / Generic H.264/H.265',
      status: 'Operational',
      statusColor: 'text-green bg-green/10 border-green/30',
      icon: <Sliders size={14} className="text-accent" />,
    },
    {
      name: 'Fragmented Footage Recovery',
      protocol: 'PS-150 Proprietary Filesystem Carving (DHFS/RAW)',
      status: 'Standby / Ready',
      statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      icon: <Cpu size={14} className="text-purple-400" />,
    },
    {
      name: 'Chain of Custody Ledger',
      protocol: 'Court-Admissible Monotonic Audit Logging',
      status: 'Operational',
      statusColor: 'text-green bg-green/10 border-green/30',
      icon: <Lock size={14} className="text-green" />,
    },
    {
      name: 'Local Evidence Storage',
      protocol: `${formatBytes(totalBytes)} indexed across ${evidence.length} forensic streams`,
      status: 'Operational',
      statusColor: 'text-green bg-green/10 border-green/30',
      icon: <HardDrive size={14} className="text-blue-400" />,
    },
  ];

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green" />
          <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-text-primary">
            Forensic Engine Status
          </h3>
        </div>
        <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-green/10 border border-green/30 text-green font-semibold">
          System Ready
        </span>
      </div>

      <div className="space-y-2.5">
        {capabilities.map((cap) => (
          <div
            key={cap.name}
            className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-surface-02 border border-border-subtle/70"
          >
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded bg-surface-01 border border-border-subtle mt-0.5">
                {cap.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary font-mono leading-snug">
                  {cap.name}
                </p>
                <p className="text-3xs text-text-secondary mt-0.5 font-mono">
                  {cap.protocol}
                </p>
              </div>
            </div>

            <span
              className={`shrink-0 text-3xs font-mono px-2 py-0.5 rounded border uppercase font-medium ${cap.statusColor}`}
            >
              {cap.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
