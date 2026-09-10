import { useState, useEffect } from 'react';
import {
  Crosshair,
  Plus,
  Tag,
  FileText,
  Clock,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  Play,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import type { Investigation, CreateInvestigationPayload, InvestigationStatus } from '../../types/investigation';
import { MOCK_INVESTIGATIONS } from '../../data/mockInvestigation';
import { InvestigationListPanel } from './InvestigationListPanel';
import { InvestigationWorkspace } from './InvestigationWorkspace';
import { CreateInvestigationModal } from './CreateInvestigationModal';
import { Button, MonoLabel } from '../ui/primitives';
import { formatDate, formatDateTime } from '../../utils/format';

export interface InvestigationManagerProps {
  caseId: string;
  investigator: string;
  investigations?: Investigation[];
  onInvestigationsChange?: (investigations: Investigation[]) => void;
}

// Helper to generate next INV ID
function generateInvId(existing: Investigation[]): string {
  const nums = existing
    .map((inv) => parseInt(inv.id.replace('INV-', ''), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `INV-${String(next).padStart(3, '0')}`;
}

// Status label config
const STATUS_CFG: Record<InvestigationStatus, { label: string; dot: string; text: string }> = {
  open:        { label: 'Open',        dot: 'bg-accent',        text: 'text-accent' },
  in_progress: { label: 'In Progress', dot: 'bg-amber',         text: 'text-amber' },
  concluded:   { label: 'Concluded',   dot: 'bg-green',         text: 'text-green' },
  archived:    { label: 'Archived',    dot: 'bg-text-tertiary', text: 'text-text-tertiary' },
};

// ─── Conclude Confirmation Modal ─────────────────────────────────────────────

interface ConcludeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invTitle: string;
}

function ConcludeModal({ open, onClose, onConfirm, invTitle }: ConcludeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-01 border border-border-default rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green/10 text-green border border-green/30">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Conclude Investigation?
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 truncate max-w-xs">
              {invTitle}
            </p>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed bg-surface-02 p-3 rounded-lg border border-border-subtle">
          This will mark the investigation as concluded. Evidentiary timelines, notes, and tagged exhibits will be sealed into the forensic dossier.
        </p>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            id="confirm-conclude-btn"
          >
            Conclude
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State (No investigations in case) ──────────────────────────────────

function EmptyInvestigationState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="w-14 h-14 rounded-xl bg-surface-02 border border-border-subtle flex items-center justify-center mb-5">
        <Crosshair size={24} className="text-text-tertiary" />
      </div>
      <p className="text-2xs font-mono uppercase tracking-widest text-text-tertiary mb-2">
        No Investigation Created
      </p>
      <h3 className="text-base font-semibold text-text-primary mb-2 text-center">
        No investigations yet
      </h3>
      <p className="text-xs text-text-secondary text-center max-w-xs leading-relaxed mb-6">
        Create an investigation to begin organizing and analyzing surveillance evidence for this case.
      </p>
      <Button
        variant="primary"
        icon={<Plus size={14} />}
        onClick={onCreate}
        id="create-first-investigation-btn"
      >
        Create Investigation
      </Button>
    </div>
  );
}

// ─── Investigation Context Header with Status Transitions & Tag Editor ────────

interface ContextBarProps {
  inv: Investigation;
  onStatusChange: (status: InvestigationStatus) => void;
  onRequestConclude: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

function InvestigationContextBar({
  inv,
  onStatusChange,
  onRequestConclude,
  onAddTag,
  onRemoveTag,
}: ContextBarProps) {
  const s = STATUS_CFG[inv.status];
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (clean && !inv.tags.includes(clean)) {
      onAddTag(clean);
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 mb-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left: ID + Title + Objective */}
        <div className="space-y-1.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-3">
            <MonoLabel className="text-accent text-sm">{inv.id}</MonoLabel>
            <span className={`inline-flex items-center gap-1 text-2xs font-mono uppercase tracking-wide px-2 py-0.5 rounded-full border border-border-subtle ${s.text} bg-surface-02`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
              {s.label}
            </span>
          </div>

          <h3 className="text-base font-semibold text-text-primary leading-snug">
            {inv.title}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {inv.objective}
          </p>
        </div>

        {/* Right: Explicit Status Action Buttons */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {inv.status === 'open' && (
              <button
                type="button"
                onClick={() => onStatusChange('in_progress')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber/15 text-amber border border-amber/30 text-xs font-semibold hover:bg-amber/25 transition-all shadow-xs"
                id="start-investigation-btn"
              >
                <Play size={12} className="fill-current" />
                <span>Start Investigation</span>
              </button>
            )}

            {inv.status === 'in_progress' && (
              <button
                type="button"
                onClick={onRequestConclude}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green/15 text-green border border-green/30 text-xs font-semibold hover:bg-green/25 transition-all shadow-xs"
                id="conclude-investigation-btn"
              >
                <CheckCircle2 size={13} />
                <span>Conclude Investigation</span>
              </button>
            )}

            {inv.status === 'concluded' && (
              <button
                type="button"
                onClick={() => onStatusChange('archived')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-02 text-text-secondary border border-border-default text-xs font-medium hover:text-text-primary transition-all shadow-xs"
                id="archive-investigation-btn"
              >
                <Archive size={12} />
                <span>Archive</span>
              </button>
            )}

            {inv.status === 'archived' && (
              <button
                type="button"
                onClick={() => onStatusChange('open')}
                className="text-2xs font-mono text-text-tertiary hover:text-accent underline"
              >
                Reopen
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-3xs font-mono text-text-tertiary">
            <span className="flex items-center gap-1">
              <Crosshair size={10} /> {inv.detectionIds.length} pinned
            </span>
            <span className="flex items-center gap-1">
              <FileText size={10} /> {inv.leadAnalyst}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> {formatDate(inv.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Tags Row */}
      <div className="pt-3 border-t border-border-subtle/60 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-2xs font-mono uppercase text-text-tertiary flex items-center gap-1 mr-1">
          <Tag size={11} /> Tags:
        </span>

        {inv.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-mono bg-surface-02 border border-border-subtle text-text-secondary"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="text-text-tertiary hover:text-red transition-colors ml-0.5"
              title={`Remove tag ${tag}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}

        {isAddingTag ? (
          <form onSubmit={handleTagSubmit} className="inline-flex items-center gap-1.5">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="tag-name"
              className="px-2 py-0.5 rounded bg-surface-02 border border-border-default text-xs font-mono text-text-primary focus:outline-none focus:border-accent w-28"
              autoFocus
            />
            <button
              type="submit"
              className="p-1 rounded bg-accent text-white hover:bg-accent-hover"
              title="Add Tag"
            >
              <Check size={10} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingTag(false);
                setNewTagInput('');
              }}
              className="p-1 rounded text-text-tertiary hover:text-text-primary"
              title="Cancel"
            >
              <X size={10} />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingTag(true)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-mono border border-dashed border-border-default text-text-tertiary hover:border-accent hover:text-accent transition-all"
            id="add-tag-btn"
          >
            <Plus size={10} />
            <span>Tag</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Collapsible Analyst Notes Editor ────────────────────────────────────────

interface NotesEditorProps {
  notes: string | undefined;
  updatedAt: string;
  onSaveNotes: (notes: string) => void;
}

function AnalystNotesEditor({ notes, updatedAt, onSaveNotes }: NotesEditorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [draft, setDraft] = useState(notes ?? '');
  const [isSaved, setIsSaved] = useState(false);

  // Sync draft if external notes change
  useEffect(() => {
    setDraft(notes ?? '');
  }, [notes]);

  const handleSave = () => {
    onSaveNotes(draft);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl overflow-hidden shadow-sm mt-5">
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-surface-02/60 hover:bg-surface-02 transition-colors border-b border-border-subtle/60 text-left"
      >
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono text-text-primary">
            Analyst Working Notes
          </span>
          <span className="text-3xs font-mono text-text-tertiary">
            (Last edited: {formatDateTime(updatedAt)})
          </span>
        </div>
        <div className="text-text-tertiary">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Editor Body */}
      {isOpen && (
        <div className="p-5 space-y-3">
          <textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Record investigative hypotheses, timeline anomalies, ANPR correlations, or witness testimonies..."
            rows={4}
            className="w-full p-3 rounded-lg bg-surface-02 border border-border-default text-xs text-text-primary placeholder:text-text-tertiary leading-relaxed focus:outline-none focus:border-accent font-sans"
            id="analyst-notes-textarea"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-3xs font-mono text-text-tertiary">
              Notes update case working log &amp; auto-index to Section 65B dossier
            </span>

            <div className="flex items-center gap-2">
              {isSaved && (
                <span className="text-2xs font-mono text-green flex items-center gap-1">
                  <Check size={11} /> Saved
                </span>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                icon={<Save size={12} />}
                id="save-notes-btn"
              >
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main InvestigationManager ────────────────────────────────────────────────

export function InvestigationManager({
  caseId,
  investigator,
  investigations: externalInvestigations,
  onInvestigationsChange,
}: InvestigationManagerProps) {
  // Local state initialized with external or mock
  const [investigations, setInvestigations] = useState<Investigation[]>(() =>
    externalInvestigations && externalInvestigations.length > 0
      ? externalInvestigations
      : MOCK_INVESTIGATIONS.filter((inv) => inv.caseId === caseId)
  );

  // Keep in sync with external investigations
  useEffect(() => {
    if (externalInvestigations) {
      setInvestigations(externalInvestigations);
    }
  }, [externalInvestigations]);

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const list = externalInvestigations ?? MOCK_INVESTIGATIONS.filter((i) => i.caseId === caseId);
    return list.length > 0 ? list[0].id : null;
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConcludeModal, setShowConcludeModal] = useState(false);

  // Active investigation
  const selectedInv = investigations.find((inv) => inv.id === selectedId) ?? investigations[0] ?? null;

  // Helper to commit state changes
  const updateInvestigationList = (nextList: Investigation[]) => {
    setInvestigations(nextList);
    onInvestigationsChange?.(nextList);
  };

  // Create investigation
  const handleCreate = (payload: CreateInvestigationPayload) => {
    const newInv: Investigation = {
      id: generateInvId([...investigations, ...MOCK_INVESTIGATIONS]),
      caseId: payload.caseId,
      title: payload.title,
      objective: payload.objective,
      status: 'open',
      leadAnalyst: payload.leadAnalyst,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      detectionIds: [],
      tags: [],
      notes: undefined,
    };
    const nextList = [...investigations, newInv];
    updateInvestigationList(nextList);
    setSelectedId(newInv.id);
  };

  // Toggle Pin on detection
  const handleTogglePin = (detectionId: string) => {
    if (!selectedInv) return;
    const exists = selectedInv.detectionIds.includes(detectionId);
    const newDetectionIds = exists
      ? selectedInv.detectionIds.filter((id) => id !== detectionId)
      : [...selectedInv.detectionIds, detectionId];

    const updatedInv: Investigation = {
      ...selectedInv,
      detectionIds: newDetectionIds,
      updatedAt: new Date().toISOString(),
    };

    const nextList = investigations.map((inv) =>
      inv.id === updatedInv.id ? updatedInv : inv
    );
    updateInvestigationList(nextList);
  };

  // Save Notes
  const handleSaveNotes = (notes: string) => {
    if (!selectedInv) return;
    const updatedInv: Investigation = {
      ...selectedInv,
      notes,
      updatedAt: new Date().toISOString(),
    };
    const nextList = investigations.map((inv) =>
      inv.id === updatedInv.id ? updatedInv : inv
    );
    updateInvestigationList(nextList);
  };

  // Status changes
  const handleStatusChange = (newStatus: InvestigationStatus) => {
    if (!selectedInv) return;
    const updatedInv: Investigation = {
      ...selectedInv,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    const nextList = investigations.map((inv) =>
      inv.id === updatedInv.id ? updatedInv : inv
    );
    updateInvestigationList(nextList);
  };

  // Add tag
  const handleAddTag = (tag: string) => {
    if (!selectedInv) return;
    const updatedInv: Investigation = {
      ...selectedInv,
      tags: [...selectedInv.tags, tag],
      updatedAt: new Date().toISOString(),
    };
    const nextList = investigations.map((inv) =>
      inv.id === updatedInv.id ? updatedInv : inv
    );
    updateInvestigationList(nextList);
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedInv) return;
    const updatedInv: Investigation = {
      ...selectedInv,
      tags: selectedInv.tags.filter((t) => t !== tagToRemove),
      updatedAt: new Date().toISOString(),
    };
    const nextList = investigations.map((inv) =>
      inv.id === updatedInv.id ? updatedInv : inv
    );
    updateInvestigationList(nextList);
  };

  // ── Case has 0 investigations: full-width empty state ────────────────────────
  if (investigations.length === 0) {
    return (
      <>
        <EmptyInvestigationState onCreate={() => setShowCreateModal(true)} />
        <CreateInvestigationModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          caseId={caseId}
          defaultAnalyst={investigator}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex gap-0 border border-border-subtle rounded-xl overflow-hidden shadow-sm" style={{ minHeight: '650px' }}>
        {/* Left: Investigation list panel */}
        <div className="w-64 shrink-0 border-r border-border-subtle bg-surface-01">
          <InvestigationListPanel
            investigations={investigations}
            selectedId={selectedInv?.id ?? null}
            onSelect={(inv) => setSelectedId(inv.id)}
            onCreateClick={() => setShowCreateModal(true)}
          />
        </div>

        {/* Right: Workspace area */}
        <div className="flex-1 min-w-0 bg-surface-base p-6 overflow-y-auto">
          {selectedInv ? (
            <div className="space-y-6">
              {/* Context header with status transitions and tags */}
              <InvestigationContextBar
                inv={selectedInv}
                onStatusChange={handleStatusChange}
                onRequestConclude={() => setShowConcludeModal(true)}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />

              {/* Detections Workspace */}
              <InvestigationWorkspace
                initialCaseId={caseId}
                isCaseScoped={true}
                investigationId={selectedInv.id}
                pinnedDetectionIds={selectedInv.detectionIds}
                onTogglePinDetection={handleTogglePin}
              />

              {/* Notes Editor */}
              <AnalystNotesEditor
                notes={selectedInv.notes}
                updatedAt={selectedInv.updatedAt}
                onSaveNotes={handleSaveNotes}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full py-20">
              <p className="text-xs text-text-tertiary">Select an investigation to begin.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateInvestigationModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        caseId={caseId}
        defaultAnalyst={investigator}
      />

      {selectedInv && (
        <ConcludeModal
          open={showConcludeModal}
          onClose={() => setShowConcludeModal(false)}
          onConfirm={() => handleStatusChange('concluded')}
          invTitle={selectedInv.title}
        />
      )}
    </>
  );
}
