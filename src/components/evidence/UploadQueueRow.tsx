import { useState } from 'react';
import {
  Film,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import type { UploadQueueItem, DeviceType } from '../../types/evidence';
import { Input, Textarea } from '../ui/primitives';
import { formatFileSize } from '../../utils/format';

interface UploadQueueRowProps {
  item: UploadQueueItem;
  onRemove: (uid: string) => void;
  onMetaChange: (uid: string, patch: Partial<UploadQueueItem>) => void;
}

const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  dvr:       'DVR (Digital Video Recorder)',
  nvr:       'NVR (Network Video Recorder)',
  ip_camera: 'IP Camera',
  mobile:    'Mobile Device',
  dashcam:   'Dash Camera',
  bodycam:   'Body Camera',
  other:     'Other',
};

const STATUS_CONFIG = {
  queued:   { icon: <Film size={14} />, label: 'Queued', color: 'text-text-tertiary' },
  hashing:  {
    icon: <Loader2 size={14} className="animate-spin" />,
    label: 'Computing Hash…',
    color: 'text-amber',
  },
  verified: {
    icon: <ShieldCheck size={14} />,
    label: 'Hash Verified',
    color: 'text-green',
  },
  ingested: {
    icon: <CheckCircle2 size={14} />,
    label: 'Ingested',
    color: 'text-green',
  },
  error: {
    icon: <XCircle size={14} />,
    label: 'Error',
    color: 'text-red',
  },
};

export function UploadQueueRow({
  item,
  onRemove,
  onMetaChange,
}: UploadQueueRowProps) {
  const [expanded, setExpanded] = useState(true);
  const statusCfg = STATUS_CONFIG[item.status];
  const isProcessing = item.status === 'hashing';
  const isDone = item.status === 'ingested' || item.status === 'verified';

  const patch = (field: Partial<UploadQueueItem>) => onMetaChange(item.uid, field);

  return (
    <div
      className={`
        rounded-lg border bg-surface-01 overflow-hidden
        transition-all duration-200
        ${
          item.status === 'error'
            ? 'border-red/30'
            : isDone
            ? 'border-green/20'
            : 'border-border-subtle'
        }
      `}
    >
      {/* ── Row header ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* File icon */}
        <div
          className={`
            w-8 h-8 rounded-md flex items-center justify-center shrink-0
            ${isDone ? 'bg-green-dim text-green' : 'bg-surface-02 text-text-tertiary'}
          `}
        >
          <Film size={15} />
        </div>

        {/* Filename + size */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate font-mono">
            {item.file.name}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">
            {formatFileSize(item.file.size)}
          </p>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-1.5 text-xs font-medium ${statusCfg.color} shrink-0`}>
          {statusCfg.icon}
          <span>{statusCfg.label}</span>
        </div>

        {/* Expand / Remove */}
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {!isDone && (
            <button
              onClick={() => onRemove(item.uid)}
              className="p-1.5 text-text-tertiary hover:text-red hover:bg-red-dim rounded-md transition-colors"
              title="Remove"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-02 rounded-md transition-colors"
            title={expanded ? 'Collapse' : 'Expand metadata'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {isProcessing && (
        <div className="px-4 pb-2">
          <div className="h-0.5 bg-surface-03 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber rounded-full transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      )}

      {isDone && item.sha256 && (
        <div className="px-4 pb-3 flex items-center gap-2">
          <ShieldCheck size={11} className="text-green shrink-0" />
          <span className="text-2xs font-mono text-text-tertiary truncate">
            SHA-256: {item.sha256}
          </span>
        </div>
      )}

      {/* ── Metadata form ── */}
      {expanded && !isProcessing && (
        <div className="border-t border-border-subtle px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Device Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Device Type *
            </label>
            <select
              value={item.deviceType}
              onChange={(e) => patch({ deviceType: e.target.value as DeviceType })}
              disabled={isDone}
              className="
                w-full h-10 rounded-md border text-sm px-3
                bg-surface-03 border-border-subtle text-text-primary
                focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                disabled:opacity-50 disabled:cursor-not-allowed
                appearance-none
              "
            >
              {Object.entries(DEVICE_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Device Model */}
          <Input
            label="Device Model *"
            placeholder="e.g. Hikvision DS-7208HQHI-K2"
            value={item.deviceModel}
            onChange={(e) => patch({ deviceModel: e.target.value })}
            disabled={isDone}
          />

          {/* Camera Channel */}
          <Input
            label="Camera Channel"
            placeholder="e.g. CH-03, CAM-01"
            value={item.cameraChannel}
            onChange={(e) => patch({ cameraChannel: e.target.value })}
            mono
            disabled={isDone}
          />

          {/* Collection Officer */}
          <Input
            label="Collection Officer *"
            placeholder="e.g. SI D. Mehta"
            value={item.collectionOfficer}
            onChange={(e) => patch({ collectionOfficer: e.target.value })}
            disabled={isDone}
          />

          {/* Collection Time */}
          <Input
            label="Collection Date & Time *"
            type="datetime-local"
            value={item.collectionTime}
            onChange={(e) => patch({ collectionTime: e.target.value })}
            disabled={isDone}
          />

          {/* Physical Location */}
          <Input
            label="Source Location"
            placeholder="e.g. Central Market Gate-3, CCTV Room"
            value={item.location}
            onChange={(e) => patch({ location: e.target.value })}
            disabled={isDone}
          />

          {/* Notes — full width */}
          <div className="sm:col-span-2">
            <Textarea
              label="Notes"
              placeholder="Additional observations, timestamps of interest, chain-of-custody remarks…"
              rows={2}
              value={item.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              disabled={isDone}
            />
          </div>
        </div>
      )}
    </div>
  );
}
