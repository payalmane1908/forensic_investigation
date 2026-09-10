export type AcquisitionStatus =
  | 'pending'
  | 'connecting'
  | 'connected'
  | 'acquiring'
  | 'completed'
  | 'failed';

export type AcquisitionProtocol =
  | 'ONVIF'
  | 'RTSP'
  | 'PROPRIETARY_SDK';

export interface DeviceConnection {
  ipAddress: string;
  port: number;
  username: string;
  protocol: AcquisitionProtocol;
}

export interface DeviceFingerprint {
  vendor: string;
  model: string;
  firmware?: string;
  channelCount: number;
  ntpStatus?: string;
}

export interface AcquisitionChannel {
  id: string;
  name: string;
  resolution: string;
  motionActivity?: boolean;
  bitrate?: string;
  fps?: number;
}

export interface AcquisitionJob {
  id: string;
  investigationId: string;
  status: AcquisitionStatus;
  device: DeviceConnection;
  fingerprint?: DeviceFingerprint;
  channelIds: string[];
  startTime: string;
  endTime: string;
  progress: number;
  evidenceIds: string[];
  createdAt: string;
}
