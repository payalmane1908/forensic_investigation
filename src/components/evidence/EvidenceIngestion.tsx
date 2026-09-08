import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, UploadCloud } from 'lucide-react';
import { DropZone } from './DropZone';
import { UploadQueueRow } from './UploadQueueRow';
import { EvidenceList } from './EvidenceList';
import { Button, Separator } from '../ui/primitives';
import type {
  EvidenceItem,
  UploadQueueItem,
  ForensicProfile,
  VendorBrand,
  CustodyEvent,
} from '../../types/evidence';
import { generateEvidenceId } from '../../utils/format';

interface EvidenceIngestionProps {
  caseId: string;
  existingEvidence: EvidenceItem[];
  onEvidenceAdded: (items: EvidenceItem[]) => void;
}

// Simulate SHA-256 hashing with a progress-based delay
function simulateHash(_uid: string, onProgress: (p: number) => void): Promise<string> {
  return new Promise((resolve) => {
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        clearInterval(interval);
        onProgress(100);
        // Generate a fake-but-realistic-looking hex hash
        const hash = Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        resolve(hash);
      } else {
        onProgress(Math.floor(p));
      }
    }, 200);
  });
}

function generateUid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function EvidenceIngestion({
  caseId,
  existingEvidence,
  onEvidenceAdded,
}: EvidenceIngestionProps) {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [finalizing, setFinalizing] = useState(false);
  const [successCount, setSuccessCount] = useState(0);

  // Add files to the queue
  const handleFiles = useCallback((files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((file) => ({
      uid: generateUid(),
      file,
      progress: 0,
      status: 'queued',
      deviceType: 'dvr',
      deviceModel: '',
      cameraChannel: '',
      collectionOfficer: '',
      collectionTime: new Date().toISOString().slice(0, 16),
      location: '',
      notes: '',
    }));
    setQueue((prev) => [...prev, ...newItems]);
  }, []);

  const handleRemove = useCallback((uid: string) => {
    setQueue((prev) => prev.filter((item) => item.uid !== uid));
  }, []);

  const handleMetaChange = useCallback(
    (uid: string, patch: Partial<UploadQueueItem>) => {
      setQueue((prev) =>
        prev.map((item) => (item.uid === uid ? { ...item, ...patch } : item))
      );
    },
    []
  );

  // Validate queue — all required fields filled
  const queueReady = queue.length > 0 &&
    queue.every(
      (item) =>
        item.status === 'queued' &&
        item.deviceModel.trim() &&
        item.collectionOfficer.trim() &&
        item.collectionTime
    );

  // Ingest: hash each file then mark as ingested
  const handleIngest = async () => {
    if (!queueReady) return;
    setFinalizing(true);

    // Process each queued item sequentially
    const newEvidence: EvidenceItem[] = [];
    const existingIds = [
      ...existingEvidence.map((e) => e.id),
      ...newEvidence.map((e) => e.id),
    ];

    for (const item of queue) {
      // Start hashing
      setQueue((prev) =>
        prev.map((q) => (q.uid === item.uid ? { ...q, status: 'hashing', progress: 0 } : q))
      );

      const sha256 = await simulateHash(item.uid, (p) => {
        setQueue((prev) =>
          prev.map((q) => (q.uid === item.uid ? { ...q, progress: p } : q))
        );
      });

      // Mark verified
      setQueue((prev) =>
        prev.map((q) =>
          q.uid === item.uid ? { ...q, status: 'verified', sha256, progress: 100 } : q
        )
      );

      // Brief pause before marking ingested
      await new Promise((r) => setTimeout(r, 600));

      setQueue((prev) =>
        prev.map((q) => (q.uid === item.uid ? { ...q, status: 'ingested' } : q))
      );

      const evId = generateEvidenceId([...existingIds]);
      existingIds.push(evId);

      const detectedVendor: VendorBrand = item.deviceModel.toLowerCase().includes('hikvision') || item.file.name.endsWith('.dav')
        ? 'Hikvision'
        : item.deviceModel.toLowerCase().includes('dahua')
        ? 'Dahua'
        : item.deviceModel.toLowerCase().includes('axon')
        ? 'Axon'
        : item.deviceModel.toLowerCase().includes('cp plus')
        ? 'CP Plus'
        : 'Generic';

      const initialProfile: ForensicProfile = {
        vendor: detectedVendor,
        vendorConfidence: detectedVendor === 'Generic' ? 88.0 : 99.4,
        containerFormat: item.file.name.endsWith('.dav')
          ? 'DAV (DHAV Proprietary Container v2.1)'
          : `${guessFormat(item.file.name)} Container`,
        codec: 'H.264 / AVC (High@L4.1, CABAC)',
        resolution: '1920 × 1080 (1080p FHD)',
        aspectRatio: '16:9',
        frameRate: 25.0,
        bitrate: '4.0 Mbps (CBR)',
        gopLength: '50 frames (2.0s GOP)',
        scanType: 'Progressive',
        audioTrack: {
          present: false,
        },
        gpsEmbedded: detectedVendor === 'Axon',
        timestamps: {
          startTimestamp: new Date(item.collectionTime).toISOString(),
          endTimestamp: new Date(new Date(item.collectionTime).getTime() + 3600000).toISOString(),
          osdWatermarkTime: new Date(item.collectionTime).toISOString().replace('T', ' ').slice(0, 19),
          internalRtcTime: new Date(item.collectionTime).toISOString().replace('T', ' ').slice(0, 19),
          timeDriftSeconds: 0.005,
          ntpSynchronized: true,
        },
        tamperAnalysis: {
          verdict: 'verified_intact',
          watermarkIntact: true,
          spsPpsConsistency: true,
          crcChecksumMatch: true,
          ptsDtsSequenceValid: true,
          indicators: [
            `${detectedVendor} vendor container header validated`,
            'Monotonic presentation timestamps confirmed',
            'Bitstream hash verified upon upload ingestion',
          ],
        },
        hexHeader: {
          magicBytes: detectedVendor === 'Hikvision' ? '44 48 41 56' : '66 74 79 70',
          magicAscii: detectedVendor === 'Hikvision' ? 'DHAV' : 'ftyp',
          rawSampleHex: [
            '00000000: 44 48 41 56 01 00 00 00  10 00 00 00 20 00 00 00  | DHAV........ ...',
            '00000010: 00 00 00 00 01 00 00 00  E0 07 09 06 14 00 00 00  | ................',
          ],
          detectedSignatures: [
            `Stream Magic: ${detectedVendor} Native Header`,
            'NAL Unit Type 7: Sequence Parameter Set (SPS)',
          ],
        },
        vendorMetadata: {
          'Device Model': item.deviceModel,
          'Seizing Officer': item.collectionOfficer,
          'Physical Location': item.location,
          'Channel ID': item.cameraChannel || 'CH-01',
          'Ingestion Engine': 'Forensic-X Automated Pipeline',
        },
      };

      const initialCustody: CustodyEvent[] = [
        {
          id: `COC-${Math.floor(100 + Math.random() * 900)}`,
          timestamp: new Date(item.collectionTime).toISOString(),
          action: 'On-Scene Recovery & Digital Seizure',
          officer: item.collectionOfficer,
          badgeNumber: 'DL-OFFICER',
          agency: 'Law Enforcement Taskforce',
          location: item.location,
          hashSnapshot: sha256,
          notes: item.notes || 'Evidence recovered from target premises.',
          verified: true,
          tamperSealId: `SEAL-${Math.floor(1000 + Math.random() * 9000)}`,
        },
        {
          id: `COC-${Math.floor(100 + Math.random() * 900)}`,
          timestamp: new Date().toISOString(),
          action: 'Forensic Lab Intake & Bit-Stream Hash Verification',
          officer: 'Forensic-X Automated Pipeline',
          badgeNumber: 'SYS-CORE-01',
          agency: 'Forensic-X Evidence Engine',
          location: 'Forensic-X Server Node-01',
          hashSnapshot: sha256,
          notes: 'SHA-256 computed on ingestion. Hash confirmed matching.',
          verified: true,
        },
      ];

      newEvidence.push({
        id: evId,
        caseId,
        filename: item.file.name,
        fileSize: item.file.size,
        format: guessFormat(item.file.name),
        deviceType: item.deviceType,
        deviceModel: item.deviceModel,
        cameraChannel: item.cameraChannel || 'N/A',
        collectionOfficer: item.collectionOfficer,
        collectionTime: new Date(item.collectionTime).toISOString(),
        location: item.location,
        sha256,
        status: 'ingested',
        notes: item.notes,
        addedAt: new Date().toISOString(),
        forensicProfile: initialProfile,
        chainOfCustody: initialCustody,
      });
    }

    setSuccessCount(newEvidence.length);
    onEvidenceAdded(newEvidence);

    // Clear queue after brief celebration
    setTimeout(() => {
      setQueue([]);
      setFinalizing(false);
      setSuccessCount(0);
    }, 2500);
  };

  const pendingCount = queue.filter((q) => q.status === 'queued').length;
  const processingCount = queue.filter(
    (q) => q.status === 'hashing' || q.status === 'verified' || q.status === 'ingested'
  ).length;

  return (
    <div className="space-y-8">
      {/* ── Section: Upload ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Add Footage</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Drop DVR/NVR footage files. Chain-of-custody metadata is required per file.
            </p>
          </div>
          {queue.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="font-mono text-text-tertiary">
                {queue.length} file{queue.length !== 1 ? 's' : ''} in queue
              </span>
            </div>
          )}
        </div>

        <DropZone onFiles={handleFiles} disabled={finalizing} />
      </section>

      {/* ── Queue ── */}
      {queue.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Upload Queue
            </h3>
            {pendingCount > 0 && (
              <span className="text-2xs text-text-tertiary">
                Fill in all required fields (*) before ingesting
              </span>
            )}
          </div>

          <div className="space-y-3">
            {queue.map((item) => (
              <UploadQueueRow
                key={item.uid}
                item={item}
                onRemove={handleRemove}
                onMetaChange={handleMetaChange}
              />
            ))}
          </div>

          {/* Ingest CTA */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-text-tertiary">
              {!queueReady && pendingCount > 0
                ? 'Complete required metadata fields to enable ingestion.'
                : processingCount > 0
                ? `Processing ${processingCount} file${processingCount !== 1 ? 's' : ''}…`
                : ''}
            </p>
            <div className="flex gap-3">
              {!finalizing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQueue([])}
                  disabled={finalizing}
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                icon={<UploadCloud size={15} />}
                onClick={handleIngest}
                loading={finalizing}
                disabled={!queueReady || finalizing}
              >
                {finalizing
                  ? 'Ingesting…'
                  : `Ingest ${pendingCount} File${pendingCount !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>

          {/* Success banner */}
          {successCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-dim border border-green/20 rounded-lg animate-slide-up">
              <CheckCircle2 size={15} className="text-green shrink-0" />
              <p className="text-sm text-green font-medium">
                {successCount} file{successCount !== 1 ? 's' : ''} successfully ingested and verified.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ── Registered Evidence ── */}
      <section>
        <Separator className="mb-6" />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Registered Evidence
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              All ingested footage files with integrity verification.
            </p>
          </div>
          <span className="text-xs font-mono text-text-tertiary">
            {existingEvidence.length} item{existingEvidence.length !== 1 ? 's' : ''}
          </span>
        </div>

        <EvidenceList
          items={existingEvidence}
          onSelect={(item) => navigate(`/case/${caseId}/evidence/${item.id}`)}
        />
      </section>
    </div>
  );
}

// Guess file format from extension
function guessFormat(filename: string): import('../../types/evidence').FileFormat {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, import('../../types/evidence').FileFormat> = {
    dav: 'H.264', mp4: 'MP4', avi: 'AVI', mkv: 'MKV',
    h264: 'H.264', h265: 'H.265', ts: 'H.264', mts: 'H.264', m2ts: 'H.264',
    mov: 'MP4', nvr: 'NVR', bin: 'Unknown',
  };
  return map[ext ?? ''] ?? 'Unknown';
}
