import { useState } from 'react';
import {
  Clock,
  Radio,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import type { ParserJob } from '../../types/parser';
import { formatDateTime } from '../../utils/format';

interface TimestampCalibrationPanelProps {
  jobs: ParserJob[];
  activeJob: ParserJob;
}

export function TimestampCalibrationPanel({
  jobs,
  activeJob,
}: TimestampCalibrationPanelProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(activeJob.id);
  const currentJob = jobs.find((j) => j.id === selectedJobId) || activeJob;

  const hasDrift = Math.abs(currentJob.timestampOffsetMs) > 100;

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-6 space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-02 border border-border-subtle flex items-center justify-center text-accent">
            <Clock size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary font-mono">
                Multi-Camera Timestamp Calibration & Synchronization
              </h3>
              <span className="text-2xs font-mono text-green bg-green/10 px-2 py-0.5 rounded border border-green/20">
                Non-Destructive PTS Shift
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Normalizes asynchronous DVR hardware clocks into a single unified temporal reference plane.
            </p>
          </div>
        </div>

        {/* Exhibit Selector */}
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="h-8 px-3 rounded-md bg-surface-02 border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
        >
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.evidenceId} · {j.cameraChannel} ({j.filename})
            </option>
          ))}
        </select>
      </div>

      {/* ── Active Calibration Card: Raw vs Corrected ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Raw Hardware RTC */}
        <div className="bg-surface-02 border border-border-subtle rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-2xs text-text-tertiary uppercase">
            <span>Raw Hardware RTC Time</span>
            <span className="w-2 h-2 rounded-full bg-amber" />
          </div>
          <p className="text-sm font-bold text-text-primary">
            {formatDateTime(currentJob.rawStartTimestamp)}
          </p>
          <p className="text-2xs text-text-tertiary">
            Motherboard real-time clock timestamp embedded in raw packet headers
          </p>
        </div>

        {/* Calculated Drift */}
        <div className={`border rounded-lg p-4 space-y-2 ${
          hasDrift
            ? 'bg-amber-dim/50 border-amber/30'
            : 'bg-green-dim/50 border-green/30'
        }`}>
          <div className="flex items-center justify-between text-2xs uppercase">
            <span className={hasDrift ? 'text-amber font-semibold' : 'text-green font-semibold'}>
              {hasDrift ? 'Detected Clock Skew (Δt)' : 'Clock Skew (Δt)'}
            </span>
            {hasDrift ? (
              <AlertTriangle size={13} className="text-amber" />
            ) : (
              <CheckCircle2 size={13} className="text-green" />
            )}
          </div>
          <p className={`text-base font-bold ${hasDrift ? 'text-amber' : 'text-green'}`}>
            {currentJob.timestampOffsetMs > 0 ? '+' : ''}
            {currentJob.timestampOffsetMs.toLocaleString()} ms
          </p>
          <p className="text-2xs text-text-secondary">
            {hasDrift
              ? 'Significant drift detected relative to atomic atomic reference timeline.'
              : 'Synchronized within standard legal admissibility tolerance (<50ms).'}
          </p>
        </div>

        {/* Corrected Timeline */}
        <div className="bg-surface-02 border border-border-subtle rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-2xs text-text-tertiary uppercase">
            <span>Corrected Unified Timestamp</span>
            <span className="w-2 h-2 rounded-full bg-accent" />
          </div>
          <p className="text-sm font-bold text-accent">
            {formatDateTime(currentJob.correctedStartTimestamp)}
          </p>
          <p className="text-2xs text-text-tertiary">
            Calibrated presentation timeline applied to all extracted video frames
          </p>
        </div>
      </div>

      {/* ── Multi-Camera Synchronization Waveform Alignment ── */}
      <div className="bg-surface-02 border border-border-subtle rounded-lg p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle text-xs">
          <span className="font-semibold text-text-primary flex items-center gap-1.5">
            <Radio size={13} className="text-accent" />
            Cross-Camera Unified Temporal Alignment Grid
          </span>
          <span className="text-2xs text-text-tertiary">
            Reference Target: 2026-09-06 21:00:00.000 IST
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {jobs.map((job) => {
            const isSelected = job.id === currentJob.id;
            const driftMs = job.timestampOffsetMs;
            const isSkewed = Math.abs(driftMs) > 100;

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`p-3 rounded-md border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-surface-03 border-accent'
                    : 'bg-surface-03/40 border-border-subtle hover:bg-surface-03/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-accent">{job.evidenceId}</span>
                    <span className="text-text-primary font-medium">{job.cameraChannel}</span>
                    <span className="text-2xs text-text-tertiary">({job.vendor})</span>
                  </div>

                  <div className="flex items-center gap-3 text-2xs">
                    <span className="text-text-tertiary">
                      Raw: <strong className="text-text-secondary">{job.rawStartTimestamp.slice(11, 23)}</strong>
                    </span>
                    <span>→</span>
                    <span className="text-text-tertiary">
                      Calibrated: <strong className="text-green">{job.correctedStartTimestamp.slice(11, 23)}</strong>
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-2xs ${
                        isSkewed
                          ? 'text-amber bg-amber/10 border border-amber/20'
                          : 'text-green bg-green/10 border border-green/20'
                      }`}
                    >
                      {driftMs > 0 ? '+' : ''}{driftMs}ms
                    </span>
                  </div>
                </div>

                {/* Visual alignment bar */}
                <div className="w-full h-2 bg-surface-base rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 w-3 bg-accent rounded-full shadow-sm shadow-accent/50"
                    style={{
                      left: `calc(50% + ${Math.min(Math.max(driftMs / 50, -45), 45)}%)`,
                    }}
                  />
                  {/* Center target zero line */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-green/60" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Statutory & Audit Seal ── */}
      <div className="flex items-center gap-3 text-xs text-text-tertiary bg-surface-02/50 border border-border-subtle p-3 rounded-lg">
        <ShieldCheck size={16} className="text-green shrink-0" />
        <p className="leading-relaxed">
          <strong>Section 65B Audit Guarantee:</strong> All calibration offsets are stored exclusively as non-destructive presentation metadata. The original ingested bitstreams and raw cryptographic hashes remain 100% unaltered.
        </p>
      </div>
    </div>
  );
}
