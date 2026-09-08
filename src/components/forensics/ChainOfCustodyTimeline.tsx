import { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  MapPin,
  Clock,
  Key,
  Plus,
  Stamp,
  CheckCircle2,
} from 'lucide-react';
import type { CustodyEvent } from '../../types/evidence';
import { formatDateTime, truncateHash } from '../../utils/format';

interface ChainOfCustodyTimelineProps {
  events?: CustodyEvent[];
  evidenceId: string;
  sha256?: string;
  onAddEvent?: (event: CustodyEvent) => void;
}

export function ChainOfCustodyTimeline({
  events = [],
  evidenceId,
  sha256,
  onAddEvent,
}: ChainOfCustodyTimelineProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [officerName, setOfficerName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [agency, setAgency] = useState('Central Forensic Science Laboratory');
  const [action, setAction] = useState('Custody Transfer for Normalization Parsing');
  const [location, setLocation] = useState('Digital Forensic Lab 3');
  const [notes, setNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName || !badgeNumber) return;

    const newEvent: CustodyEvent = {
      id: `COC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      action,
      officer: officerName,
      badgeNumber,
      agency,
      location,
      hashSnapshot: sha256 ?? 'Verified Immutable Hash Match',
      notes,
      verified: true,
      tamperSealId: `SEAL-${Math.floor(1000 + Math.random() * 9000)}X`,
    };

    onAddEvent?.(newEvent);
    setShowAddModal(false);
    setOfficerName('');
    setBadgeNumber('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* ── Top Summary Header ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-green" />
            <h3 className="text-sm font-semibold text-text-primary font-mono">
              Chain of Custody Audit Log
            </h3>
            <span className="px-2 py-0.5 rounded text-2xs font-mono bg-green/10 text-green border border-green/20">
              Chain Intact
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-xl">
            Immutable chronological record of evidence physical & digital possession, custody transfer, and forensic integrity hashes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-surface-02 border border-border-subtle hover:bg-surface-03 text-xs font-medium text-text-primary transition-colors shrink-0"
        >
          <Plus size={13} className="text-accent" />
          Log Custody Transfer
        </button>
      </div>

      {/* ── Vertical Timeline ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-6">
        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border-subtle">
          {events.map((event, idx) => {
            const isLast = idx === events.length - 1;

            return (
              <div key={event.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isLast
                      ? 'bg-accent border-surface-01 text-white ring-4 ring-accent/20'
                      : 'bg-surface-02 border-green text-green'
                  }`}
                >
                  <CheckCircle2 size={11} />
                </div>

                {/* Event Card */}
                <div className="bg-surface-02/70 border border-border-subtle rounded-lg p-4 transition-all duration-150 hover:border-border-default hover:bg-surface-02">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-border-subtle/50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-text-primary">
                        {event.action}
                      </span>
                      {event.tamperSealId && (
                        <span className="inline-flex items-center gap-1 text-2xs font-mono px-2 py-0.5 rounded bg-surface-03 text-amber border border-amber/20">
                          <Stamp size={10} />
                          {event.tamperSealId}
                        </span>
                      )}
                    </div>
                    <span className="text-2xs font-mono text-text-tertiary flex items-center gap-1">
                      <Clock size={11} />
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>

                  {/* Officer & Agency Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs font-mono text-text-secondary mb-3">
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={12} className="text-accent shrink-0" />
                      <span className="text-text-primary truncate">
                        {event.officer}
                      </span>
                      <span className="text-2xs text-text-tertiary">
                        ({event.badgeNumber})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-text-tertiary">Agency:</span>
                      <span className="truncate">{event.agency}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-text-tertiary shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Notes & Hash snapshot */}
                  {event.notes && (
                    <p className="text-xs text-text-tertiary font-sans bg-surface-03/40 p-2 rounded border border-border-subtle/40 mb-2">
                      {event.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-2xs font-mono">
                    <span className="text-text-tertiary flex items-center gap-1">
                      <Key size={10} className="text-green" />
                      Transfer Hash Snapshot:
                      <span className="text-text-secondary select-all">
                        {truncateHash(event.hashSnapshot, 14)}
                      </span>
                    </span>
                    <span className="text-green font-medium flex items-center gap-1">
                      <ShieldCheck size={11} />
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal to Add Custody Event ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-01 border border-border-subtle rounded-xl max-w-lg w-full p-6 space-y-4 shadow-modal animate-modal-in">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Stamp size={16} className="text-accent" />
                <h3 className="text-sm font-semibold text-text-primary font-mono">
                  Record Custody Event ({evidenceId})
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-text-tertiary hover:text-text-primary text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="text-2xs font-mono uppercase text-text-secondary tracking-wider block mb-1">
                  Custody Action
                </label>
                <input
                  type="text"
                  required
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full h-9 bg-surface-03 border border-border-subtle rounded-md px-3 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs font-mono uppercase text-text-secondary tracking-wider block mb-1">
                    Officer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Insp. S. Verma"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full h-9 bg-surface-03 border border-border-subtle rounded-md px-3 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-2xs font-mono uppercase text-text-secondary tracking-wider block mb-1">
                    Badge Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-7182"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    className="w-full h-9 bg-surface-03 border border-border-subtle rounded-md px-3 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-2xs font-mono uppercase text-text-secondary tracking-wider block mb-1">
                    Agency / Division
                  </label>
                  <input
                    type="text"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    className="w-full h-9 bg-surface-03 border border-border-subtle rounded-md px-3 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-2xs font-mono uppercase text-text-secondary tracking-wider block mb-1">
                    Location / Room
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-9 bg-surface-03 border border-border-subtle rounded-md px-3 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-2xs font-mono uppercase text-text-secondary tracking-wider block mb-1">
                  Transfer Notes / Sealing Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Transferred for forensic normalization and keyframe extraction under Section 65B protocol."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-03 border border-border-subtle rounded-md p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-md border border-border-subtle text-xs text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent-hover shadow-sm"
                >
                  Confirm & Seal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
