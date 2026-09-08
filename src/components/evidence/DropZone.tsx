import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, FilePlus, AlertCircle } from 'lucide-react';

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_EXTENSIONS = [
  '.dav', '.mp4', '.avi', '.mkv', '.h264', '.h265',
  '.mov', '.ts', '.mts', '.m2ts', '.nvr', '.bin',
];



function isAccepted(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return (
    ACCEPTED_EXTENSIONS.includes(ext) ||
    file.type.startsWith('video/') ||
    file.type === 'application/octet-stream'
  );
}

export function DropZone({ onFiles, disabled = false }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);
      const rejected = files.filter((f) => !isAccepted(f));
      if (rejected.length > 0) {
        setDragError(
          `${rejected.length} file(s) not supported: ${rejected.map((f) => f.name).join(', ')}`
        );
        setTimeout(() => setDragError(null), 4000);
      }
      const accepted = files.filter(isAccepted);
      if (accepted.length > 0) onFiles(accepted);
    },
    [onFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      // Reset input so the same file can be re-added
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFiles]
  );

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop footage files here or click to browse"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
          }
        }}
        className={`
          relative flex flex-col items-center justify-center gap-4
          border-2 border-dashed rounded-xl px-8 py-12
          cursor-pointer transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50
          ${disabled
            ? 'opacity-40 cursor-not-allowed border-border-subtle'
            : dragging
            ? 'border-accent bg-accent-dim/50 scale-[1.005]'
            : 'border-border-default bg-surface-01 hover:border-accent/60 hover:bg-surface-02'
          }
        `}
      >
        {/* Icon */}
        <div
          className={`
            w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200
            ${dragging ? 'bg-accent/20 text-accent scale-110' : 'bg-surface-02 text-text-tertiary'}
          `}
        >
          {dragging ? (
            <FilePlus size={26} />
          ) : (
            <UploadCloud size={26} />
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm font-medium text-text-primary mb-1">
            {dragging ? 'Release to add footage' : 'Drop footage files here'}
          </p>
          <p className="text-xs text-text-secondary">
            or{' '}
            <span className="text-accent hover:underline font-medium">
              browse files
            </span>
          </p>
          <p className="text-2xs text-text-tertiary mt-3 font-mono tracking-wide">
            DAV · MP4 · AVI · MKV · H.264 · H.265 · NVR · TS · MTS
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
          aria-hidden="true"
        />
      </div>

      {/* Error notice */}
      {dragError && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-dim border border-red/20 rounded-lg animate-slide-up">
          <AlertCircle size={14} className="text-red shrink-0 mt-0.5" />
          <p className="text-xs text-red">{dragError}</p>
        </div>
      )}

      {/* Accepted formats notice */}
      <p className="text-2xs text-text-tertiary text-center">
        Maximum file size: unlimited · Chain-of-custody metadata required per file
      </p>
    </div>
  );
}
