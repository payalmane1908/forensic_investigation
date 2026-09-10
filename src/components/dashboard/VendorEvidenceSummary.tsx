import {
  Cpu,
  FileVideo,
  ArrowRight,
} from 'lucide-react';
import type { EvidenceItem } from '../../types/evidence';
import { formatBytes } from '../../utils/format';

interface VendorEvidenceSummaryProps {
  evidence: EvidenceItem[];
  onNavigate: (path: string) => void;
}

export function VendorEvidenceSummary({
  evidence,
  onNavigate,
}: VendorEvidenceSummaryProps) {
  const totalItems = evidence.length || 1;
  const totalBytes = evidence.reduce((sum, e) => sum + (e.fileSize || 0), 0) || 1;

  // Aggregate by Vendor
  const vendorMap = new Map<string, { count: number; bytes: number }>();
  evidence.forEach((item) => {
    let vendor: string = item.forensicProfile?.vendor || '';
    if (!vendor) {
      if (item.deviceModel.toLowerCase().includes('hikvision')) vendor = 'Hikvision';
      else if (item.deviceModel.toLowerCase().includes('dahua')) vendor = 'Dahua';
      else if (item.deviceModel.toLowerCase().includes('cp plus')) vendor = 'CP Plus';
      else if (item.deviceModel.toLowerCase().includes('axon')) vendor = 'Axon';
      else vendor = 'Generic DVR';
    }
    const current = vendorMap.get(vendor) || { count: 0, bytes: 0 };
    vendorMap.set(vendor, {
      count: current.count + 1,
      bytes: current.bytes + (item.fileSize || 0),
    });
  });

  const vendorStats = Array.from(vendorMap.entries()).map(([vendor, stats]) => ({
    vendor,
    count: stats.count,
    bytes: stats.bytes,
    percentage: Math.round((stats.count / totalItems) * 100),
  }));

  // Aggregate by Format
  const formatMap = new Map<string, { count: number; bytes: number }>();
  evidence.forEach((item) => {
    const fmt = item.format || 'Unknown';
    const current = formatMap.get(fmt) || { count: 0, bytes: 0 };
    formatMap.set(fmt, {
      count: current.count + 1,
      bytes: current.bytes + (item.fileSize || 0),
    });
  });

  const formatStats = Array.from(formatMap.entries()).map(([format, stats]) => ({
    format,
    count: stats.count,
    bytes: stats.bytes,
  }));

  const vendorColors: Record<string, string> = {
    Hikvision: 'bg-red text-red',
    Dahua: 'bg-accent text-accent',
    'CP Plus': 'bg-amber text-amber',
    Axon: 'bg-blue-400 text-blue-400',
    'Generic DVR': 'bg-text-tertiary text-text-tertiary',
  };

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wider font-mono text-text-primary">
            Multi-Vendor Ingestion Profile
          </h3>
        </div>
        <button
          onClick={() => onNavigate('/evidence')}
          className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
        >
          <span>Evidence Library</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Vendor Breakdown Bars */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-text-secondary uppercase text-3xs tracking-wider">
            Vendor Distribution ({vendorStats.length} Detected)
          </span>
          <span className="text-text-tertiary text-3xs">
            {totalItems} total streams
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-2 rounded-full bg-surface-02 border border-border-subtle overflow-hidden flex">
          {vendorStats.map((item) => (
            <div
              key={item.vendor}
              style={{ width: `${item.percentage}%` }}
              className={`h-full ${vendorColors[item.vendor]?.split(' ')[0] || 'bg-accent'}`}
              title={`${item.vendor}: ${item.count} items (${item.percentage}%)`}
            />
          ))}
        </div>

        {/* Vendor Detail Rows */}
        <div className="space-y-2 pt-1">
          {vendorStats.map((item) => {
            const color = vendorColors[item.vendor] || 'bg-accent text-accent';
            return (
              <div
                key={item.vendor}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-02 border border-border-subtle/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${color.split(' ')[0]}`} />
                  <span className="font-semibold text-text-primary font-mono">{item.vendor}</span>
                </div>
                <div className="flex items-center gap-3 text-3xs font-mono">
                  <span className="text-text-tertiary">{formatBytes(item.bytes)}</span>
                  <span className="font-bold text-text-primary px-1.5 py-0.5 rounded bg-surface-01 border border-border-subtle">
                    {item.count} items ({item.percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Container / Format Breakdown */}
      <div className="pt-3 border-t border-border-subtle space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-text-secondary uppercase text-3xs tracking-wider flex items-center gap-1.5">
            <FileVideo size={12} className="text-accent" /> Container Formats
          </span>
          <span className="text-text-tertiary text-3xs">{formatBytes(totalBytes)} total</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {formatStats.map((item) => (
            <div
              key={item.format}
              className="p-2.5 rounded-lg bg-surface-02 border border-border-subtle text-center space-y-0.5"
            >
              <p className="text-xs font-bold font-mono text-accent">.{item.format}</p>
              <p className="text-3xs font-mono text-text-primary font-semibold">{item.count} Files</p>
              <p className="text-3xs font-mono text-text-tertiary">{formatBytes(item.bytes)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
