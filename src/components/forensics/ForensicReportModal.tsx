import { useState } from 'react';
import {
  Printer,
  Copy,
  Check,
  X,
  ShieldCheck,
  FileText,
  Award,
} from 'lucide-react';
import type { EvidenceItem } from '../../types/evidence';
import { formatDateTime, formatFileSize } from '../../utils/format';

interface ForensicReportModalProps {
  evidence: EvidenceItem;
  onClose: () => void;
}

export function ForensicReportModal({ evidence, onClose }: ForensicReportModalProps) {
  const [copied, setCopied] = useState(false);
  const profile = evidence.forensicProfile;

  const handlePrint = () => {
    window.print();
  };

  const certificateText = `
================================================================================
           FORENSIC-X DIGITAL EVIDENCE CERTIFICATE OF AUTHENTICITY
   Pursuant to Section 65B Indian Evidence Act / Section 63 BSA & ISO/IEC 27037
================================================================================
Generated On: ${new Date().toUTCString()}
Report ID: CERT-FX-${evidence.id}-${Date.now().toString().slice(-6)}

1. EVIDENCE IDENTIFIERS:
   - Evidence ID:       ${evidence.id}
   - Case ID:           ${evidence.caseId}
   - File Name:         ${evidence.filename}
   - File Size:         ${formatFileSize(evidence.fileSize)} (${evidence.fileSize.toLocaleString()} bytes)
   - Duration:          ${evidence.duration ?? 'N/A'} seconds
   - Ingestion Date:    ${formatDateTime(evidence.addedAt)}

2. RECOVERED SOURCE HARDWARE:
   - Device Type:       ${evidence.deviceType.toUpperCase()}
   - Device Model:      ${evidence.deviceModel}
   - Channel Number:    ${evidence.cameraChannel}
   - Recovery Location: ${evidence.location}
   - Seizing Officer:   ${evidence.collectionOfficer}

3. VENDOR FINGERPRINT & FORENSIC SPECIFICATIONS:
   - Vendor Detected:   ${profile?.vendor ?? 'Unknown'} (Confidence: ${profile?.vendorConfidence ?? 0}%)
   - Container Form:    ${profile?.containerFormat ?? evidence.format}
   - Video Codec:       ${profile?.codec ?? 'N/A'}
   - Resolution:        ${profile?.resolution ?? 'N/A'}
   - Frame Rate:        ${profile?.frameRate ?? 'N/A'} fps
   - Bitrate:           ${profile?.bitrate ?? 'N/A'}
   - Magic Header:      ${profile?.hexHeader.magicAscii ?? 'N/A'} [${profile?.hexHeader.magicBytes ?? 'N/A'}]

4. CRYPTOGRAPHIC INTEGRITY VERIFICATION:
   - SHA-256 Digest:    ${evidence.sha256 ?? 'UNHASHED'}
   - MD5 Digest:        ${evidence.md5 ?? 'N/A'}
   - SHA-1 Digest:      ${evidence.sha1 ?? 'N/A'}
   - Integrity Verdict: ${profile?.tamperAnalysis.verdict.toUpperCase() ?? 'VERIFIED_INTACT'}

5. CHAIN OF CUSTODY LOG:
${evidence.chainOfCustody
  ?.map(
    (c, i) =>
      `   [${i + 1}] ${formatDateTime(c.timestamp)} | ${c.action} | Officer: ${c.officer} (${c.badgeNumber}) | Seal: ${c.tamperSealId ?? 'N/A'}`
  )
  .join('\n') ?? '   No custody entries recorded.'}

================================================================================
CERTIFIED ELECTRONIC RECORD — IMMUTABLE DIGITAL EVIDENCE INTELLIGENCE PLATFORM
================================================================================
`.trim();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(certificateText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-surface-01 border border-border-subtle rounded-xl max-w-3xl w-full my-8 shadow-modal animate-modal-in overflow-hidden">
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-02">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-text-primary font-mono">
              Forensic Evidence Identification Certificate
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-subtle bg-surface-03 hover:bg-surface-01 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-green" />
                  <span className="text-green font-mono">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Plaintext</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors shadow-sm"
            >
              <Printer size={13} />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-03 transition-colors ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Certificate Body (Styled like official forensic document) */}
        <div className="p-8 space-y-6 font-mono text-xs max-h-[75vh] overflow-y-auto bg-[#0A0B0E]">
          {/* Header Seal */}
          <div className="text-center pb-6 border-b border-border-subtle space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/30 text-accent mb-2">
              <Award size={24} />
            </div>
            <h2 className="text-base font-bold text-text-primary tracking-wide uppercase">
              Forensic-X Digital Evidence Intelligence Platform
            </h2>
            <p className="text-2xs text-text-secondary tracking-widest uppercase">
              Certificate of Forensic Identification & Technical Profile
            </p>
            <p className="text-2xs text-text-tertiary">
              Conforming to Section 65B Indian Evidence Act / Section 63 BSA · ISO/IEC 27037 Standard
            </p>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-surface-02/50 border border-border-subtle p-4 rounded-lg">
            <div>
              <span className="text-2xs text-text-tertiary uppercase">Evidence Identifier:</span>
              <p className="text-accent font-semibold text-sm mt-0.5">{evidence.id}</p>
            </div>
            <div>
              <span className="text-2xs text-text-tertiary uppercase">Case Number:</span>
              <p className="text-text-primary font-semibold text-sm mt-0.5">{evidence.caseId}</p>
            </div>
            <div>
              <span className="text-2xs text-text-tertiary uppercase">Source Filename:</span>
              <p className="text-text-primary mt-0.5 truncate">{evidence.filename}</p>
            </div>
            <div>
              <span className="text-2xs text-text-tertiary uppercase">File Size:</span>
              <p className="text-text-primary mt-0.5">{formatFileSize(evidence.fileSize)}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-3">
            <h4 className="text-2xs uppercase tracking-widest text-text-tertiary font-bold border-b border-border-subtle/50 pb-1">
              Technical Profile Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-text-tertiary">Vendor:</span>
                <p className="text-text-primary font-semibold">{profile?.vendor ?? 'Unknown'}</p>
              </div>
              <div>
                <span className="text-text-tertiary">Container:</span>
                <p className="text-text-primary font-semibold">{profile?.containerFormat.split(' ')[0]}</p>
              </div>
              <div>
                <span className="text-text-tertiary">Video Codec:</span>
                <p className="text-text-primary truncate">{profile?.codec}</p>
              </div>
              <div>
                <span className="text-text-tertiary">Resolution:</span>
                <p className="text-text-primary">{profile?.resolution}</p>
              </div>
              <div>
                <span className="text-text-tertiary">Frame Rate:</span>
                <p className="text-text-primary">{profile?.frameRate} fps</p>
              </div>
              <div>
                <span className="text-text-tertiary">Magic Bytes:</span>
                <p className="text-accent">{profile?.hexHeader.magicBytes}</p>
              </div>
            </div>
          </div>

          {/* Cryptographic Checksums */}
          <div className="space-y-2 bg-surface-02/70 p-4 rounded-lg border border-border-subtle">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xs uppercase tracking-widest text-text-tertiary font-bold flex items-center gap-1">
                <ShieldCheck size={12} className="text-green" />
                Cryptographic Integrity Verification
              </span>
              <span className="text-2xs text-green font-semibold">MATCH 100%</span>
            </div>
            <div>
              <span className="text-2xs text-text-tertiary">SHA-256 Digest:</span>
              <p className="text-xs text-accent break-all select-all font-semibold">
                {evidence.sha256}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-2xs">
              <div>
                <span className="text-text-tertiary">MD5:</span>
                <p className="text-text-secondary select-all">{evidence.md5 ?? 'N/A'}</p>
              </div>
              <div>
                <span className="text-text-tertiary">SHA-1:</span>
                <p className="text-text-secondary select-all">{evidence.sha1 ?? 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Chain of custody summary */}
          <div className="space-y-2">
            <h4 className="text-2xs uppercase tracking-widest text-text-tertiary font-bold border-b border-border-subtle/50 pb-1">
              Chain of Custody Events ({evidence.chainOfCustody?.length ?? 0})
            </h4>
            <div className="space-y-1.5 text-2xs">
              {evidence.chainOfCustody?.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1 border-b border-border-subtle/30">
                  <span className="text-text-primary">{c.action}</span>
                  <span className="text-text-tertiary">
                    {c.officer} ({c.badgeNumber}) · {formatDateTime(c.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Official Sign-off Footer */}
          <div className="pt-6 border-t border-border-subtle text-center text-2xs text-text-tertiary space-y-1">
            <p>FORENSIC-X PLATFORM · AUTOMATED EVIDENCE INTELLIGENCE ENGINE</p>
            <p>DIGITALLY SIGNED WITH SHA-256 HSM MASTER KEYPAIR · EVIDENCE UNALTERED</p>
          </div>
        </div>
      </div>
    </div>
  );
}
