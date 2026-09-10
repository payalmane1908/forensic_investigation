import { useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { MOCK_SUSPECT_JOURNEYS } from '../../data/mockInvestigation';
import { MonoLabel } from '../ui/primitives';

interface SuspectJourneyMapProps {
  caseId?: string;
  onInspectDetectionId?: (detId: string) => void;
}

export function SuspectJourneyMap({
  caseId,
  onInspectDetectionId,
}: SuspectJourneyMapProps) {
  // Filter journeys for this case if caseId is passed
  const availableJourneys = caseId
    ? MOCK_SUSPECT_JOURNEYS.filter((j) => j.caseId === caseId)
    : MOCK_SUSPECT_JOURNEYS;

  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(
    availableJourneys[0]?.id ?? 'SJ-01'
  );

  const activeJourney =
    availableJourneys.find((j) => j.id === selectedJourneyId) ?? availableJourneys[0];

  if (!activeJourney) {
    return (
      <div className="p-12 text-center bg-surface-01 border border-border-subtle rounded-xl text-text-secondary">
        <GitFork size={28} className="mx-auto text-text-tertiary mb-3" />
        <p className="text-sm font-medium">No cross-camera suspect journeys indexed for this case.</p>
        <p className="text-xs text-text-tertiary mt-1">
          Ingest additional camera streams to reconstruct transit routes automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Journey Selector Bar ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-mono uppercase tracking-wider text-text-tertiary">
            Automated Re-Identification Corridor
          </span>
          <h3 className="text-base font-bold text-text-primary mt-0.5">
            Cross-Camera Transit Reconstruction
          </h3>
        </div>

        {/* Selector pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {availableJourneys.map((j) => {
            const isSelected = j.id === activeJourney.id;
            return (
              <button
                key={j.id}
                onClick={() => setSelectedJourneyId(j.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-surface-02 border-accent text-accent shadow-sm'
                    : 'bg-surface-base border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                <GitFork size={13} />
                <span className="font-mono">{j.id}:</span>
                <span className="truncate max-w-44">{j.targetName}</span>
                <span className="px-1.5 py-0.2 rounded bg-green-dim text-green text-3xs font-mono">
                  {(j.confidenceScore * 100).toFixed(0)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Journey Summary Card ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MonoLabel className="text-accent">{activeJourney.id}</MonoLabel>
              <h2 className="text-lg font-bold text-text-primary">
                {activeJourney.targetName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-green-dim text-green border border-green/20 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                <span>Re-ID Match {(activeJourney.confidenceScore * 100).toFixed(0)}%</span>
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Transit timeline spanning {activeJourney.totalCheckpoints} camera checkpoints • First sighted{' '}
              <span className="font-mono text-text-primary">
                {new Date(activeJourney.firstSeen).toLocaleTimeString('en-GB')}
              </span>{' '}
              → Last sighted{' '}
              <span className="font-mono text-text-primary">
                {new Date(activeJourney.lastSeen).toLocaleTimeString('en-GB')}
              </span>
            </p>
          </div>

          {/* Re-ID Feature Vector Tags */}
          <div className="lg:max-w-md">
            <span className="text-2xs font-mono uppercase text-text-tertiary block mb-1.5">
              Correlated Feature Descriptors:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeJourney.reIdFeatures.map((feat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-surface-base border border-border-subtle text-text-secondary text-2xs font-mono"
                >
                  ✓ {feat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Step-by-Step Waypoint Stepper ── */}
        <div className="mt-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-8 right-8 h-0.5 bg-gradient-to-r from-accent via-accent-hover to-accent-hover/40 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {activeJourney.waypoints.map((wp) => {
              return (
                <div
                  key={wp.step}
                  onClick={() => onInspectDetectionId?.(wp.detectionId)}
                  className="bg-surface-base border border-border-subtle hover:border-accent/40 rounded-xl p-4 transition-all group cursor-pointer"
                >
                  {/* Step header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-accent text-white font-mono text-xs font-bold flex items-center justify-center shadow-md shadow-accent/20">
                        {wp.step}
                      </div>
                      <span className="font-mono text-xs font-bold text-accent">
                        {wp.cameraChannel}
                      </span>
                    </div>
                    <span className="text-2xs font-mono text-text-tertiary">
                      {new Date(wp.timestamp).toLocaleTimeString('en-GB', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Simulated Frame Preview */}
                  <div className="w-full aspect-video rounded-lg bg-surface-02 border border-border-subtle relative overflow-hidden mb-3">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950/60 to-black" />
                    
                    {/* Bounding box */}
                    <div
                      className="absolute border border-accent/80 shadow"
                      style={{
                        left: `${wp.boundingBox.x}%`,
                        top: `${wp.boundingBox.y}%`,
                        width: `${wp.boundingBox.width}%`,
                        height: `${wp.boundingBox.height}%`,
                      }}
                    />

                    {/* Frame watermark */}
                    <div className="absolute bottom-1.5 left-2 font-mono text-3xs text-white/70">
                      {wp.cameraChannel} • {wp.direction}
                    </div>
                  </div>

                  {/* Location & action summary */}
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <MapPin size={13} className="text-text-tertiary shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-text-primary leading-tight">
                        {wp.cameraLocation}
                      </p>
                    </div>
                    <p className="text-2xs text-text-secondary">
                      {wp.thumbnailSummary}
                    </p>
                  </div>

                  {/* Distance & velocity metric */}
                  <div className="mt-3 pt-3 border-t border-border-subtle/60 flex items-center justify-between text-3xs font-mono text-text-tertiary">
                    <span>
                      Dist: {wp.distanceFromPreviousMeters ? `${wp.distanceFromPreviousMeters}m` : 'Origin'}
                    </span>
                    <span className="text-accent font-semibold">
                      Speed: {wp.estimatedTransitSpeedKmph ? `${wp.estimatedTransitSpeedKmph} km/h` : 'N/A'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
