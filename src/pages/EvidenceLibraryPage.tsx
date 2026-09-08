import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen,
  Search,
} from 'lucide-react';
import { MOCK_EVIDENCE } from '../data/mockEvidence';
import { EvidenceList } from '../components/evidence/EvidenceList';
import type { VendorBrand } from '../types/evidence';
import { formatFileSize } from '../utils/format';

export function EvidenceLibraryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filtered evidence items
  const filteredItems = useMemo(() => {
    return MOCK_EVIDENCE.filter((item) => {
      const matchesSearch =
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.collectionOfficer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sha256 && item.sha256.toLowerCase().includes(searchQuery.toLowerCase()));

      const vendorMatch =
        selectedVendor === 'all' ||
        item.forensicProfile?.vendor === selectedVendor;

      const statusMatch =
        selectedStatus === 'all' ||
        (selectedStatus === 'verified' && (item.status === 'verified' || item.status === 'ingested')) ||
        (selectedStatus === 'warning' && item.forensicProfile?.tamperAnalysis.verdict === 'warning');

      return matchesSearch && vendorMatch && statusMatch;
    });
  }, [searchQuery, selectedVendor, selectedStatus]);

  const totalBytes = MOCK_EVIDENCE.reduce((acc, curr) => acc + curr.fileSize, 0);
  const verifiedCount = MOCK_EVIDENCE.filter((e) => e.status === 'verified' || e.status === 'ingested').length;
  const vendors = Array.from(new Set(MOCK_EVIDENCE.map((e) => e.forensicProfile?.vendor).filter(Boolean))) as VendorBrand[];

  return (
    <div className="max-w-screen-xl mx-auto px-6 pb-24">
      {/* ── Page Header ── */}
      <div className="pt-8 pb-6 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen size={16} className="text-accent" />
            <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">
              Forensic Repository
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight font-mono">
            Evidence Intelligence Library
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Centralized index of all registered surveillance recordings, bodycam captures, and digital exhibits.
          </p>
        </div>

        {/* Global Summary Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-surface-01 border border-border-subtle rounded-lg px-3.5 py-2">
            <span className="text-2xs font-mono text-text-tertiary uppercase">Exhibits</span>
            <p className="text-sm font-bold font-mono text-text-primary mt-0.5">{MOCK_EVIDENCE.length}</p>
          </div>
          <div className="bg-surface-01 border border-border-subtle rounded-lg px-3.5 py-2">
            <span className="text-2xs font-mono text-text-tertiary uppercase">Verified</span>
            <p className="text-sm font-bold font-mono text-green mt-0.5">{verifiedCount}</p>
          </div>
          <div className="bg-surface-01 border border-border-subtle rounded-lg px-3.5 py-2">
            <span className="text-2xs font-mono text-text-tertiary uppercase">Volume</span>
            <p className="text-sm font-bold font-mono text-accent mt-0.5">{formatFileSize(totalBytes)}</p>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="my-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename, exhibit ID, officer, SHA-256 hash..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-01 border border-border-subtle text-xs text-text-primary placeholder:text-text-tertiary font-mono focus:outline-none focus:border-accent"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-2xs font-mono text-text-tertiary uppercase">Integrity:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-lg bg-surface-01 border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
            >
              <option value="all">All Records</option>
              <option value="verified">Verified Intact</option>
              <option value="warning">Tamper/Drift Advisory</option>
            </select>
          </div>
        </div>

        {/* Vendor Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-2xs font-mono text-text-tertiary uppercase mr-1">DVR Vendor:</span>
          <button
            onClick={() => setSelectedVendor('all')}
            className={`px-3 py-1 rounded-md font-mono text-xs transition-colors ${
              selectedVendor === 'all'
                ? 'bg-accent text-white font-semibold shadow-sm'
                : 'bg-surface-01 border border-border-subtle text-text-secondary hover:text-text-primary'
            }`}
          >
            All Vendors ({MOCK_EVIDENCE.length})
          </button>
          {vendors.map((v) => {
            const count = MOCK_EVIDENCE.filter((e) => e.forensicProfile?.vendor === v).length;
            const isSelected = selectedVendor === v;
            return (
              <button
                key={v}
                onClick={() => setSelectedVendor(v)}
                className={`px-3 py-1 rounded-md font-mono text-xs transition-colors ${
                  isSelected
                    ? 'bg-accent text-white font-semibold shadow-sm'
                    : 'bg-surface-01 border border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                {v} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Evidence List Table ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-text-tertiary font-mono px-1">
          <span>Displaying {filteredItems.length} evidence exhibits</span>
          <span>Click any row to inspect full forensic profile</span>
        </div>

        <EvidenceList
          items={filteredItems}
          onSelect={(item) => navigate(`/case/${item.caseId}/evidence/${item.id}`)}
        />
      </div>
    </div>
  );
}
