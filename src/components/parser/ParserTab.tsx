import { useState, useCallback } from 'react';
import {
  RotateCw,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { MOCK_PARSER_JOBS } from '../../data/mockParserJobs';
import type { ParserJob } from '../../types/parser';
import { ParserPipeline } from './ParserPipeline';
import { ChannelParserRow } from './ChannelParserRow';
import { TimestampCalibrationPanel } from './TimestampCalibrationPanel';
import { FrameExtractionStatus } from './FrameExtractionStatus';
import { NormalizationSummaryModal } from './NormalizationSummaryModal';
import { Button } from '../ui/primitives';

interface ParserTabProps {
  caseId: string;
}

export function ParserTab({ caseId }: ParserTabProps) {
  const [jobs, setJobs] = useState<ParserJob[]>(MOCK_PARSER_JOBS);
  const [activeJobId, setActiveJobId] = useState<string>(jobs[0].id);
  const [inspectingJob, setInspectingJob] = useState<ParserJob | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const activeJob = jobs.find((j) => j.id === activeJobId) || jobs[0];

  // Total metrics
  const totalFrames = jobs.reduce((acc, j) => acc + j.framesExtracted, 0);
  const totalKeyframes = jobs.reduce((acc, j) => acc + j.keyframesCount, 0);
  const skewedChannelsCount = jobs.filter((j) => Math.abs(j.timestampOffsetMs) > 100).length;
  const avgThroughput = Math.round(jobs.reduce((acc, j) => acc + j.throughputFps, 0) / jobs.length);

  // Simulate re-parse for a single job
  const handleReparse = useCallback((targetJob: ParserJob) => {
    // Reset target job to running
    setJobs((prev) =>
      prev.map((j) =>
        j.id === targetJob.id
          ? {
              ...j,
              status: 'running',
              progress: 10,
              currentStepIndex: 0,
              steps: j.steps.map((s, idx) => ({
                ...s,
                status: idx === 0 ? 'running' : 'pending',
              })),
            }
          : j
      )
    );

    // Progress through steps
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= 6) {
        clearInterval(interval);
        setJobs((prev) =>
          prev.map((j) =>
            j.id === targetJob.id
              ? {
                  ...j,
                  status: 'complete',
                  progress: 100,
                  currentStepIndex: 5,
                  steps: j.steps.map((s) => ({ ...s, status: 'completed' })),
                }
              : j
          )
        );
      } else {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === targetJob.id
              ? {
                  ...j,
                  currentStepIndex: currentStep,
                  progress: Math.round(((currentStep + 1) / 6) * 100),
                  steps: j.steps.map((s, idx) => ({
                    ...s,
                    status: idx < currentStep ? 'completed' : idx === currentStep ? 'running' : 'pending',
                  })),
                }
              : j
          )
        );
      }
    }, 450);
  }, []);

  // Simulate Batch Parse All
  const handleBatchParse = () => {
    setIsBatchRunning(true);
    jobs.forEach((job, index) => {
      setTimeout(() => {
        handleReparse(job);
        if (index === jobs.length - 1) {
          setTimeout(() => setIsBatchRunning(false), 3000);
        }
      }, index * 300);
    });
  };

  const handleExportManifest = () => {
    const manifest = {
      caseId,
      timestamp: new Date().toISOString(),
      standard: 'FORENSIC-X UNIFIED NORMALIZATION v4.0',
      totalChannels: jobs.length,
      channels: jobs.map((j) => ({
        evidenceId: j.evidenceId,
        channel: j.cameraChannel,
        filename: j.filename,
        vendor: j.vendor,
        totalFrames: j.totalFrames,
        keyframes: j.keyframesCount,
        timestampCalibrationOffsetMs: j.timestampOffsetMs,
        outputFormat: j.outputFormat,
      })),
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CASE_${caseId}_NORMALIZATION_MANIFEST.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header Summary Bar ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">
                Module 4 Core Engine
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-soft" />
            </div>
            <h2 className="text-xl font-bold text-text-primary font-mono tracking-tight">
              Multi-Vendor Parser & Evidence Normalization
            </h2>
            <p className="text-xs text-text-secondary mt-1 max-w-2xl">
              Extracts raw video frames, demuxes proprietary surveillance packaging, maps IDR keyframes, and calibrates asynchronous clock drift into a standardized stream format.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportManifest}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-surface-02 hover:bg-surface-03 border border-border-subtle text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
            >
              <Download size={14} className="text-accent" />
              <span>Export Manifest</span>
            </button>

            <Button
              variant="primary"
              size="md"
              icon={<RotateCw size={14} className={isBatchRunning ? 'animate-spin' : ''} />}
              onClick={handleBatchParse}
              loading={isBatchRunning}
            >
              {isBatchRunning ? 'Normalizing All Channels…' : 'Batch Parse All (5 Cameras)'}
            </Button>
          </div>
        </div>

        {/* Export Notification */}
        {exportNotice && (
          <div className="mt-4 p-3 bg-green-dim/70 border border-green/30 rounded-lg text-xs font-mono text-green flex items-center gap-2 animate-slide-up">
            <CheckCircle2 size={14} />
            <span>Normalization manifest exported successfully (JSON).</span>
          </div>
        )}

        {/* Global Pipeline Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-border-subtle font-mono text-xs">
          <div>
            <span className="text-2xs text-text-tertiary uppercase">Total Extracted Frames</span>
            <p className="text-lg font-bold text-text-primary mt-0.5">
              {totalFrames.toLocaleString()}
            </p>
            <span className="text-2xs text-green">100% Decoded & Indexed</span>
          </div>

          <div>
            <span className="text-2xs text-text-tertiary uppercase">IDR Keyframes Mapped</span>
            <p className="text-lg font-bold text-accent mt-0.5">
              {totalKeyframes.toLocaleString()}
            </p>
            <span className="text-2xs text-text-tertiary">Exact Seek Anchors</span>
          </div>

          <div>
            <span className="text-2xs text-text-tertiary uppercase">Clock Skew Corrected</span>
            <p className="text-lg font-bold text-amber mt-0.5">
              {skewedChannelsCount} Camera{skewedChannelsCount !== 1 ? 's' : ''}
            </p>
            <span className="text-2xs text-text-tertiary">Non-Destructive PTS Shift</span>
          </div>

          <div>
            <span className="text-2xs text-text-tertiary uppercase">Pipeline Throughput</span>
            <p className="text-lg font-bold text-text-primary mt-0.5">
              ~{avgThroughput} fps
            </p>
            <span className="text-2xs text-accent">Hardware Accelerated</span>
          </div>
        </div>
      </div>

      {/* ── Active Channel Pipeline Diagram ── */}
      <ParserPipeline job={activeJob} />

      {/* ── Channel Parser Work Queue ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary font-mono">
              Channel Parser Work Queue ({jobs.length} Exhibits)
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Select any channel to visualize its active 6-stage pipeline and frame seek table.
            </p>
          </div>
          <span className="text-2xs font-mono text-text-tertiary">
            Target Unified Format: MKV / H.264 Repack
          </span>
        </div>

        <div className="space-y-2.5">
          {jobs.map((job) => (
            <ChannelParserRow
              key={job.id}
              job={job}
              isActive={job.id === activeJobId}
              onSelect={(j) => setActiveJobId(j.id)}
              onReparse={handleReparse}
              onViewSummary={(j) => setInspectingJob(j)}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom Side-by-Side: Timestamp Calibration & Frame Extraction ── */}
      <div className="space-y-8">
        <TimestampCalibrationPanel jobs={jobs} activeJob={activeJob} />
        <FrameExtractionStatus job={activeJob} />
      </div>

      {/* ── Repack Specs Modal ── */}
      {inspectingJob && (
        <NormalizationSummaryModal
          job={inspectingJob}
          onClose={() => setInspectingJob(null)}
        />
      )}
    </div>
  );
}
