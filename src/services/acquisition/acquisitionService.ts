import type {
  DeviceConnection,
  DeviceFingerprint,
  AcquisitionChannel,
  AcquisitionJob,
} from '../../types/acquisition';
import type { EvidenceItem } from '../../types/evidence';

// Mock fingerprint database by port/protocol/IP
const DEFAULT_FINGERPRINT: DeviceFingerprint = {
  vendor: 'Hikvision',
  model: 'DS-7608NI-K2 / 8P NVR',
  firmware: 'V4.74.005 build 230915',
  channelCount: 8,
  ntpStatus: 'Synchronized (asia.pool.ntp.org, offset -12ms)',
};

const DAHUA_FINGERPRINT: DeviceFingerprint = {
  vendor: 'Dahua',
  model: 'DHI-NVR4216-4KS2/L 4K NVR',
  firmware: 'V4.002.0000000.1.R.230510',
  channelCount: 16,
  ntpStatus: 'Synchronized (time.windows.com, offset +4ms)',
};

const CP_PLUS_FINGERPRINT: DeviceFingerprint = {
  vendor: 'CP Plus',
  model: 'CP-UVR-0801E1-CS Cosmic HD DVR',
  firmware: 'V3.218.0000.0.R.202308',
  channelCount: 8,
  ntpStatus: 'Synchronized (pool.ntp.org, offset -28ms)',
};

const MOCK_CHANNELS: AcquisitionChannel[] = [
  {
    id: 'CH-01',
    name: 'CH-01: Main Entrance Gate (Perimeter)',
    resolution: '1920 × 1080 (1080p FHD)',
    motionActivity: true,
    bitrate: '4.2 Mbps (CBR)',
    fps: 25,
  },
  {
    id: 'CH-02',
    name: 'CH-02: Retail Alley Junction A',
    resolution: '1920 × 1080 (1080p FHD)',
    motionActivity: true,
    bitrate: '4.0 Mbps (VBR)',
    fps: 25,
  },
  {
    id: 'CH-03',
    name: 'CH-03: South Perimeter Fence',
    resolution: '1280 × 720 (720p HD)',
    motionActivity: false,
    bitrate: '2.4 Mbps (CBR)',
    fps: 20,
  },
  {
    id: 'CH-04',
    name: 'CH-04: North Highway Corridor / Egress',
    resolution: '2560 × 1440 (2K QHD)',
    motionActivity: true,
    bitrate: '6.5 Mbps (CBR)',
    fps: 30,
  },
  {
    id: 'CH-05',
    name: 'CH-05: Underground Parking Level -1',
    resolution: '1920 × 1080 (1080p FHD)',
    motionActivity: false,
    bitrate: '3.8 Mbps (VBR)',
    fps: 25,
  },
  {
    id: 'CH-06',
    name: 'CH-06: Loading Bay & Storage Entrance',
    resolution: '1920 × 1080 (1080p FHD)',
    motionActivity: true,
    bitrate: '4.5 Mbps (CBR)',
    fps: 25,
  },
  {
    id: 'CH-07',
    name: 'CH-07: Cash Office Corridor',
    resolution: '1920 × 1080 (1080p FHD)',
    motionActivity: false,
    bitrate: '4.0 Mbps (CBR)',
    fps: 25,
  },
  {
    id: 'CH-08',
    name: 'CH-08: East Exit Turnstile',
    resolution: '1920 × 1080 (1080p FHD)',
    motionActivity: true,
    bitrate: '4.1 Mbps (CBR)',
    fps: 25,
  },
];

export interface AcquisitionService {
  connect(connection: DeviceConnection): Promise<DeviceFingerprint>;
  discoverDevice(connection: DeviceConnection): Promise<DeviceFingerprint>;
  discoverChannels(connection: DeviceConnection): Promise<AcquisitionChannel[]>;
  createEvidenceFromAcquisition(
    job: AcquisitionJob,
    caseId: string,
    investigator: string
  ): EvidenceItem[];
}

/**
 * DemoAcquisitionAdapter implements simulated acquisition logic with realistic delays and fingerprints.
 * In a production forensic station, this adapter connects to hardware DVR/NVR network APIs or direct physical disk controllers.
 */
class DemoAcquisitionAdapter implements AcquisitionService {
  async connect(connection: DeviceConnection): Promise<DeviceFingerprint> {
    // Simulate network handshake and authentication latency
    await new Promise((resolve) => setTimeout(resolve, 1400));

    if (connection.port === 37777 || connection.ipAddress.includes('37')) {
      return DAHUA_FINGERPRINT;
    }
    if (connection.port === 37778 || connection.ipAddress.includes('88')) {
      return CP_PLUS_FINGERPRINT;
    }
    return DEFAULT_FINGERPRINT;
  }

  async discoverDevice(connection: DeviceConnection): Promise<DeviceFingerprint> {
    return this.connect(connection);
  }

  async discoverChannels(connection: DeviceConnection): Promise<AcquisitionChannel[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (connection.port === 37777) {
      // Dahua 16-channel mock
      return [
        ...MOCK_CHANNELS,
        ...MOCK_CHANNELS.slice(0, 4).map((ch, idx) => ({
          ...ch,
          id: `CH-0${9 + idx}`,
          name: `CH-0${9 + idx}: Aux Camera Zone ${idx + 1}`,
        })),
      ];
    }
    return MOCK_CHANNELS;
  }

  createEvidenceFromAcquisition(
    job: AcquisitionJob,
    caseId: string,
    investigator: string
  ): EvidenceItem[] {
    const timestampStr = Date.now().toString();
    const vendor = job.fingerprint?.vendor ?? 'Hikvision';
    const model = job.fingerprint?.model ?? 'DVR/NVR Device';

    return job.channelIds.map((channelId, index) => {
      const channel = MOCK_CHANNELS.find((c) => c.id === channelId) ?? {
        id: channelId,
        name: `${channelId} Stream`,
        resolution: '1920 × 1080 (1080p FHD)',
      };

      const evdId = `EV-ACQ-${String(Math.floor(100 + Math.random() * 900))}-${index + 1}`;
      const safeVendor = vendor.toLowerCase().replace(/\s+/g, '-');
      const filename = `ACQ_${safeVendor}_${channelId}_${timestampStr}.mp4`;
      
      // Simulated SHA-256 hash (clearly identifiable as simulated acquisition)
      const rawHex = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      return {
        id: evdId,
        caseId,
        filename,
        fileSize: 1024 * 1024 * (450 + Math.floor(Math.random() * 320)), // ~450MB-770MB
        format: 'MP4',
        duration: 3600, // 1 hour window
        deviceType: 'nvr',
        deviceModel: model,
        cameraChannel: channelId,
        collectionOfficer: investigator,
        collectionTime: job.createdAt,
        location: `${channel.name} (Acquired via ${job.device.protocol} @ ${job.device.ipAddress})`,
        sha256: rawHex,
        status: 'ingested',
        notes: `[ACQUISITION SIMULATED] Job ID: ${job.id} | Context: Investigation ${job.investigationId} | Range: ${job.startTime} to ${job.endTime}`,
        addedAt: new Date().toISOString(),
        chainOfCustody: [
          {
            id: `COC-${Date.now()}-${index}`,
            timestamp: new Date().toISOString(),
            action: 'Network Forensic Acquisition (Simulated)',
            officer: investigator,
            badgeNumber: 'FX-8842',
            agency: 'Cyber & Forensic Crime Division',
            location: `${job.device.ipAddress}:${job.device.port}`,
            hashSnapshot: rawHex,
            notes: `Acquired ${channel.name} under Investigation ${job.investigationId}. Protocol: ${job.device.protocol}.`,
            verified: true,
          },
        ],
      };
    });
  }
}

export const acquisitionService = new DemoAcquisitionAdapter();
