import { useState, useMemo } from 'react';
import {
  Search,
  Bookmark,
  Sparkles,
  Camera,
  Layers,
  Pin,
} from 'lucide-react';
import type {
  DetectionEvent,
  InvestigationFilterState,
} from '../../types/investigation';
import { MOCK_DETECTIONS, MOCK_INVESTIGATIONS } from '../../data/mockInvestigation';
import { InvestigationFilters } from './InvestigationFilters';
import { DetectionCard } from './DetectionCard';
import { TimelineSyncView } from './TimelineSyncView';
import { SuspectJourneyMap } from './SuspectJourneyMap';
import { DetectionInspectionModal } from './DetectionInspectionModal';

interface InvestigationWorkspaceProps {
  initialCaseId?: string;
  isCaseScoped?: boolean;
  investigationId?: string; // When provided, scope detections to this investigation's detectionIds
  pinnedDetectionIds?: string[];
  onTogglePinDetection?: (detectionId: string) => void;
}

export function InvestigationWorkspace({
  initialCaseId = 'all',
  isCaseScoped = false,
  investigationId,
  pinnedDetectionIds,
  onTogglePinDetection,
}: InvestigationWorkspaceProps) {
  const [detections, setDetections] = useState<DetectionEvent[]>(MOCK_DETECTIONS);
  const [inspectedDetection, setInspectedDetection] = useState<DetectionEvent | null>(null);
  const [scopeMode, setScopeMode] = useState<'pinned' | 'all'>('pinned');

  // Active pinned detection IDs for this investigation
  const activePinnedIds = useMemo(() => {
    if (pinnedDetectionIds) return pinnedDetectionIds;
    if (investigationId) {
      const inv = MOCK_INVESTIGATIONS.find((i) => i.id === investigationId);
      return inv ? inv.detectionIds : [];
    }
    return [];
  }, [pinnedDetectionIds, investigationId]);

  const [filters, setFilters] = useState<InvestigationFilterState>({
    caseId: initialCaseId,
    targetType: 'all',
    color: 'all',
    cameraChannel: 'all',
    minConfidence: 0.75,
    searchQuery: '',
    viewMode: 'grid',
    bookmarkedOnly: false,
    timeRange: 'all',
  });

  // Extract all available camera channels based on active case filter
  const availableCameras = useMemo(() => {
    const relevant =
      filters.caseId === 'all'
        ? detections
        : detections.filter((d) => d.caseId === filters.caseId);
    return Array.from(new Set(relevant.map((d) => d.cameraChannel)));
  }, [detections, filters.caseId]);

  // Case detections count for switcher
  const caseDetectionsCount = useMemo(() => {
    return detections.filter(
      (d) => filters.caseId === 'all' || d.caseId === filters.caseId
    ).length;
  }, [detections, filters.caseId]);

  // Handle filter changes
  const handleFilterChange = (patch: Partial<InvestigationFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  // Toggle bookmark on detection
  const handleToggleBookmark = (id: string) => {
    setDetections((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isBookmarked: !d.isBookmarked } : d))
    );
    if (inspectedDetection?.id === id) {
      setInspectedDetection((prev) =>
        prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null
      );
    }
  };

  // Toggle flag for court report
  const handleToggleFlagReport = (id: string) => {
    setDetections((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, flaggedForReport: !d.flaggedForReport } : d
      )
    );
  };

  // Filtered detections
  const filteredDetections = useMemo(() => {
    return detections.filter((item) => {
      // Investigation scope — when investigationId is provided and mode is 'pinned', only show pinned detections
      if (investigationId && scopeMode === 'pinned') {
        if (!activePinnedIds.includes(item.id)) return false;
      }

      // Case filter
      if (filters.caseId !== 'all' && item.caseId !== filters.caseId) {
        return false;
      }

      // Target category
      if (filters.targetType !== 'all' && item.targetType !== filters.targetType) {
        return false;
      }

      // Color filter
      if (filters.color !== 'all' && item.attributes.color?.toLowerCase() !== filters.color) {
        return false;
      }

      // Camera filter
      if (filters.cameraChannel !== 'all' && item.cameraChannel !== filters.cameraChannel) {
        return false;
      }

      // Confidence threshold
      if (item.confidence < filters.minConfidence) {
        return false;
      }

      // Bookmarks only
      if (filters.bookmarkedOnly && !item.isBookmarked) {
        return false;
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          item.label.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.cameraChannel.toLowerCase().includes(q) ||
          item.cameraLocation.toLowerCase().includes(q) ||
          (item.attributes.plateNumber &&
            item.attributes.plateNumber.toLowerCase().includes(q)) ||
          (item.attributes.clothing &&
            item.attributes.clothing.toLowerCase().includes(q)) ||
          (item.notes && item.notes.toLowerCase().includes(q));

        if (!matches) return false;
      }

      return true;
    });
  }, [detections, filters, investigationId]);

  // Derived statistics
  const stats = useMemo(() => {
    const total = filteredDetections.length;
    const persons = filteredDetections.filter((d) => d.targetType === 'person').length;
    const vehicles = filteredDetections.filter((d) => d.targetType === 'vehicle').length;
    const bookmarked = filteredDetections.filter((d) => d.isBookmarked).length;
    return { total, persons, vehicles, bookmarked };
  }, [filteredDetections]);

  return (
    <div className="space-y-6">
      {/* ── Filter & Search Bar ── */}
      <InvestigationFilters
        filters={filters}
        onChange={handleFilterChange}
        availableCameras={availableCameras}
        isCaseScoped={isCaseScoped}
      />

      {/* ── Investigation Scope Mode Switcher (Pinned vs All Case Detections) ── */}
      {investigationId && (
        <div className="flex items-center justify-between gap-4 p-2.5 bg-surface-01 border border-border-subtle rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-mono uppercase tracking-wider text-text-tertiary px-2">
              Viewing Scope:
            </span>
            <button
              onClick={() => setScopeMode('pinned')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scopeMode === 'pinned'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-02'
              }`}
              id="scope-pinned-btn"
            >
              <Pin size={12} className={scopeMode === 'pinned' ? 'fill-current rotate-45' : 'rotate-45'} />
              <span>Pinned Detections ({activePinnedIds.length})</span>
            </button>

            <button
              onClick={() => setScopeMode('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scopeMode === 'all'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-02'
              }`}
              id="scope-all-btn"
            >
              <span>All Case Detections ({caseDetectionsCount})</span>
            </button>
          </div>

          <div className="text-3xs font-mono text-text-tertiary hidden sm:block pr-2">
            {scopeMode === 'pinned'
              ? 'Showing evidence tagged to this investigation hypothesis'
              : 'Click the Pin icon on any card to link evidence to this investigation'}
          </div>
        </div>
      )}

      {/* ── Quick Stats Metric Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-01 border border-border-subtle flex items-center justify-between">
          <div>
            <p className="text-2xs font-mono uppercase text-text-tertiary">Indexed Sightings</p>
            <p className="text-lg font-bold text-text-primary font-mono">{stats.total}</p>
          </div>
          <Layers size={18} className="text-accent opacity-80" />
        </div>

        <div className="p-3.5 rounded-xl bg-surface-01 border border-border-subtle flex items-center justify-between">
          <div>
            <p className="text-2xs font-mono uppercase text-text-tertiary">Persons Tracked</p>
            <p className="text-lg font-bold text-text-primary font-mono">{stats.persons}</p>
          </div>
          <Sparkles size={18} className="text-blue-400 opacity-80" />
        </div>

        <div className="p-3.5 rounded-xl bg-surface-01 border border-border-subtle flex items-center justify-between">
          <div>
            <p className="text-2xs font-mono uppercase text-text-tertiary">Vehicles / Plates</p>
            <p className="text-lg font-bold text-text-primary font-mono">{stats.vehicles}</p>
          </div>
          <Camera size={18} className="text-green opacity-80" />
        </div>

        <div className="p-3.5 rounded-xl bg-surface-01 border border-border-subtle flex items-center justify-between">
          <div>
            <p className="text-2xs font-mono uppercase text-text-tertiary">Bookmarked Exhibits</p>
            <p className="text-lg font-bold text-amber font-mono">{stats.bookmarked}</p>
          </div>
          <Bookmark size={18} className="text-amber opacity-80" />
        </div>
      </div>

      {/* ── Active View Mode Content ── */}
      {filters.viewMode === 'grid' && (
        <div>
          {filteredDetections.length === 0 ? (
            investigationId && scopeMode === 'pinned' ? (
              <div className="p-14 text-center bg-surface-01 border border-border-subtle rounded-xl text-text-secondary space-y-3">
                <div className="w-12 h-12 rounded-xl bg-surface-02 border border-border-subtle flex items-center justify-center mx-auto text-text-tertiary">
                  <Pin size={22} className="rotate-45" />
                </div>
                <p className="text-base font-semibold text-text-primary">No detections pinned to this investigation yet</p>
                <p className="text-xs text-text-tertiary max-w-sm mx-auto leading-relaxed">
                  Browse all detections indexed for this case and pin relevant sightings to track this suspect or vehicle.
                </p>
                <button
                  type="button"
                  onClick={() => setScopeMode('all')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
                  id="browse-case-detections-btn"
                >
                  Browse All Case Detections to Pin
                </button>
              </div>
            ) : (
              <div className="p-16 text-center bg-surface-01 border border-border-subtle rounded-xl text-text-secondary">
                <Search size={32} className="mx-auto text-text-tertiary mb-3" />
                <p className="text-base font-semibold text-text-primary">No detections match your query</p>
                <p className="text-xs text-text-tertiary mt-1">
                  Try lowering the minimum confidence slider or broadening the category filters.
                </p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDetections.map((detection) => (
                <DetectionCard
                  key={detection.id}
                  detection={detection}
                  onInspect={(det) => setInspectedDetection(det)}
                  onToggleBookmark={handleToggleBookmark}
                  isInvestigationActive={!!investigationId}
                  isPinned={activePinnedIds.includes(detection.id)}
                  onTogglePin={onTogglePinDetection}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {filters.viewMode === 'timeline' && (
        <TimelineSyncView
          detections={filteredDetections}
          onInspect={(det) => setInspectedDetection(det)}
        />
      )}

      {filters.viewMode === 'journey' && (
        <SuspectJourneyMap
          caseId={filters.caseId === 'all' ? undefined : filters.caseId}
          onInspectDetectionId={(detId) => {
            const found = detections.find((d) => d.id === detId);
            if (found) setInspectedDetection(found);
          }}
        />
      )}

      {/* ── Deep Inspection Modal ── */}
      <DetectionInspectionModal
        detection={inspectedDetection}
        onClose={() => setInspectedDetection(null)}
        onToggleBookmark={handleToggleBookmark}
        onToggleFlagReport={handleToggleFlagReport}
      />
    </div>
  );
}
