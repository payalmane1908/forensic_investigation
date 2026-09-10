import { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Clock,
  Camera,
  Maximize2,
} from 'lucide-react';
import type { DetectionEvent } from '../../types/investigation';
import { Button } from '../ui/primitives';

interface TimelineSyncViewProps {
  detections: DetectionEvent[];
  onInspect: (detection: DetectionEvent) => void;
}

export function TimelineSyncView({
  detections,
  onInspect,
}: TimelineSyncViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(
    detections[0]?.id ?? null
  );

  // Derive unique camera channels
  const channels = useMemo(() => {
    const map = new Map<string, { channel: string; location: string }>();
    detections.forEach((d) => {
      if (!map.has(d.cameraChannel)) {
        map.set(d.cameraChannel, {
          channel: d.cameraChannel,
          location: d.cameraLocation,
        });
      }
    });
    return Array.from(map.values());
  }, [detections]);

  // Derive time span for axis (min time to max time)
  const { minTime, timeRangeMs } = useMemo(() => {
    if (detections.length === 0) {
      const now = Date.now();
      return { minTime: now - 3600000, timeRangeMs: 3600000 };
    }
    const times = detections.map((d) => new Date(d.calibratedTimestamp).getTime());
    const min = Math.min(...times) - 60000; // 1 min buffer before
    const max = Math.max(...times) + 60000; // 1 min buffer after
    return { minTime: min, timeRangeMs: Math.max(max - min, 60000) };
  }, [detections]);

  // Selected detection
  const activeDetection = useMemo(() => {
    return detections.find((d) => d.id === selectedDetectionId) ?? detections[0];
  }, [detections, selectedDetectionId]);

  // Calculate percentage along timeline
  const getPercentPosition = (isoTime: string) => {
    const t = new Date(isoTime).getTime();
    const pct = ((t - minTime) / timeRangeMs) * 100;
    return Math.max(2, Math.min(98, pct));
  };

  // Generate 6 time ticks
  const timeTicks = useMemo(() => {
    const count = 6;
    const ticks = [];
    for (let i = 0; i <= count; i++) {
      const t = minTime + (timeRangeMs * i) / count;
      ticks.push({
        pct: (i / count) * 100,
        label: new Date(t).toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      });
    }
    return ticks;
  }, [minTime, timeRangeMs]);

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 space-y-6">
      {/* ── Top Bar Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={15} className="text-accent" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-secondary">
              Multi-Channel Synchronized Time Base
            </span>
          </div>
          <p className="text-xs text-text-tertiary">
            Calibrated clock timeline aligning disparate DVR/NVR channels down to the millisecond.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={isPlaying ? <Pause size={13} /> : <Play size={13} />}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? 'Pause Scrubber' : 'Play Timeline'}
          </Button>
          <div className="px-3 py-1.5 rounded-lg bg-surface-base border border-border-subtle text-xs font-mono text-text-secondary">
            Channels: <span className="text-accent font-bold">{channels.length}</span> | Events:{' '}
            <span className="text-green font-bold">{detections.length}</span>
          </div>
        </div>
      </div>

      {/* ── The Multi-Channel Timeline Area ── */}
      <div className="relative overflow-x-auto select-none pt-6 pb-4">
        {/* Time axis header */}
        <div className="relative h-6 mb-3 ml-44 border-b border-border-subtle/80">
          {timeTicks.map((tick, idx) => (
            <div
              key={idx}
              className="absolute -top-1 -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${tick.pct}%` }}
            >
              <span className="text-3xs font-mono text-text-tertiary">{tick.label}</span>
              <div className="w-px h-2 bg-border-default mt-1" />
            </div>
          ))}
        </div>

        {/* Camera channel tracks */}
        <div className="space-y-3">
          {channels.map((ch) => {
            const channelDetections = detections.filter(
              (d) => d.cameraChannel === ch.channel
            );

            return (
              <div key={ch.channel} className="flex items-center gap-4 group">
                {/* Left lane label */}
                <div className="w-40 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Camera size={13} className="text-accent shrink-0" />
                    <span className="font-mono text-xs font-bold text-text-primary truncate">
                      {ch.channel}
                    </span>
                  </div>
                  <p className="text-3xs text-text-tertiary truncate">{ch.location}</p>
                </div>

                {/* Track Lane */}
                <div className="relative flex-1 h-12 bg-surface-base/90 rounded-lg border border-border-subtle group-hover:border-border-default transition-colors">
                  {/* Track centerline */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-border-subtle/40" />

                  {/* Event Markers along this track */}
                  {channelDetections.map((det) => {
                    const pct = getPercentPosition(det.calibratedTimestamp);
                    const isSelected = det.id === activeDetection?.id;

                    return (
                      <div
                        key={det.id}
                        onClick={() => setSelectedDetectionId(det.id)}
                        style={{ left: `${pct}%` }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer z-10"
                      >
                        <div
                          className={`group/marker relative flex items-center justify-center transition-all ${
                            isSelected
                              ? 'w-7 h-7 rounded-lg bg-accent text-white shadow-lg shadow-accent/40 ring-2 ring-white scale-110'
                              : 'w-6 h-6 rounded-md bg-surface-02 border border-border-default hover:border-accent text-text-primary hover:scale-105'
                          }`}
                        >
                          <span className="text-3xs font-mono font-bold uppercase">
                            {det.targetType === 'vehicle'
                              ? 'V'
                              : det.targetType === 'person'
                              ? 'P'
                              : det.targetType === 'license_plate'
                              ? 'ANPR'
                              : 'OBJ'}
                          </span>

                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/marker:flex flex-col items-center pointer-events-none z-30">
                            <div className="bg-surface-03 border border-border-default text-text-primary px-2.5 py-1.5 rounded shadow-xl text-3xs font-mono whitespace-nowrap">
                              <p className="font-semibold text-accent">{det.label}</p>
                              <p className="text-text-tertiary">
                                {new Date(det.calibratedTimestamp).toLocaleTimeString('en-GB')} •{' '}
                                {(det.confidence * 100).toFixed(0)}% Conf
                              </p>
                            </div>
                            <div className="w-2 h-2 bg-surface-03 border-r border-b border-border-default rotate-45 -mt-1" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active Synchronized Event Preview Strip ── */}
      {activeDetection && (
        <div className="mt-6 p-4 rounded-xl bg-surface-base border border-accent/30 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-24 aspect-video rounded-lg bg-slate-900 border border-border-default overflow-hidden relative shrink-0">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${activeDetection.svgThumbnailBg} opacity-80`}
              />
              <div
                className="absolute border border-accent"
                style={{
                  left: `${activeDetection.boundingBox.x}%`,
                  top: `${activeDetection.boundingBox.y}%`,
                  width: `${activeDetection.boundingBox.width}%`,
                  height: `${activeDetection.boundingBox.height}%`,
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-2xs px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/30 font-bold">
                  {activeDetection.cameraChannel}
                </span>
                <span className="font-mono text-2xs text-text-tertiary">
                  CALIBRATED: {new Date(activeDetection.calibratedTimestamp).toLocaleTimeString('en-GB')}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-text-primary">
                {activeDetection.label}
              </h4>
              <p className="text-xs text-text-secondary">
                Location: {activeDetection.cameraLocation} • Direction: {activeDetection.attributes.direction ?? 'Unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="sm"
              icon={<Maximize2 size={13} />}
              onClick={() => onInspect(activeDetection)}
            >
              Inspect Full Frame
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
