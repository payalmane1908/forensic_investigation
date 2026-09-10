import { useState, useMemo } from 'react';
import {
  Video,
  Activity,
  Calendar,
  Clock,
  HardDrive,
  CheckSquare,
  Square,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import type {
  DeviceConnection,
  DeviceFingerprint,
  AcquisitionChannel,
} from '../../types/acquisition';
import type { Investigation } from '../../types/investigation';
import { Button } from '../ui/primitives';

interface ChannelSelectionStepProps {
  channels: AcquisitionChannel[];
  investigation: Investigation;
  device: DeviceConnection;
  fingerprint: DeviceFingerprint;
  onBack: () => void;
  onProceed: (selectedChannelIds: string[], startTime: string, endTime: string) => void;
}

export function ChannelSelectionStep({
  channels,
  investigation,
  device: _device,
  fingerprint,
  onBack,
  onProceed,
}: ChannelSelectionStepProps) {
  // Default channels CH-01 and CH-02 selected
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(['CH-01', 'CH-02']);
  
  // Default time range: 2 hours prior to current time
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() - 2);
    return d.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 16);
  });

  const toggleChannel = (id: string) => {
    setSelectedChannelIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedChannelIds.length === channels.length) {
      setSelectedChannelIds([]);
    } else {
      setSelectedChannelIds(channels.map((c) => c.id));
    }
  };

  // Time validation & duration
  const timeValidation = useMemo(() => {
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (isNaN(s) || isNaN(e)) {
      return { valid: false, message: 'Invalid date/time values' };
    }
    if (s >= e) {
      return { valid: false, message: 'Start time must be strictly before End time' };
    }
    const diffHours = (e - s) / (1000 * 60 * 60);
    return {
      valid: true,
      diffHours,
      formattedDuration: `${Math.floor(diffHours)}h ${Math.round((diffHours % 1) * 60)}m`,
      warning: diffHours > 24 ? 'Acquisition window exceeds recommended 24h limit' : null,
    };
  }, [startDate, endDate]);

  // Estimated file size calculation: ~1.8 GB per channel per hour (at ~4Mbps 1080p)
  const estimatedSizeGb = useMemo(() => {
    if (!timeValidation.valid || !timeValidation.diffHours) return '0.00';
    const perChannelGb = timeValidation.diffHours * 1.8;
    return (perChannelGb * selectedChannelIds.length).toFixed(2);
  }, [timeValidation, selectedChannelIds.length]);

  const canProceed = selectedChannelIds.length > 0 && timeValidation.valid;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Discovered Channels */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-accent" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Discovered Camera Channels ({channels.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
              >
                {selectedChannelIds.length === channels.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {channels.map((ch) => {
                const isSelected = selectedChannelIds.includes(ch.id);
                return (
                  <div
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={`p-3 rounded-lg border cursor-pointer select-none transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-accent/10 border-accent shadow-sm'
                        : 'bg-surface-02 border-border-subtle hover:border-border-default'
                    }`}
                  >
                    <div>
                      {/* CCTV thumbnail placeholder with simulated scanline */}
                      <div className="relative w-full aspect-video bg-surface-base rounded border border-border-subtle overflow-hidden mb-2.5 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:12px_12px]" />
                        <span className="font-mono text-3xs text-text-tertiary">
                          FEED {ch.id}
                        </span>

                        {/* OSD tag */}
                        <div className="absolute top-1.5 left-1.5 px-1 rounded bg-black/80 text-3xs font-mono text-green border border-green/30">
                          {ch.id}
                        </div>

                        {/* Motion indicator */}
                        {ch.motionActivity && (
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber/20 text-amber border border-amber/40 text-3xs font-mono">
                            <Activity size={9} className="animate-pulse" />
                            <span>Motion</span>
                          </div>
                        )}
                      </div>

                      {/* Channel metadata */}
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-xs font-semibold text-text-primary line-clamp-1">
                          {ch.name}
                        </span>
                        {isSelected ? (
                          <CheckSquare size={14} className="text-accent shrink-0 mt-0.5" />
                        ) : (
                          <Square size={14} className="text-text-tertiary shrink-0 mt-0.5" />
                        )}
                      </div>
                      <p className="text-3xs font-mono text-text-secondary mt-0.5">
                        {ch.resolution} • {ch.fps ?? 25}fps
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border-subtle/50 flex justify-between items-center text-3xs font-mono text-text-tertiary">
                      <span>Rate: {ch.bitrate ?? '4.0 Mbps'}</span>
                      <span className={isSelected ? 'text-accent font-semibold' : ''}>
                        {isSelected ? 'Selected' : 'Standby'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Time Range & Scope Summary */}
        <div className="lg:col-span-5 space-y-4">
          {/* Time range config */}
          <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
              <Calendar size={16} className="text-accent" />
              <h3 className="text-sm font-semibold text-text-primary">
                Acquisition Time Window
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Start Date / Time (Local Device Time)
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-02 border border-border-default text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  End Date / Time
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-02 border border-border-default text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              {/* Validation readout */}
              {timeValidation.valid ? (
                <div className="p-3 rounded-lg bg-surface-02 border border-border-subtle space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-tertiary flex items-center gap-1">
                      <Clock size={12} /> Window Duration:
                    </span>
                    <span className="font-mono font-semibold text-text-primary">
                      {timeValidation.formattedDuration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-tertiary flex items-center gap-1">
                      <HardDrive size={12} /> Estimated Ingestion Volume:
                    </span>
                    <span className="font-mono font-semibold text-accent">
                      ~{estimatedSizeGb} GB
                    </span>
                  </div>
                  {timeValidation.warning && (
                    <p className="text-3xs text-amber flex items-center gap-1 pt-1">
                      <AlertCircle size={10} /> {timeValidation.warning}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-red/10 border border-red/20 text-red text-xs font-mono">
                  {timeValidation.message}
                </div>
              )}
            </div>
          </div>

          {/* Scope Summary Preview */}
          <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-2xs font-mono uppercase tracking-wider text-text-tertiary">
              Acquisition Scope Summary
            </h4>

            <div className="text-xs space-y-2 divide-y divide-border-subtle/50">
              <div className="flex justify-between pt-1">
                <span className="text-text-tertiary">Investigation:</span>
                <span className="font-mono text-accent font-semibold">{investigation.id}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-text-tertiary">Device:</span>
                <span className="font-mono text-text-primary text-right truncate max-w-[200px]">
                  {fingerprint.vendor} {fingerprint.model}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-text-tertiary">Channels:</span>
                <span className="font-mono text-text-primary">
                  {selectedChannelIds.length > 0 ? selectedChannelIds.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-text-tertiary">Time Range:</span>
                <span className="font-mono text-text-secondary text-right text-3xs">
                  {new Date(startDate).toLocaleString()} → {new Date(endDate).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={onBack}
                icon={<ArrowLeft size={13} />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                disabled={!canProceed}
                onClick={() => onProceed(selectedChannelIds, startDate, endDate)}
                icon={<ArrowRight size={13} />}
                id="begin-acquisition-btn"
              >
                Begin Acquisition
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
