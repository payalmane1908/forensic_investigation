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
} from 'lucide-react';
import { Badge, Button, MonoLabel } from '../components/ui/primitives';
import { EvidenceIngestion } from '../components/evidence/EvidenceIngestion';
import { ParserTab } from '../components/parser/ParserTab';
import { MOCK_CASES } from '../data/mockCases';
import { MOCK_EVIDENCE } from '../data/mockEvidence';
import type { Case } from '../types/case';
import type { EvidenceItem } from '../types/evidence';
import { formatDate, formatRelativeTime, formatDateTime } from '../utils/format';

// ─── Tab definition ───────────────────────────────────────────────────────────

type TabId = 'overview' | 'evidence' | 'parser' | 'investigate' | 'reports';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam === 'parser' || tabParam === 'overview' || tabParam === 'evidence'
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
        id: 'evidence',
        label: 'Evidence',
        icon: <FolderOpen size={14} />,
        badge: evidence.length,
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
        comingSoon: true,
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: <GitBranch size={14} />,
        comingSoon: true,
      },
    ],
    [evidence.length]
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
        {activeTab === 'evidence' && (
          <EvidenceIngestion
            caseId={caseData.id}
            existingEvidence={evidence}
            onEvidenceAdded={handleEvidenceAdded}
          />
        )}
        {activeTab === 'parser' && <ParserTab caseId={caseData.id} />}
        {activeTab === 'investigate' && <ComingSoonTab label="Investigate" />}
        {activeTab === 'reports' && <ComingSoonTab label="Reports" />}
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
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1 min-w-0">
        {/* ID + Status */}
        <div className="flex items-center gap-3 mb-2">
          <MonoLabel className="text-lg text-text-primary">{caseData.id}</MonoLabel>
          <Badge variant={caseData.status} />
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

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xs text-text-tertiary uppercase tracking-wider">{label}</p>
      <p className="text-xs text-text-secondary mt-0.5">{value}</p>
    </div>
  );
}

// ─── Coming Soon Tab ──────────────────────────────────────────────────────────

function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-xl bg-surface-01 border border-border-subtle flex items-center justify-center">
        <Shield size={22} className="text-text-tertiary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-text-secondary mb-1">
          {label} module coming soon
        </p>
        <p className="text-xs text-text-tertiary max-w-xs">
          This capability will be available in a future build of FORENSIC-X.
        </p>
      </div>
    </div>
  );
}
