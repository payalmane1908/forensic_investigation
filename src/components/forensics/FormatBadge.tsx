import { ShieldCheck, Cpu, HardDrive, AlertTriangle } from 'lucide-react';
import type { VendorBrand } from '../../types/evidence';

interface FormatBadgeProps {
  vendor?: VendorBrand;
  container?: string;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  showConfidence?: boolean;
}

interface VendorTheme {
  label: string;
  accentClass: string;
  badgeBg: string;
  borderClass: string;
  icon: typeof Cpu;
}

const VENDOR_THEMES: Record<VendorBrand, VendorTheme> = {
  Hikvision: {
    label: 'Hikvision Digital',
    accentClass: 'text-[#FF4D4D]',
    badgeBg: 'bg-[#FF4D4D]/10',
    borderClass: 'border-[#FF4D4D]/25',
    icon: Cpu,
  },
  Dahua: {
    label: 'Dahua Technology',
    accentClass: 'text-[#00E5FF]',
    badgeBg: 'bg-[#00E5FF]/10',
    borderClass: 'border-[#00E5FF]/25',
    icon: HardDrive,
  },
  'CP Plus': {
    label: 'CP Plus Aditya',
    accentClass: 'text-[#FFA116]',
    badgeBg: 'bg-[#FFA116]/10',
    borderClass: 'border-[#FFA116]/25',
    icon: Cpu,
  },
  Axon: {
    label: 'Axon Evidence',
    accentClass: 'text-[#FFD000]',
    badgeBg: 'bg-[#FFD000]/10',
    borderClass: 'border-[#FFD000]/25',
    icon: ShieldCheck,
  },
  Uniview: {
    label: 'Uniview UNV',
    accentClass: 'text-[#A78BFA]',
    badgeBg: 'bg-[#A78BFA]/10',
    borderClass: 'border-[#A78BFA]/25',
    icon: Cpu,
  },
  Bosch: {
    label: 'Bosch Security',
    accentClass: 'text-[#34D399]',
    badgeBg: 'bg-[#34D399]/10',
    borderClass: 'border-[#34D399]/25',
    icon: ShieldCheck,
  },
  Generic: {
    label: 'Generic / Non-Proprietary',
    accentClass: 'text-text-secondary',
    badgeBg: 'bg-surface-02',
    borderClass: 'border-border-default',
    icon: AlertTriangle,
  },
};

export function FormatBadge({
  vendor = 'Generic',
  container,
  confidence,
  size = 'md',
  showConfidence = true,
}: FormatBadgeProps) {
  const theme = VENDOR_THEMES[vendor] ?? VENDOR_THEMES.Generic;
  const IconComponent = theme.icon;

  const sizeClasses = {
    sm: 'text-2xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3 py-1.5 gap-2.5',
  };

  return (
    <div
      className={`inline-flex items-center rounded-md border font-mono tracking-tight transition-all duration-150 ${theme.badgeBg} ${theme.borderClass} ${sizeClasses[size]}`}
    >
      <IconComponent size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} className={theme.accentClass} />
      <span className={`font-semibold ${theme.accentClass}`}>{vendor}</span>

      {container && (
        <>
          <span className="text-text-tertiary">/</span>
          <span className="text-text-secondary font-mono">
            {container.split(' ')[0]}
          </span>
        </>
      )}

      {showConfidence && confidence !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 rounded bg-surface-base/60 text-2xs font-mono text-text-tertiary border border-border-subtle">
          {confidence.toFixed(1)}% match
        </span>
      )}
    </div>
  );
}
