import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  MapPin,
  Sliders,
  ChevronRight,
  Binary,
  Layers,
} from 'lucide-react';
import { MOCK_CASES } from '../data/mockCases';
import { MOCK_EVIDENCE } from '../data/mockEvidence';
import type { CustodyEvent } from '../types/evidence';
import { FormatBadge } from '../components/forensics/FormatBadge';
import { ForensicProfilePanel } from '../components/forensics/ForensicProfilePanel';
import { IntegrityPanel } from '../components/forensics/IntegrityPanel';
import { ChainOfCustodyTimeline } from '../components/forensics/ChainOfCustodyTimeline';
import { MetadataTable } from '../components/forensics/MetadataTable';
import { ForensicReportModal } from '../components/forensics/ForensicReportModal';
import { Badge, MonoLabel, Button } from '../components/ui/primitives';
import {
  formatFileSize,
  formatDuration,
  formatDateTime,
  truncateHash,
} from '../utils/format';

type DetailTab = 'profile' | 'integrity' | 'metadata';

export function EvidenceDetailPage() {
  const { caseId, evId } = useParams<{ caseId: string; evId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<DetailTab>('profile');
  const [showCertificate, setShowCertificate] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Lookup case and evidence
  const caseData = useMemo(() => {
    return MOCK_CASES.find((c) => c.id === caseId) ?? MOCK_CASES[0];
  }, [caseId]);

  // Evidence list for this case
  const caseEvidence = useMemo(() => {
    return MOCK_EVIDENCE.filter((e) => e.caseId === caseId || e.caseId === caseData.id);
  }, [caseId, caseData.id]);

  const [evidenceList, setEvidenceList] = useState(MOCK_EVIDENCE);

  const evidenceItem = useMemo(() => {
    return (
      evidenceList.find((e) => e.id === evId) ??
      evidenceList.find((e) => e.id === 'EV-001') ??
      evidenceList[0]
    );
  }, [evidenceList, evId]);

  const profile = evidenceItem?.forensicProfile;

  const handleCopyHash = async () => {
    if (!evidenceItem.sha256) return;
    await navigator.clipboard.writeText(evidenceItem.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleAddCustodyEvent = (newEvent: CustodyEvent) => {
    setEvidenceList((prev) =>
      prev.map((e) =>
        e.id === evidenceItem.id
          ? {
              ...e,
              chainOfCustody: [...(e.chainOfCustody ?? []), newEvent],
            }
          : e
      )
    );
  };

  const handleSendToParser = () => {
    navigate(`/case/${caseData.id}?tab=parser`);
  };

  if (!evidenceItem) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-20 text-center">
        <p className="text-sm text-text-secondary mb-4">
          Evidence item <span className="font-mono text-text-primary">{evId}</span> not found.
        </p>
        <Button variant="ghost" onClick={() => navigate(`/case/${caseId ?? 'CASE-024'}`)}>
          <ArrowLeft size={14} className="mr-1.5" /> Back to Case
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 pb-24">
      {/* ── Breadcrumb Navigation ── */}
      <div className="flex items-center gap-2 pt-6 pb-4 flex-wrap text-xs text-text-secondary">
        <button
          onClick={() => navigate('/')}
          className="hover:text-text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={13} />
          Cases
        </button>
        <span className="text-text-tertiary">/</span>
        <button
          onClick={() => navigate(`/case/${caseData.id}`)}
          className="hover:text-text-primary transition-colors font-mono"
        >
          {caseData.id}
        </button>
        <span className="text-text-tertiary">/</span>
        <button
          onClick={() => navigate(`/case/${caseData.id}`)}
          className="hover:text-text-primary transition-colors"
        >
          Evidence
        </button>
        <span className="text-text-tertiary">/</span>
        <MonoLabel className="text-accent">{evidenceItem.id}</MonoLabel>
      </div>

      {/* ── Main Hero Action Header ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <MonoLabel className="text-base text-accent font-bold">
                {evidenceItem.id}
              </MonoLabel>
              {profile && (
                <FormatBadge
                  vendor={profile.vendor}
                  container={profile.containerFormat}
                  confidence={profile.vendorConfidence}
                  size="md"
                />
              )}
              <Badge
                variant={evidenceItem.status === 'ingested' || evidenceItem.status === 'verified' ? 'active' : 'processing'}
                label={evidenceItem.status.toUpperCase()}
              />
              <span className="text-2xs font-mono text-text-tertiary bg-surface-02 px-2 py-0.5 rounded border border-border-subtle">
                {formatFileSize(evidenceItem.fileSize)}
              </span>
            </div>

            <h1 className="text-xl font-bold text-text-primary font-mono tracking-tight break-all">
              {evidenceItem.filename}
            </h1>

            <p className="text-xs text-text-secondary flex items-center gap-2 font-mono">
              <MapPin size={13} className="text-text-tertiary shrink-0" />
              <span>{evidenceItem.location}</span>
              <span className="text-text-tertiary">·</span>
              <span>{evidenceItem.deviceModel}</span>
              <span className="text-text-tertiary">({evidenceItem.cameraChannel})</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyHash}
              className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-surface-02 hover:bg-surface-03 border border-border-subtle text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
              title="Copy SHA-256 Hash"
            >
              {copiedHash ? (
                <>
                  <Check size={13} className="text-green" />
                  <span className="text-green">Hash Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>{truncateHash(evidenceItem.sha256 ?? '', 8)}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-surface-02 hover:bg-surface-03 border border-border-subtle text-xs font-medium text-text-primary transition-colors"
            >
              <FileText size={14} className="text-accent" />
              <span>Forensic Certificate</span>
            </button>

            <Button
              variant="primary"
              size="md"
              icon={<Sliders size={14} />}
              onClick={handleSendToParser}
            >
              Send to M4 Parser
            </Button>
          </div>
        </div>

        {/* Quick Metadata Matrix Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5 mt-5 border-t border-border-subtle">
          <div>
            <p className="text-2xs font-mono text-text-tertiary uppercase">File Format</p>
            <p className="text-xs font-mono text-text-primary mt-0.5 font-semibold">
              {evidenceItem.format}
            </p>
          </div>
          <div>
            <p className="text-2xs font-mono text-text-tertiary uppercase">Video Duration</p>
            <p className="text-xs font-mono text-text-primary mt-0.5 font-semibold">
              {evidenceItem.duration ? formatDuration(evidenceItem.duration) : '—'}
            </p>
          </div>
          <div>
            <p className="text-2xs font-mono text-text-tertiary uppercase">Channel ID</p>
            <p className="text-xs font-mono text-text-primary mt-0.5 font-semibold">
              {evidenceItem.cameraChannel}
            </p>
          </div>
          <div>
            <p className="text-2xs font-mono text-text-tertiary uppercase">Seizing Officer</p>
            <p className="text-xs text-text-primary mt-0.5 truncate">
              {evidenceItem.collectionOfficer}
            </p>
          </div>
          <div>
            <p className="text-2xs font-mono text-text-tertiary uppercase">Collection Date</p>
            <p className="text-xs font-mono text-text-primary mt-0.5">
              {formatDateTime(evidenceItem.collectionTime)}
            </p>
          </div>
          <div>
            <p className="text-2xs font-mono text-text-tertiary uppercase">Integrity Seal</p>
            <p className="text-xs font-mono text-green mt-0.5 font-semibold flex items-center gap-1">
              <ShieldCheck size={13} />
              Verified Intact
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab Switcher Bar ── */}
      <div className="flex items-center gap-2 border-b border-border-subtle mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`relative flex items-center gap-2 h-11 px-4 text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Layers size={14} className={activeTab === 'profile' ? 'text-accent' : 'text-text-tertiary'} />
          <span>Vendor & Stream Profile</span>
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('integrity')}
          className={`relative flex items-center gap-2 h-11 px-4 text-sm font-medium transition-colors ${
            activeTab === 'integrity'
              ? 'text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <ShieldCheck size={14} className={activeTab === 'integrity' ? 'text-accent' : 'text-text-tertiary'} />
          <span>Integrity & Chain of Custody</span>
          <span className="px-1.5 py-0.2 rounded-full text-2xs font-mono bg-surface-02 border border-border-subtle text-text-tertiary">
            {evidenceItem.chainOfCustody?.length ?? 0}
          </span>
          {activeTab === 'integrity' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('metadata')}
          className={`relative flex items-center gap-2 h-11 px-4 text-sm font-medium transition-colors ${
            activeTab === 'metadata'
              ? 'text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Binary size={14} className={activeTab === 'metadata' ? 'text-accent' : 'text-text-tertiary'} />
          <span>Proprietary Headers & Hex Dump</span>
          {activeTab === 'metadata' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
          )}
        </button>
      </div>

      {/* ── Active Tab Content ── */}
      <div className="animate-fade-in mb-10">
        {activeTab === 'profile' && profile && (
          <ForensicProfilePanel profile={profile} filename={evidenceItem.filename} />
        )}

        {activeTab === 'integrity' && profile && (
          <div className="space-y-6">
            <IntegrityPanel
              profile={profile}
              sha256={evidenceItem.sha256}
              md5={evidenceItem.md5}
              sha1={evidenceItem.sha1}
              filename={evidenceItem.filename}
            />
            <ChainOfCustodyTimeline
              events={evidenceItem.chainOfCustody}
              evidenceId={evidenceItem.id}
              sha256={evidenceItem.sha256}
              onAddEvent={handleAddCustodyEvent}
            />
          </div>
        )}

        {activeTab === 'metadata' && profile && (
          <MetadataTable profile={profile} filename={evidenceItem.filename} />
        )}
      </div>

      {/* ── Case Evidence Switcher Strip ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xs font-mono uppercase tracking-wider text-text-tertiary">
            Other Evidence in Case {caseData.id} ({caseEvidence.length})
          </span>
          <Link
            to={`/case/${caseData.id}`}
            className="text-xs text-accent hover:underline font-mono flex items-center gap-1"
          >
            <span>Back to Case Detail</span>
            <ChevronRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {caseEvidence.map((item) => {
            const isCurrent = item.id === evidenceItem.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/case/${caseData.id}/evidence/${item.id}`)}
                className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                  isCurrent
                    ? 'bg-surface-02 border-accent/60 shadow-sm'
                    : 'bg-surface-02/50 border-border-subtle hover:bg-surface-02 hover:border-border-default'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className={`font-mono text-xs font-semibold ${isCurrent ? 'text-accent' : 'text-text-primary'}`}>
                    {item.id}
                  </span>
                  <span className="text-2xs font-mono text-text-tertiary">
                    {item.cameraChannel}
                  </span>
                </div>
                <p className="text-xs font-mono text-text-secondary truncate">
                  {item.filename}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-border-subtle/40 text-2xs text-text-tertiary">
                  <span>{item.deviceType}</span>
                  <span>{formatFileSize(item.fileSize)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Forensic Report Modal ── */}
      {showCertificate && (
        <ForensicReportModal
          evidence={evidenceItem}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}
