import { useState } from 'react';
import {
  Server,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Wifi,
  Cpu,
  ArrowRight,
  Info,
} from 'lucide-react';
import type {
  DeviceConnection,
  DeviceFingerprint,
  AcquisitionProtocol,
} from '../../types/acquisition';
import { acquisitionService } from '../../services/acquisition/acquisitionService';
import { Button } from '../ui/primitives';

interface DeviceConnectionStepProps {
  onConnected: (connection: DeviceConnection, fingerprint: DeviceFingerprint) => void;
  initialConnection?: DeviceConnection;
  initialFingerprint?: DeviceFingerprint;
}

export function DeviceConnectionStep({
  onConnected,
  initialConnection,
  initialFingerprint,
}: DeviceConnectionStepProps) {
  const [ipAddress, setIpAddress] = useState(initialConnection?.ipAddress ?? '192.168.1.100');
  const [port, setPort] = useState<number>(initialConnection?.port ?? 8000);
  const [username, setUsername] = useState(initialConnection?.username ?? 'admin');
  const [password, setPassword] = useState('forensic_admin_2026');
  const [protocol, setProtocol] = useState<AcquisitionProtocol>(
    initialConnection?.protocol ?? 'ONVIF'
  );

  const [isConnecting, setIsConnecting] = useState(false);
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint | null>(
    initialFingerprint ?? null
  );
  const [error, setError] = useState<string | null>(null);

  const handlePresetSelect = (_pVendor: string, pPort: number, pProto: AcquisitionProtocol) => {
    setPort(pPort);
    setProtocol(pProto);
    if (fingerprint) {
      setFingerprint(null);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipAddress.trim()) {
      setError('Please provide a valid DVR/NVR IP address.');
      return;
    }

    setError(null);
    setIsConnecting(true);

    try {
      const conn: DeviceConnection = {
        ipAddress: ipAddress.trim(),
        port: Number(port),
        username: username.trim(),
        protocol,
      };
      const fp = await acquisitionService.connect(conn);
      setFingerprint(fp);
    } catch {
      setError('Failed to establish simulated connection.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleProceed = () => {
    if (fingerprint) {
      onConnected(
        {
          ipAddress: ipAddress.trim(),
          port: Number(port),
          username: username.trim(),
          protocol,
        },
        fingerprint
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Prominent Mandatory Simulation Banner ── */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber/10 border border-amber/30 text-amber">
        <ShieldAlert size={18} className="shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold uppercase tracking-wider font-mono">
            DEMO / SIMULATED ACQUISITION WORKFLOW
          </p>
          <p className="text-text-secondary leading-relaxed">
            All network handshakes, device discovery, and media extractions in this step are
            simulated for forensic demonstration. No physical network probes or raw socket transmissions
            are performed on the local host.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Connection Parameters */}
        <div className="lg:col-span-7 bg-surface-01 border border-border-subtle rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-accent" />
              <h3 className="text-sm font-semibold text-text-primary">
                DVR/NVR Target Endpoint
              </h3>
            </div>
            <span className="text-3xs font-mono px-2 py-0.5 rounded bg-surface-02 border border-border-subtle text-text-tertiary uppercase">
              Simulated Node
            </span>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-2">
              Hardware Profile Presets (Demo)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect('Hikvision', 8000, 'PROPRIETARY_SDK')}
                className={`px-3 py-2 rounded-lg text-xs font-mono text-left border transition-all ${
                  port === 8000
                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                    : 'border-border-subtle bg-surface-02 text-text-secondary hover:border-border-default'
                }`}
              >
                <div className="font-medium">Hikvision SDK</div>
                <div className="text-3xs text-text-tertiary mt-0.5">Port 8000</div>
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('Dahua', 37777, 'PROPRIETARY_SDK')}
                className={`px-3 py-2 rounded-lg text-xs font-mono text-left border transition-all ${
                  port === 37777
                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                    : 'border-border-subtle bg-surface-02 text-text-secondary hover:border-border-default'
                }`}
              >
                <div className="font-medium">Dahua DHIP</div>
                <div className="text-3xs text-text-tertiary mt-0.5">Port 37777</div>
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('ONVIF', 80, 'ONVIF')}
                className={`px-3 py-2 rounded-lg text-xs font-mono text-left border transition-all ${
                  port === 80
                    ? 'border-accent bg-accent/10 text-accent font-semibold'
                    : 'border-border-subtle bg-surface-02 text-text-secondary hover:border-border-default'
                }`}
              >
                <div className="font-medium">ONVIF Profile S/G</div>
                <div className="text-3xs text-text-tertiary mt-0.5">Port 80 / 8899</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Target IP Address
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => {
                    setIpAddress(e.target.value);
                    if (fingerprint) setFingerprint(null);
                  }}
                  placeholder="192.168.1.100"
                  className="w-full px-3 py-2 rounded-lg bg-surface-02 border border-border-default text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Port
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => {
                    setPort(Number(e.target.value));
                    if (fingerprint) setFingerprint(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-surface-02 border border-border-default text-xs font-mono text-text-primary focus:outline-none focus:border-accent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-02 border border-border-default text-xs text-text-primary focus:outline-none focus:border-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-02 border border-border-default text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-mono uppercase tracking-wider text-text-tertiary mb-1">
                Acquisition Protocol
              </label>
              <div className="flex gap-4">
                {(['ONVIF', 'PROPRIETARY_SDK', 'RTSP'] as AcquisitionProtocol[]).map((proto) => (
                  <label key={proto} className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
                    <input
                      type="radio"
                      name="protocol"
                      value={proto}
                      checked={protocol === proto}
                      onChange={() => setProtocol(proto)}
                      className="text-accent focus:ring-accent bg-surface-02 border-border-default"
                    />
                    <span className="font-mono text-2xs">
                      {proto === 'PROPRIETARY_SDK' ? 'Proprietary SDK' : proto}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red font-mono bg-red/10 border border-red/20 rounded p-2">
                {error}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between">
              <div className="text-3xs font-mono text-text-tertiary flex items-center gap-1.5">
                <Info size={11} />
                <span>Target: {ipAddress}:{port} | Protocol: {protocol}</span>
              </div>
              <Button
                type="submit"
                variant="primary"
                disabled={isConnecting}
                icon={isConnecting ? <Loader2 size={13} className="animate-spin" /> : <Wifi size={13} />}
                id="connect-device-btn"
              >
                {isConnecting ? 'Handshaking...' : 'Connect Device'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Panel: Device Fingerprint Result */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex-1 bg-surface-01 border border-border-subtle rounded-xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-accent" />
                  <h3 className="text-sm font-semibold text-text-primary">
                    Device Fingerprint
                  </h3>
                </div>
                {fingerprint && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-mono bg-green/10 text-green border border-green/30">
                    <CheckCircle2 size={10} />
                    SIMULATED CONNECTION SUCCESSFUL
                  </span>
                )}
              </div>

              {fingerprint ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-surface-02 border border-border-subtle space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border-subtle/50">
                      <span className="text-text-tertiary">Vendor:</span>
                      <span className="font-semibold text-text-primary font-mono">{fingerprint.vendor}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle/50">
                      <span className="text-text-tertiary">Model:</span>
                      <span className="font-mono text-text-primary">{fingerprint.model}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle/50">
                      <span className="text-text-tertiary">Firmware:</span>
                      <span className="font-mono text-text-secondary">{fingerprint.firmware}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle/50">
                      <span className="text-text-tertiary">Channel Capacity:</span>
                      <span className="font-mono text-accent font-semibold">{fingerprint.channelCount} Channels</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-text-tertiary">NTP Status:</span>
                      <span className="font-mono text-text-secondary text-2xs">{fingerprint.ntpStatus}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-base border border-border-subtle text-3xs font-mono text-text-tertiary space-y-1">
                    <p className="font-semibold text-text-secondary uppercase">Connection Provenance:</p>
                    <p>Channel Discovery Endpoint: RTSP/ONVIF v2.4 (Simulated)</p>
                    <p>Payload Encryption: TLS 1.3 / AES-128-GCM</p>
                    <p>Source Identification: DEMO / SIMULATED</p>
                  </div>
                </div>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border-subtle rounded-lg">
                  <Server size={28} className="text-text-tertiary mb-3 opacity-60" />
                  <p className="text-xs font-semibold text-text-secondary mb-1">
                    Awaiting Device Connection
                  </p>
                  <p className="text-3xs text-text-tertiary max-w-xs leading-relaxed">
                    Enter endpoint credentials and click &ldquo;Connect Device&rdquo; to simulate camera stream negotiation and device fingerprint discovery.
                  </p>
                </div>
              )}
            </div>

            {fingerprint && (
              <div className="pt-4 mt-4 border-t border-border-subtle flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleProceed}
                  icon={<ArrowRight size={13} />}
                  id="proceed-to-channels-btn"
                >
                  Proceed to Scope Selection
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
