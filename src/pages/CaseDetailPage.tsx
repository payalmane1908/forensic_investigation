import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  FolderOpen,
  Camera,
  Clock,
  User,
  Calendar,
  MoreHorizontal,
  FileText,
  Search,
  GitBranch,
  Shield,
  ChevronRight,
  Sliders,
  Award,
  ExternalLink,
  AlertTriangle,
  Radio,
  HardDrive,
} from 'lucide-react';
import { Badge, Button, MonoLabel } from '../components/ui/primitives';
import { EvidenceIngestion } from '../components/evidence/EvidenceIngestion';
import { ParserTab } from '../components/parser/ParserTab';
import { InvestigationManager } from '../components/investigation/InvestigationManager';
import { AcquisitionWizard } from '../components/acquisition/AcquisitionWizard';
import { RecoveryTab } from '../components/recovery/RecoveryTab';
import { MOCK_CASES } from '../data/mockCases';
import { MOCK_EVIDENCE } from '../data/mockEvidence';
import { MOCK_INVESTIGATIONS } from '../data/mockInvestigation';
import type { Case } from '../types/case';
import type { EvidenceItem } from '../types/evidence';
import type { Investigation } from '../types/investigation';
import { formatDate, formatRelativeTime, formatDateTime } from '../utils/format';

// ─── Tab definition ───────────────────────────────────────────────────────────

type TabId = 'overview' | 'acquisition' | 'evidence' | 'recovery' | 'parser' | 'investigate' | 'reports';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  disabled?: boolean;
  comingSoon?: boolean;
}

// ─── CaseDetailPage ───────────────────────────────────────────────────────────

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  // State: pull from mock (in real app, this would be from context/store)
  const [caseData] = useState<Case | undefined>(
    MOCK_CASES.find((c) => c.id === caseId)
  );
  const [evidence, setEvidence] = useState<EvidenceItem[]>(
    MOCK_EVIDENCE.filter((e) => e.caseId === caseId)
  );
  const [investigations, setInvestigations] = useState<Investigation[]>(() =>
    MOCK_INVESTIGATIONS.filter((inv) => inv.caseId === caseId)
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && ['overview', 'acquisition', 'evidence', 'recovery', 'parser', 'investigate', 'reports'].includes(tabParam)
      ? tabParam
      : 'evidence'
  );

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const tabs: Tab[] = useMemo(
    () => [
      {
        id: 'overview',
        label: 'Overview',
        icon: <FileText size={14} />,
      },
      {
        id: 'acquisition',
        label: 'Acquisition',
        icon: <Radio size={14} />,
      },
      {
        id: 'evidence',
        label: 'Evidence',
        icon: <FolderOpen size={14} />,
        badge: evidence.length,
      },
      {
        id: 'recovery',
        label: 'Recovery',
        icon: <HardDrive size={14} />,
        badge: 3,
      },
      {
        id: 'parser',
        label: 'Parser & Normalization',
        icon: <Sliders size={14} />,
        badge: 5,
      },
      {
        id: 'investigate',
        label: 'Investigate',
        icon: <Search size={14} />,
        badge: investigations.length > 0 ? investigations.length : undefined,
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <GitBranch size={14} />,
      },
    ],
    [evidence.length, investigations.length]
  );

  const handleEvidenceAdded = (items: EvidenceItem[]) => {
    setEvidence((prev) => [...prev, ...items]);
  };

  // 404 state
  if (!caseData) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-20 text-center">
        <p className="text-sm text-text-secondary mb-4">
          Case <span className="font-mono text-text-primary">{caseId}</span> not found.
        </p>
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={14} className="mr-1.5" /> Back to Cases
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 pb-20">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 pt-6 pb-5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={13} />
          Cases
        </button>
        <span className="text-text-tertiary text-xs">/</span>
        <MonoLabel className="text-text-primary">{caseData.id}</MonoLabel>
      </div>

      {/* ── Case header ── */}
      <CaseHeader caseData={caseData} evidenceCount={evidence.length} />

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 border-b border-border-subtle mt-8 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onClick={() => !tab.comingSoon && handleTabChange(tab.id)}
          />
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && <OverviewTab caseData={caseData} evidence={evidence} />}
        {activeTab === 'acquisition' && (
          <AcquisitionWizard
            caseId={caseData.id}
            investigator={caseData.investigator}
            investigations={investigations}
            onEvidenceAdded={handleEvidenceAdded}
            onNavigateToInvestigate={() => handleTabChange('investigate')}
            onNavigateToEvidence={() => handleTabChange('evidence')}
          />
        )}
        {activeTab === 'evidence' && (
          <EvidenceIngestion
            caseId={caseData.id}
            existingEvidence={evidence}
            onEvidenceAdded={handleEvidenceAdded}
          />
        )}
        {activeTab === 'recovery' && (
          <RecoveryTab
            caseId={caseData.id}
            investigator={caseData.investigator}
            onEvidenceAdded={(item) => handleEvidenceAdded([item])}
            onNavigateToEvidence={() => handleTabChange('evidence')}
          />
        )}
        {activeTab === 'parser' && <ParserTab caseId={caseData.id} />}
        {activeTab === 'investigate' && (
          <InvestigationManager
            caseId={caseData.id}
            investigator={caseData.investigator}
            investigations={investigations}
            onInvestigationsChange={setInvestigations}
          />
        )}
        {activeTab === 'reports' && (
          <CaseReportsTab caseData={caseData} evidence={evidence} />
        )}
      </div>
    </div>
  );
}

// ─── Case Header ─────────────────────────────────────────────────────────────

function CaseHeader({
  caseData,
  evidenceCount,
}: {
  caseData: Case;
  evidenceCount: number;
}) {
  const priorityConfig = {
    high:   { label: 'High Priority',   dot: 'bg-red',            text: 'text-red' },
    medium: { label: 'Med Priority',    dot: 'bg-amber',           text: 'text-amber' },
    low:    { label: 'Low Priority',    dot: 'bg-text-tertiary',   text: 'text-text-tertiary' },
  };
  const pCfg = priorityConfig[caseData.priority ?? 'medium'];

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1 min-w-0">
        {/* ID + Status + Priority */}
        <div className="flex items-center gap-3 mb-2">
          <MonoLabel className="text-lg text-text-primary">{caseData.id}</MonoLabel>
          <Badge variant={caseData.status} />
          <span className={`inline-flex items-center gap-1 text-2xs font-mono uppercase tracking-wide ${pCfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${pCfg.dot}`} />
            {pCfg.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-text-primary mb-3 leading-snug">
          {caseData.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <User size={12} className="text-text-tertiary" />
            {caseData.investigator}
          </span>
          <span className="flex items-center gap-1.5">
            <Camera size={12} className="text-text-tertiary" />
            {caseData.cameraCount} cameras
          </span>
          <span className="flex items-center gap-1.5">
            <FolderOpen size={12} className="text-text-tertiary" />
            {evidenceCount} evidence items
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-text-tertiary" />
            Created {formatDate(caseData.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-text-tertiary" />
            Updated {formatRelativeTime(caseData.updatedAt)}
          </span>
          {caseData.incidentAt && (
            <span className="flex items-center gap-1.5 text-amber">
              <AlertTriangle size={12} className="shrink-0" />
              Incident: {formatDateTime(caseData.incidentAt)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="secondary" size="sm" icon={<Shield size={13} />}>
          Integrity Report
        </Button>
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border-subtle text-text-tertiary hover:text-text-primary hover:bg-surface-02 transition-colors">
          <MoreHorizontal size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabButton({
  tab,
  active,
  onClick,
}: {
  tab: Tab;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 h-11 px-4 text-sm font-medium
        transition-colors duration-150 rounded-t-md
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50
        ${
          active
            ? 'text-text-primary'
            : tab.comingSoon
            ? 'text-text-tertiary cursor-not-allowed'
            : 'text-text-secondary hover:text-text-primary'
        }
      `}
      disabled={tab.comingSoon}
      title={tab.comingSoon ? 'Coming in a future module' : undefined}
    >
      <span className={active ? 'text-accent' : 'text-text-tertiary'}>{tab.icon}</span>
      {tab.label}
      {tab.badge !== undefined && tab.badge > 0 && (
        <span className="ml-1 px-1.5 py-0.5 text-2xs font-mono bg-surface-02 border border-border-subtle text-text-tertiary rounded-full">
          {tab.badge}
        </span>
      )}
      {tab.comingSoon && (
        <span className="text-2xs text-text-tertiary font-normal ml-1">(soon)</span>
      )}

      {/* Active underline */}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
      )}
    </button>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  caseData,
  evidence,
}: {
  caseData: Case;
  evidence: EvidenceItem[];
}) {
  const navigate = useNavigate();
  const verifiedCount = evidence.filter(
    (e) => e.status === 'ingested' || e.status === 'verified'
  ).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Case details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
        <div className="bg-surface-01 border border-border-subtle rounded-lg p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
            Description
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {caseData.description || (
              <span className="text-text-tertiary italic">No description provided.</span>
            )}
          </p>
        </div>

        {/* Evidence summary */}
        <div className="bg-surface-01 border border-border-subtle rounded-lg p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-4">
            Evidence Summary
          </h3>
          {evidence.length === 0 ? (
            <p className="text-sm text-text-tertiary">No evidence ingested yet.</p>
          ) : (
            <div className="space-y-1">
              {evidence.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => navigate(`/case/${caseData.id}/evidence/${ev.id}`)}
                  className="flex items-center gap-3 py-2 px-2.5 rounded-md border-b border-border-subtle/50 last:border-0 hover:bg-surface-02 cursor-pointer transition-colors group"
                >
                  <MonoLabel className="text-accent shrink-0 group-hover:underline">{ev.id}</MonoLabel>
                  <span className="text-xs font-mono text-text-primary truncate flex-1">
                    {ev.filename}
                  </span>
                  <span className="text-2xs text-text-tertiary shrink-0 capitalize">
                    {ev.deviceType.replace('_', ' ')}
                  </span>
                  <ChevronRight size={12} className="text-text-tertiary group-hover:text-accent transition-colors" />
                </div>
              ))}
              {evidence.length > 4 && (
                <p className="text-xs text-text-tertiary pt-2 px-2">
                  +{evidence.length - 4} more items — switch to Evidence tab to view all.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Stats */}
      <div className="space-y-4">
        <StatCard label="Total Evidence" value={evidence.length} />
        <StatCard label="Hash Verified" value={verifiedCount} highlight="green" />
        <StatCard label="Cameras" value={caseData.cameraCount} />
        <div className="bg-surface-01 border border-border-subtle rounded-lg p-5">
          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
            Case Timeline
          </h3>
          <div className="space-y-3">
            {caseData.incidentAt && (
              <TimelineItem
                label="Incident Time"
                value={formatDateTime(caseData.incidentAt)}
                highlight
              />
            )}
            <TimelineItem
              label="Case Created"
              value={formatDateTime(caseData.createdAt)}
            />
            <TimelineItem
              label="Last Updated"
              value={formatDateTime(caseData.updatedAt)}
            />
            <TimelineItem label="Lead Investigator" value={caseData.investigator} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: 'green';
}) {
  return (
    <div className="bg-surface-01 border border-border-subtle rounded-lg px-5 py-4 flex items-center justify-between">
      <p className="text-xs text-text-secondary">{label}</p>
      <p
        className={`text-xl font-semibold font-mono ${
          highlight === 'green' ? 'text-green' : 'text-text-primary'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TimelineItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-2xs text-text-tertiary uppercase tracking-wider">{label}</p>
      <p className={`text-xs mt-0.5 ${highlight ? 'text-amber' : 'text-text-secondary'}`}>{value}</p>
    </div>
  );
}

// ─── Case Reports Tab ──────────────────────────────────────────────────────────

function CaseReportsTab({
  caseData,
  evidence,
}: {
  caseData: Case;
  evidence: EvidenceItem[];
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Award size={18} className="text-accent" />
            <span className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
              Court Evidence Admissibility
            </span>
          </div>
          <h3 className="text-lg font-bold text-text-primary">
            Section 65B Certificate & Evidence Dossier
          </h3>
          <p className="text-xs text-text-secondary mt-1 max-w-xl">
            Generate legally binding certificates compliant with Section 65B of Indian Evidence Act / Section 63 BSA, certifying hash integrity and tamper-proof chain of custody for {caseData.id}.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            icon={<ExternalLink size={14} />}
            onClick={() => navigate('/reports')}
          >
            Open Legal Reports Center
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-01 border border-border-subtle">
          <span className="text-3xs font-mono uppercase text-text-tertiary block">VERIFIED EXHIBITS</span>
          <p className="text-2xl font-bold font-mono text-green mt-1">
            {evidence.filter((e) => e.status === 'verified' || e.status === 'ingested').length} / {evidence.length}
          </p>
          <p className="text-2xs text-text-secondary mt-1">Cryptographic hashes matched</p>
        </div>

        <div className="p-4 rounded-xl bg-surface-01 border border-border-subtle">
          <span className="text-3xs font-mono uppercase text-text-tertiary block">INVESTIGATING OFFICER</span>
          <p className="text-sm font-bold text-text-primary mt-1">{caseData.investigator}</p>
          <p className="text-2xs text-text-secondary mt-1">Certifying signatory officer</p>
        </div>

        <div className="p-4 rounded-xl bg-surface-01 border border-border-subtle">
          <span className="text-3xs font-mono uppercase text-text-tertiary block">LEGAL COMPLIANCE</span>
          <p className="text-sm font-bold text-accent mt-1">ISO/IEC 27037:2012</p>
          <p className="text-2xs text-text-secondary mt-1">Digital evidence handling certified</p>
        </div>
      </div>
    </div>
  );
}

