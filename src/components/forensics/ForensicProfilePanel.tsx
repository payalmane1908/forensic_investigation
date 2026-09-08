import {
  Film,
  Volume2,
  VolumeX,
  Clock,
  Radio,
  MapPin,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { ForensicProfile } from '../../types/evidence';
import { FormatBadge } from './FormatBadge';

interface ForensicProfilePanelProps {
  profile: ForensicProfile;
  filename?: string;
}

export function ForensicProfilePanel({ profile, filename }: ForensicProfilePanelProps) {
  const isSyncGood = Math.abs(profile.timestamps.timeDriftSeconds) < 0.1;

  return (
    <div className="space-y-6">
      {/* ── Top Hero: Vendor Identification Banner ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-5 relative overflow-hidden">
        {/* Background glow tailored to confidence */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">
                DVR Vendor Fingerprint Identification
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-soft" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-text-primary font-mono tracking-tight">
                {profile.vendor} Architecture
              </h2>
              <FormatBadge
                vendor={profile.vendor}
                container={profile.containerFormat}
                confidence={profile.vendorConfidence}
                size="md"
              />
            </div>
            <p className="text-xs text-text-secondary mt-1 max-w-2xl font-mono">
              {filename && <span className="text-text-primary mr-2 font-semibold">{filename} ·</span>}
              Container: <span className="text-text-primary">{profile.containerFormat}</span>
            </p>
          </div>

          {/* Confidence Meter */}
          <div className="bg-surface-02 border border-border-subtle rounded-lg px-4 py-3 min-w-[240px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-text-secondary flex items-center gap-1">
                <Sparkles size={12} className="text-accent" />
                Detection Match
              </span>
              <span className="font-mono font-semibold text-green">
                {profile.vendorConfidence.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-03 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-green rounded-full transition-all duration-500"
                style={{ width: `${profile.vendorConfidence}%` }}
              />
            </div>
            <p className="text-2xs text-text-tertiary mt-1.5 font-mono">
              Magic Bytes: <span className="text-text-secondary">{profile.hexHeader.magicAscii}</span> ({profile.hexHeader.magicBytes})
            </p>
          </div>
        </div>
      </div>

      {/* ── Video & Audio Stream Matrix ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video Stream Specs */}
        <div className="bg-surface-01 border border-border-subtle rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-surface-02 border border-border-subtle flex items-center justify-center text-accent">
                <Film size={15} />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                Primary Video Stream
              </h3>
            </div>
            <span className="text-2xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              Stream 0:0
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
            <div>
              <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">Codec Profile</p>
              <p className="text-xs font-mono text-text-primary mt-0.5 font-medium truncate" title={profile.codec}>
                {profile.codec}
              </p>
            </div>
            <div>
              <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">Resolution</p>
              <p className="text-xs font-mono text-text-primary mt-0.5 font-medium">
                {profile.resolution}
              </p>
            </div>
            <div>
              <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">Native Frame Rate</p>
              <p className="text-xs font-mono text-text-primary mt-0.5 font-medium">
                {profile.frameRate.toFixed(2)} fps (Constant)
              </p>
            </div>
            <div>
              <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">Bitrate</p>
              <p className="text-xs font-mono text-text-primary mt-0.5 font-medium">
                {profile.bitrate}
              </p>
            </div>
            <div>
              <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">GOP Structure</p>
              <p className="text-xs font-mono text-text-primary mt-0.5 font-medium">
                {profile.gopLength}
              </p>
            </div>
            <div>
              <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">Scan Architecture</p>
              <p className="text-xs font-mono text-text-primary mt-0.5 font-medium">
                {profile.scanType}
              </p>
            </div>
          </div>
        </div>

        {/* Audio Track & GPS Sensors */}
        <div className="space-y-4">
          {/* Audio Track */}
          <div className="bg-surface-01 border border-border-subtle rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-surface-02 border border-border-subtle flex items-center justify-center text-accent">
                  {profile.audioTrack.present ? (
                    <Volume2 size={15} />
                  ) : (
                    <VolumeX size={15} className="text-text-tertiary" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Audio Channel
                </h3>
              </div>
              <span
                className={`text-2xs font-mono px-2 py-0.5 rounded border ${
                  profile.audioTrack.present
                    ? 'text-green bg-green/10 border-green/20'
                    : 'text-text-tertiary bg-surface-02 border-border-subtle'
                }`}
              >
                {profile.audioTrack.present ? 'Stream 0:1 Active' : 'No Audio Track'}
              </span>
            </div>

            {profile.audioTrack.present ? (
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">Audio Codec</p>
                  <p className="text-xs font-mono text-text-primary mt-0.5">
                    {profile.audioTrack.codec}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">Sampling Rate</p>
                  <p className="text-xs font-mono text-text-primary mt-0.5">
                    {profile.audioTrack.sampleRate}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">Channels</p>
                  <p className="text-xs font-mono text-text-primary mt-0.5">
                    {profile.audioTrack.channels === 1 ? 'Mono (1 Ch)' : `${profile.audioTrack.channels} Channels`}
                  </p>
                </div>
                <div>
                  <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">Audio Bitrate</p>
                  <p className="text-xs font-mono text-text-primary mt-0.5">
                    {profile.audioTrack.bitrate ?? 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-tertiary py-2">
                Surveillance DVR channel recorded video-only payload. Audio stream demux returned 0 packets.
              </p>
            )}
          </div>

          {/* GPS Telemetry if available */}
          {profile.gpsEmbedded && profile.gpsCoordinates && (
            <div className="bg-surface-01 border border-border-subtle rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#FFD000]/10 border border-[#FFD000]/25 flex items-center justify-center text-[#FFD000]">
                    <MapPin size={15} />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Embedded GPS Telemetry
                  </h3>
                </div>
                <span className="text-2xs font-mono text-[#FFD000] bg-[#FFD000]/10 px-2 py-0.5 rounded border border-[#FFD000]/20">
                  Sub-Frame Fix
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-tertiary font-mono">Coordinates:</span>
                  <span className="font-mono text-text-primary font-semibold">
                    {profile.gpsCoordinates.lat.toFixed(6)}° N, {profile.gpsCoordinates.lng.toFixed(6)}° E
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-tertiary font-mono">Altitude:</span>
                  <span className="font-mono text-text-secondary">
                    {profile.gpsCoordinates.altitude ?? 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-tertiary font-mono">Resolved Sector:</span>
                  <span className="text-text-primary truncate font-medium">
                    {profile.gpsCoordinates.locationName}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Timestamp Calibration & Synchronization ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-surface-02 border border-border-subtle flex items-center justify-center text-accent">
              <Clock size={15} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Timestamp Synchronization & RTC Calibration
              </h3>
              <p className="text-2xs text-text-tertiary font-mono">
                Comparative analysis of OSD watermark text, hardware RTC, and presentation time stamps
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-2xs font-mono px-2.5 py-1 rounded border ${
              isSyncGood
                ? 'text-green bg-green/10 border-green/20'
                : 'text-amber bg-amber/10 border-amber/20'
            }`}
          >
            <Radio size={11} className={isSyncGood ? 'text-green' : 'text-amber animate-pulse'} />
            {isSyncGood ? 'Strict Time Synchronized' : 'Timestamp Drift Detected'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface-02 border border-border-subtle rounded-lg p-3">
            <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">
              OSD Watermark Time
            </p>
            <p className="text-xs font-mono text-text-primary mt-1 font-semibold">
              {profile.timestamps.osdWatermarkTime}
            </p>
            <p className="text-2xs text-text-tertiary mt-1">Rendered on frame matrix</p>
          </div>

          <div className="bg-surface-02 border border-border-subtle rounded-lg p-3">
            <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">
              Internal RTC Clock
            </p>
            <p className="text-xs font-mono text-text-primary mt-1 font-semibold">
              {profile.timestamps.internalRtcTime}
            </p>
            <p className="text-2xs text-text-tertiary mt-1">DVR Motherboard RTC</p>
          </div>

          <div className="bg-surface-02 border border-border-subtle rounded-lg p-3">
            <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">
              Calculated Drift (Δt)
            </p>
            <p
              className={`text-xs font-mono mt-1 font-bold ${
                isSyncGood ? 'text-green' : 'text-amber'
              }`}
            >
              {profile.timestamps.timeDriftSeconds > 0 ? '+' : ''}
              {(profile.timestamps.timeDriftSeconds * 1000).toFixed(0)} ms
            </p>
            <p className="text-2xs text-text-tertiary mt-1">
              {isSyncGood ? 'Within legal tolerance (<100ms)' : 'Offset correction required in M4'}
            </p>
          </div>

          <div className="bg-surface-02 border border-border-subtle rounded-lg p-3">
            <p className="text-2xs text-text-tertiary uppercase tracking-wider font-mono">
              NTP Clock Authority
            </p>
            <p className="text-xs font-mono text-text-primary mt-1 font-semibold">
              {profile.timestamps.ntpSynchronized ? 'NTP Locked (Stratum 2)' : 'Free-Running Unsynced'}
            </p>
            <p className="text-2xs text-text-tertiary mt-1">
              {profile.timestamps.ntpSynchronized ? 'Network Atomic Sync' : 'Local Crystal Skew'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Detected Signatures & NAL Unit Breakdown ── */}
      <div className="bg-surface-01 border border-border-subtle rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">
              Detected Header Signatures & Parser Rules
            </h3>
          </div>
          <span className="text-2xs font-mono text-text-tertiary">
            Target Parser: FORENSIC-X M4 Engine
          </span>
        </div>

        <div className="space-y-2">
          {profile.hexHeader.detectedSignatures.map((sig, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-3 py-2 bg-surface-02 border border-border-subtle rounded-md font-mono text-xs text-text-secondary"
            >
              <Cpu size={12} className="text-accent shrink-0" />
              <span className="text-text-primary font-medium">{sig}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
