import { useState, useEffect } from 'react';
import {
  Radio,
  Plus,
  AlertTriangle,
  Check,
} from 'lucide-react';
import type {
  DeviceConnection,
  DeviceFingerprint,
  AcquisitionChannel,
} from '../../types/acquisition';
import type { Investigation } from '../../types/investigation';
import type { EvidenceItem } from '../../types/evidence';
import { acquisitionService } from '../../services/acquisition/acquisitionService';
import { DeviceConnectionStep } from './DeviceConnectionStep';
import { ChannelSelectionStep } from './ChannelSelectionStep';
import { AcquisitionExecutionStep } from './AcquisitionExecutionStep';
import { Button, MonoLabel } from '../ui/primitives';

interface AcquisitionWizardProps {
  caseId: string;
  investigator: string;
  investigations: Investigation[];
  onEvidenceAdded: (items: EvidenceItem[]) => void;
  onNavigateToInvestigate: () => void;
  onNavigateToEvidence: () => void;
}

type WizardStage = 'device' | 'scope' | 'execution';

export function AcquisitionWizard({
  caseId,
  investigator,
  investigations,
  onEvidenceAdded,
  onNavigateToInvestigate,
  onNavigateToEvidence,
}: AcquisitionWizardProps) {
  // Investigation Context selection
  const [selectedInvestigationId, setSelectedInvestigationId] = useState<string | null>(
    () => (investigations.length > 0 ? investigations[0].id : null)
  );

  // Keep selected ID valid if investigations change
  useEffect(() => {
    if (investigations.length > 0 && (!selectedInvestigationId || !investigations.find((i) => i.id === selectedInvestigationId))) {
      setSelectedInvestigationId(investigations[0].id);
    }
  }, [investigations, selectedInvestigationId]);

  // Wizard state
  const [stage, setStage] = useState<WizardStage>('device');
  const [connection, setConnection] = useState<DeviceConnection | undefined>();
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint | undefined>();
  const [availableChannels, setAvailableChannels] = useState<AcquisitionChannel[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // ─── Case Has No Investigation: Hard Stop Requirement ─────────────────────────
  if (investigations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 max-w-lg mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber/10 border border-amber/30 text-amber flex items-center justify-center mb-5">
          <AlertTriangle size={24} />
        </div>
        <p className="text-2xs font-mono uppercase tracking-widest text-amber font-semibold mb-2">
          NO INVESTIGATION ASSOCIATED
        </p>
        <h3 className="text-base font-semibold text-text-primary mb-2">
          Investigation Context Required
        </h3>
        <p className="text-xs text-text-secondary leading-relaxed mb-6">
          Forensic standard protocol dictates that all evidence acquisition must be tied to a documented investigation hypothesis or operational objective. Create an investigation before starting a forensic acquisition.
        </p>
        <Button
          variant="primary"
          icon={<Plus size={14} />}
          onClick={onNavigateToInvestigate}
          id="create-investigation-for-acq-btn"
        >
          Create Investigation
        </Button>
      </div>
    );
  }

  const selectedInv = investigations.find((inv) => inv.id === selectedInvestigationId) ?? investigations[0];

  // Stage 1 -> Stage 2
  const handleDeviceConnected = async (conn: DeviceConnection, fp: DeviceFingerprint) => {
    setConnection(conn);
    setFingerprint(fp);
    const chs = await acquisitionService.discoverChannels(conn);
    setAvailableChannels(chs);
    setStage('scope');
  };

  // Stage 2 -> Stage 3
  const handleScopeConfirmed = (channelIds: string[], start: string, end: string) => {
    setSelectedChannelIds(channelIds);
    setTimeRange({ start, end });
    setStage('execution');
  };

  const handleReset = () => {
    setStage('device');
    setConnection(undefined);
    setFingerprint(undefined);
    setSelectedChannelIds([]);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Investigation Selector & Step Indicator ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        {/* Investigation Context Selection */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-02 border border-border-subtle flex items-center justify-center text-accent shrink-0">
            <Radio size={16} />
          </div>
          <div>
            <span className="text-3xs font-mono uppercase tracking-wider text-text-tertiary block">
              Acquisition Investigation Context
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedInvestigationId ?? ''}
                onChange={(e) => setSelectedInvestigationId(e.target.value)}
                className="text-xs font-semibold text-text-primary bg-surface-02 border border-border-default rounded-md px-2.5 py-1 focus:outline-none focus:border-accent cursor-pointer"
              >
                {investigations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.id} — {inv.title}
                  </option>
                ))}
              </select>
              <MonoLabel className="text-accent">{selectedInv.id}</MonoLabel>
            </div>
          </div>
        </div>

        {/* Wizard Stepper */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end text-xs font-mono">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
            stage === 'device'
              ? 'bg-accent/10 text-accent border-accent/40 font-semibold'
              : connection
              ? 'bg-surface-02 text-green border-border-subtle'
              : 'bg-surface-02 text-text-tertiary border-border-subtle'
          }`}>
            {connection ? <Check size={11} className="text-green" /> : <span>1</span>}
            <span>Device</span>
          </div>

          <span className="text-text-tertiary text-2xs">→</span>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
            stage === 'scope'
              ? 'bg-accent/10 text-accent border-accent/40 font-semibold'
              : stage === 'execution'
              ? 'bg-surface-02 text-green border-border-subtle'
              : 'bg-surface-02 text-text-tertiary border-border-subtle'
          }`}>
            {stage === 'execution' ? <Check size={11} className="text-green" /> : <span>2</span>}
            <span>Scope</span>
          </div>

          <span className="text-text-tertiary text-2xs">→</span>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
            stage === 'execution'
              ? 'bg-accent/10 text-accent border-accent/40 font-semibold'
              : 'bg-surface-02 text-text-tertiary border-border-subtle'
          }`}>
            <span>3</span>
            <span>Acquisition</span>
          </div>
        </div>
      </div>

      {/* ── Active Step Viewport ── */}
      {stage === 'device' && (
        <DeviceConnectionStep
          onConnected={handleDeviceConnected}
          initialConnection={connection}
          initialFingerprint={fingerprint}
        />
      )}

      {stage === 'scope' && connection && fingerprint && (
        <ChannelSelectionStep
          channels={availableChannels}
          investigation={selectedInv}
          device={connection}
          fingerprint={fingerprint}
          onBack={() => setStage('device')}
          onProceed={handleScopeConfirmed}
        />
      )}

      {stage === 'execution' && connection && fingerprint && (
        <AcquisitionExecutionStep
          investigation={selectedInv}
          device={connection}
          fingerprint={fingerprint}
          channelIds={selectedChannelIds}
          startTime={timeRange.start}
          endTime={timeRange.end}
          caseId={caseId}
          investigator={investigator}
          onEvidenceRegistered={onEvidenceAdded}
          onViewEvidence={onNavigateToEvidence}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
