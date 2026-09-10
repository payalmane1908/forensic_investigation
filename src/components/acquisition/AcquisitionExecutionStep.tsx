import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  FolderOpen,
  RotateCcw,
  Hash,
  FileCheck,
  Video,
} from 'lucide-react';
import type {
  DeviceConnection,
  DeviceFingerprint,
  AcquisitionJob,
} from '../../types/acquisition';
import type { Investigation } from '../../types/investigation';
import type { EvidenceItem } from '../../types/evidence';
import { acquisitionService } from '../../services/acquisition/acquisitionService';
import { Button } from '../ui/primitives';

interface AcquisitionExecutionStepProps {
  investigation: Investigation;
  device: DeviceConnection;
  fingerprint: DeviceFingerprint;
  channelIds: string[];
  startTime: string;
  endTime: string;
  caseId: string;
  investigator: string;
  onEvidenceRegistered: (items: EvidenceItem[]) => void;
  onViewEvidence: () => void;
  onReset: () => void;
}

type ChannelState = 'Preparing' | 'Acquiring' | 'Finalizing' | 'Completed';

interface ChannelProgress {
  id: string;
  progress: number; // 0-100
  state: ChannelState;
  hash: string;
}

export function AcquisitionExecutionStep({
  investigation,
  device,
  fingerprint,
  channelIds,
  startTime,
  endTime,
  caseId,
  investigator,
  onEvidenceRegistered,
  onViewEvidence,
  onReset,
}: AcquisitionExecutionStepProps) {
  // Pre-generate simulated hashes for each channel
  const [channelsProgress, setChannelsProgress] = useState<ChannelProgress[]>(() =>
    channelIds.map((id) => ({
      id,
      progress: 0,
      state: 'Preparing',
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    }))
  );

  const [isCompleted, setIsCompleted] = useState(false);
  const [createdEvidence, setCreatedEvidence] = useState<EvidenceItem[]>([]);
  const hasRegisteredRef = useRef(false);

  // Progressive simulation timer
  useEffect(() => {
    const interval = setInterval(() => {
      setChannelsProgress((prev) => {
        let allDone = true;
        const next = prev.map((ch) => {
          if (ch.progress >= 100) return ch;
          allDone = false;

          // Increment progress with small jitter per channel
          const increment = Math.floor(8 + Math.random() * 12);
          const newProgress = Math.min(100, ch.progress + increment);

          let state: ChannelState = 'Preparing';
          if (newProgress < 20) state = 'Preparing';
          else if (newProgress < 85) state = 'Acquiring';
          else if (newProgress < 100) state = 'Finalizing';
          else state = 'Completed';

          return {
            ...ch,
            progress: newProgress,
            state,
          };
        });

        if (allDone && !hasRegisteredRef.current) {
          hasRegisteredRef.current = true;
          clearInterval(interval);

          // Build acquisition job
          const job: AcquisitionJob = {
            id: `ACQ-${Date.now().toString().slice(-6)}`,
            investigationId: investigation.id,
            status: 'completed',
            device,
            fingerprint,
            channelIds,
            startTime,
            endTime,
            progress: 100,
            evidenceIds: [],
            createdAt: new Date().toISOString(),
          };

          const evidenceItems = acquisitionService.createEvidenceFromAcquisition(
            job,
            caseId,
            investigator
          );
          setCreatedEvidence(evidenceItems);
          setIsCompleted(true);
          onEvidenceRegistered(evidenceItems);
        }

        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [channelIds, investigation.id, device, fingerprint, startTime, endTime, caseId, investigator, onEvidenceRegistered]);

  // Overall aggregate percentage
  const totalProgress = Math.round(
    channelsProgress.reduce((sum, c) => sum + c.progress, 0) / (channelsProgress.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      <div className="flex items-start justify-between p-4 rounded-lg bg-surface-01 border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface-02 border border-border-subtle text-accent">
            <Video size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">
                Surveillance Footage Stream Pull
              </h3>
              <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-amber/10 border border-amber/30 text-amber font-semibold">
                DEMO / SIMULATED
              </span>
            </div>
            <p className="text-xs text-text-tertiary mt-0.5">
              Target: {device.ipAddress}:{device.port} ({fingerprint.vendor} {fingerprint.model}) | Context: {investigation.id}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-mono font-bold text-accent">
            {totalProgress}%
          </div>
          <span className="text-3xs font-mono uppercase text-text-tertiary">
            {isCompleted ? 'Finished' : 'Acquiring'}
          </span>
        </div>
      </div>

      {/* Progress Cards per Channel */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-4">
        <h4 className="text-2xs font-mono uppercase tracking-wider text-text-tertiary">
          Channel Stream Extraction Progress
        </h4>

        <div className="space-y-3">
          {channelsProgress.map((ch) => (
            <div
              key={ch.id}
              className="p-3.5 rounded-lg bg-surface-02 border border-border-subtle space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-text-primary px-2 py-0.5 rounded bg-surface-01 border border-border-subtle">
                    {ch.id}
                  </span>
                  <span className="text-text-secondary text-2xs">
                    {ch.state === 'Preparing' && 'Negotiating RTSP session...'}
                    {ch.state === 'Acquiring' && 'Pulling video segments & PTS timestamps...'}
                    {ch.state === 'Finalizing' && 'Calculating checksum & container muxing...'}
                    {ch.state === 'Completed' && 'Footage segment acquired successfully'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-3xs uppercase font-semibold px-2 py-0.5 rounded border ${
                      ch.state === 'Completed'
                        ? 'bg-green/10 text-green border-green/30'
                        : 'bg-accent/10 text-accent border-accent/20'
                    }`}
                  >
                    {ch.state}
                  </span>
                  <span className="font-mono font-bold text-xs text-text-primary w-10 text-right">
                    {ch.progress}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-surface-base border border-border-subtle overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    ch.progress === 100 ? 'bg-green' : 'bg-accent'
                  }`}
                  style={{ width: `${ch.progress}%` }}
                />
              </div>

              {/* Real-time Hash Representation */}
              <div className="flex items-center justify-between text-3xs font-mono pt-1 text-text-tertiary">
                <span className="flex items-center gap-1">
                  <Hash size={10} />
                  Simulated SHA-256:
                </span>
                <span className="text-text-secondary font-mono truncate max-w-[340px]">
                  {ch.hash}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Integrity Representation */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <FileCheck size={16} className="text-green" />
            <h4 className="text-sm font-semibold text-text-primary">
              Integrity &amp; Cryptographic Traceability
            </h4>
          </div>
          <span className="text-3xs font-mono uppercase px-2 py-0.5 rounded bg-amber/10 text-amber border border-amber/30">
            DEMO HASH / SIMULATED INTEGRITY
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-02 border border-border-subtle space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-border-subtle/50">
            <span className="text-text-tertiary">Algorithm:</span>
            <span className="font-mono font-semibold text-text-primary">SHA-256 (Simulated)</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border-subtle/50">
            <span className="text-text-tertiary">Chain of Custody Record:</span>
            <span className="font-mono text-green flex items-center gap-1">
              <CheckCircle2 size={12} /> Auto-Appended to Case Ledger
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-text-tertiary">Integrity Status:</span>
            <span className="font-mono text-green font-bold">RECORDED (SIMULATED)</span>
          </div>
        </div>

        <p className="text-3xs text-text-tertiary leading-relaxed">
          * Notice: FORENSIC-X strictly flags simulated acquisition runs with &ldquo;DEMO HASH&rdquo;.
          True physical drive bit-stream images and hardware-level acquisitions require authorized forensic write-blockers.
        </p>
      </div>

      {/* Completion Banner & Next Actions */}
      {isCompleted && (
        <div className="p-5 rounded-xl bg-green/10 border border-green/30 text-text-primary space-y-4 animate-fade-in shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={22} className="text-green shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-green font-mono uppercase tracking-wide">
                ACQUISITION COMPLETE — DEMO
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Successfully acquired {channelsProgress.length} channel streams for{' '}
                <span className="text-text-primary font-semibold font-mono">{investigation.id}</span>.
                Evidence records and custody logs have been created and registered to Case{' '}
                <span className="text-text-primary font-semibold font-mono">{caseId}</span>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-surface-base/80 p-3.5 rounded-lg border border-border-subtle">
            <div>
              <span className="text-3xs text-text-tertiary block">Investigation</span>
              <span className="font-semibold text-accent">{investigation.id}</span>
            </div>
            <div>
              <span className="text-3xs text-text-tertiary block">Target Device</span>
              <span className="truncate block">{fingerprint.vendor}</span>
            </div>
            <div>
              <span className="text-3xs text-text-tertiary block">Channels</span>
              <span>{channelIds.join(', ')}</span>
            </div>
            <div>
              <span className="text-3xs text-text-tertiary block">Evidence Registered</span>
              <span className="font-bold text-green">{createdEvidence.length} items</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="secondary"
              onClick={onReset}
              icon={<RotateCcw size={13} />}
            >
              Start Another Acquisition
            </Button>

            <Button
              variant="primary"
              onClick={onViewEvidence}
              icon={<FolderOpen size={13} />}
              id="view-acquired-evidence-btn"
            >
              View Evidence ({createdEvidence.length} New Items)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
