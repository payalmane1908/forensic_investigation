import { useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileSearch,
  Split,
  Cpu,
  Clock,
  Key,
  Layers,
} from 'lucide-react';
import type { ParserJob } from '../../types/parser';

interface ParserPipelineProps {
  job: ParserJob;
}

const STEP_ICONS: Record<string, typeof FileSearch> = {
  container_decode: FileSearch,
  stream_demux: Split,
  codec_identification: Cpu,
  timestamp_extraction: Clock,
  frame_indexing: Key,
  normalization: Layers,
};

export function ParserPipeline({ job }: ParserPipelineProps) {
  const [selectedStepId, setSelectedStepId] = useState<string>(job.steps[job.currentStepIndex]?.id || job.steps[0].id);

  const selectedStep = job.steps.find((s) => s.id === selectedStepId) || job.steps[0];
  const StepIcon = STEP_ICONS[selectedStep.id] || Layers;

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-6 space-y-6">
      {/* ── Pipeline Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">
              Multi-Vendor Normalization Pipeline
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-soft" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-text-primary font-mono">
              6-Stage Demux & Calibration Pipeline
            </h3>
            <span className="text-2xs font-mono text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded">
              Active: {job.filename}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="text-right">
            <span className="text-text-tertiary text-2xs block">Total Pipeline Time</span>
            <span className="text-text-primary font-semibold">
              {(job.steps.reduce((acc, s) => acc + (s.elapsedMs || 0), 0) / 1000).toFixed(2)}s
            </span>
          </div>
          <div className="h-6 w-px bg-border-subtle" />
          <div className="text-right">
            <span className="text-text-tertiary text-2xs block">Average Throughput</span>
            <span className="text-accent font-semibold">{job.throughputFps} fps</span>
          </div>
        </div>
      </div>

      {/* ── 6-Stage Pipeline Flow (Horizontal Cards with Flow Indicators) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative">
        {job.steps.map((step, idx) => {
          const isSelected = step.id === selectedStepId;
          const IconComponent = STEP_ICONS[step.id] || Layers;
          const isComplete = step.status === 'completed';
          const isRunning = step.status === 'running';
          const isError = step.status === 'error';

          return (
            <button
              key={step.id}
              onClick={() => setSelectedStepId(step.id)}
              className={`text-left p-3.5 rounded-lg border transition-all duration-150 relative flex flex-col justify-between min-h-[120px] ${
                isSelected
                  ? 'bg-surface-02 border-accent shadow-sm ring-1 ring-accent/30'
                  : 'bg-surface-02/50 border-border-subtle hover:bg-surface-02 hover:border-border-default'
              }`}
            >
              {/* Step number badge & status */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-mono font-bold text-text-tertiary">
                  0{idx + 1}
                </span>

                {isComplete && (
                  <CheckCircle2 size={14} className="text-green shrink-0" />
                )}
                {isRunning && (
                  <Loader2 size={14} className="text-accent animate-spin shrink-0" />
                )}
                {isError && (
                  <AlertCircle size={14} className="text-red shrink-0" />
                )}
                {step.status === 'pending' && (
                  <span className="w-2 h-2 rounded-full bg-border-default shrink-0" />
                )}
              </div>

              {/* Title & icon */}
              <div>
                <div className="flex items-center gap-1.5 mb-1 text-accent">
                  <IconComponent size={13} />
                  <span className="text-xs font-semibold text-text-primary font-mono truncate">
                    {step.label}
                  </span>
                </div>
                <p className="text-2xs text-text-secondary truncate">{step.sublabel}</p>
              </div>

              {/* Timing metrics footer */}
              <div className="mt-2 pt-2 border-t border-border-subtle/50 flex items-center justify-between text-2xs font-mono text-text-tertiary">
                <span>{step.elapsedMs ? `${step.elapsedMs}ms` : '—'}</span>
                <span className="truncate">{step.throughput || '—'}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Selected Step Forensic Deep Dive ── */}
      <div className="bg-surface-02 border border-border-subtle rounded-lg p-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-border-subtle/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <StepIcon size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-text-primary font-mono">
                  {selectedStep.label} · Deep Inspection
                </h4>
                <span className="text-2xs font-mono text-green bg-green/10 px-2 py-0.5 rounded border border-green/20">
                  Step Verified
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">{selectedStep.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-text-tertiary">
            <span>Latency: <strong className="text-text-primary">{selectedStep.elapsedMs}ms</strong></span>
            <span>·</span>
            <span>Speed: <strong className="text-accent">{selectedStep.throughput}</strong></span>
          </div>
        </div>

        {/* Forensic Execution Log */}
        <div className="space-y-2 font-mono text-xs">
          <span className="text-2xs uppercase tracking-wider text-text-tertiary block font-bold">
            Forensic Operations Executed
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {selectedStep.details.map((detail, i) => (
              <div
                key={i}
                className="bg-surface-03/70 border border-border-subtle rounded-md p-2.5 flex items-start gap-2"
              >
                <CheckCircle2 size={13} className="text-green shrink-0 mt-0.5" />
                <span className="text-text-primary text-xs leading-snug">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
