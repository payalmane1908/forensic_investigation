import { useState } from 'react';
import { Terminal, Copy, Check, Search, FileCode, Binary, Database } from 'lucide-react';
import type { ForensicProfile } from '../../types/evidence';

interface MetadataTableProps {
  profile: ForensicProfile;
  filename: string;
}

export function MetadataTable({ profile, filename }: MetadataTableProps) {
  const [activeView, setActiveView] = useState<'vendor' | 'hex' | 'container'>('vendor');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Filter vendor metadata
  const filteredMetadata = Object.entries(profile.vendorMetadata).filter(
    ([key, value]) =>
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyValue = async (key: string, val: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const copyAllJson = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          file: filename,
          vendor: profile.vendor,
          container: profile.containerFormat,
          codec: profile.codec,
          resolution: profile.resolution,
          frameRate: profile.frameRate,
          bitrate: profile.bitrate,
          timestamps: profile.timestamps,
          vendorMetadata: profile.vendorMetadata,
        },
        null,
        2
      )
    );
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="bg-surface-01 border border-border-subtle rounded-xl overflow-hidden">
      {/* Header bar with tabs & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border-subtle bg-surface-02">
        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-surface-03 p-1 rounded-lg border border-border-subtle">
          <button
            onClick={() => setActiveView('vendor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === 'vendor'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Database size={13} />
            Proprietary DVR Fields
            <span className="ml-1 text-2xs px-1.5 py-0.2 rounded bg-black/20 font-mono">
              {Object.keys(profile.vendorMetadata).length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('hex')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === 'hex'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Binary size={13} />
            Hex Header Inspector
          </button>

          <button
            onClick={() => setActiveView('container')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === 'container'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileCode size={13} />
            Container Specs
          </button>
        </div>

        {/* Search & Copy Actions */}
        <div className="flex items-center gap-2">
          {activeView === 'vendor' && (
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter metadata tags..."
                className="h-8 pl-8 pr-3 bg-surface-03 border border-border-subtle rounded-md text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent w-48 font-mono"
              />
            </div>
          )}

          <button
            onClick={copyAllJson}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-border-subtle bg-surface-03 hover:bg-surface-02 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            title="Copy entire metadata block as JSON"
          >
            {copiedAll ? (
              <>
                <Check size={13} className="text-green" />
                <span className="text-green font-mono">Copied JSON</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Export JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── View 1: Proprietary DVR Metadata ── */}
      {activeView === 'vendor' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-02/50">
                <th className="py-2.5 px-4 text-2xs font-mono font-medium text-text-tertiary uppercase tracking-wider w-1/3">
                  Proprietary Field / Attribute
                </th>
                <th className="py-2.5 px-4 text-2xs font-mono font-medium text-text-tertiary uppercase tracking-wider w-2/3">
                  Decoded Forensic Value
                </th>
                <th className="w-10 py-2.5 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-mono text-xs">
              {filteredMetadata.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-text-tertiary">
                    No matching metadata attributes found for "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredMetadata.map(([key, val]) => (
                  <tr
                    key={key}
                    className="hover:bg-surface-02/60 transition-colors group"
                  >
                    <td className="py-3 px-4 text-text-secondary font-medium select-all">
                      {key}
                    </td>
                    <td className="py-3 px-4 text-text-primary font-mono select-all break-all">
                      <span className={val.includes('Valid') || val.includes('Intact') ? 'text-green' : ''}>
                        {val}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => copyValue(key, val)}
                        className="text-text-tertiary group-hover:text-text-secondary hover:text-accent p-1 transition-colors"
                        title="Copy value"
                      >
                        {copiedKey === key ? (
                          <Check size={12} className="text-green" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── View 2: Hex Header Inspector ── */}
      {activeView === 'hex' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-accent" />
              <span className="text-xs font-mono text-text-secondary">
                File Header Hex Dump (First 96 Bytes)
              </span>
            </div>
            <div className="flex items-center gap-3 text-2xs font-mono">
              <span className="text-text-tertiary">
                Magic Signature: <span className="text-accent font-semibold">{profile.hexHeader.magicBytes}</span> [{profile.hexHeader.magicAscii}]
              </span>
            </div>
          </div>

          {/* Hex display container */}
          <div className="bg-[#090A0D] border border-border-subtle rounded-lg p-4 font-mono text-xs overflow-x-auto selection:bg-accent/30 leading-relaxed">
            <div className="text-text-tertiary text-2xs pb-2 mb-2 border-b border-border-subtle/50 select-none">
              OFFSET     00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F  | ASCII DECODED
            </div>
            {profile.hexHeader.rawSampleHex.map((line, i) => {
              const isFirstLine = i === 0;
              return (
                <div
                  key={i}
                  className={`py-0.5 tracking-wide hover:bg-surface-02/50 transition-colors ${
                    isFirstLine ? 'text-accent-hover font-semibold' : 'text-text-secondary'
                  }`}
                >
                  {line}
                </div>
              );
            })}
          </div>

          {/* Hex annotations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="bg-surface-02 border border-border-subtle rounded-md p-2.5">
              <p className="text-2xs text-text-tertiary font-mono uppercase">Header Magic</p>
              <p className="text-xs font-mono text-text-primary mt-0.5 font-semibold">
                {profile.hexHeader.magicBytes}
              </p>
              <p className="text-2xs text-text-tertiary mt-0.5">Identifies {profile.vendor} container</p>
            </div>
            <div className="bg-surface-02 border border-border-subtle rounded-md p-2.5">
              <p className="text-2xs text-text-tertiary font-mono uppercase">ASCII Signature</p>
              <p className="text-xs font-mono text-accent mt-0.5 font-semibold">
                "{profile.hexHeader.magicAscii}"
              </p>
              <p className="text-2xs text-text-tertiary mt-0.5">Stream header marker</p>
            </div>
            <div className="bg-surface-02 border border-border-subtle rounded-md p-2.5">
              <p className="text-2xs text-text-tertiary font-mono uppercase">Byte Endianness</p>
              <p className="text-xs font-mono text-text-primary mt-0.5 font-semibold">
                Little Endian (x86/ARM)
              </p>
              <p className="text-2xs text-text-tertiary mt-0.5">Hardware architecture</p>
            </div>
          </div>
        </div>
      )}

      {/* ── View 3: Container Specs ── */}
      {activeView === 'container' && (
        <div className="p-5 space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-02 border border-border-subtle rounded-lg p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider text-text-secondary mb-3">
                Container Demux Architecture
              </h4>
              <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                <span className="text-text-tertiary">Container Specification:</span>
                <span className="text-text-primary">{profile.containerFormat}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                <span className="text-text-tertiary">Demux Engine:</span>
                <span className="text-text-primary">FORENSIC-X Native Parser v3.2</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                <span className="text-text-tertiary">Stream Interleaving:</span>
                <span className="text-text-primary">Packetized Elementary Stream (PES)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Chunk Indexing Mode:</span>
                <span className="text-text-primary">Keyframe Seek Table (Fast)</span>
              </div>
            </div>

            <div className="bg-surface-02 border border-border-subtle rounded-lg p-4 space-y-2.5">
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider text-text-secondary mb-3">
                Video Compression Standards
              </h4>
              <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                <span className="text-text-tertiary">Primary Codec:</span>
                <span className="text-text-primary">{profile.codec}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                <span className="text-text-tertiary">Chroma Format:</span>
                <span className="text-text-primary">4:2:0 YUV Planar</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/50 pb-2">
                <span className="text-text-tertiary">Bit Depth:</span>
                <span className="text-text-primary">8-bit per channel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Temporal Resolution:</span>
                <span className="text-text-primary">{profile.frameRate} fps Fixed Rate</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
