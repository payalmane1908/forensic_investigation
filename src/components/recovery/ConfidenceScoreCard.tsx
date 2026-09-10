import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Clock,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { RecoveryConfidence } from '../../types/recovery';

interface ConfidenceScoreCardProps {
  confidence: RecoveryConfidence;
  clipId: string;
}

export function ConfidenceScoreCard({
  confidence,
  clipId,
}: ConfidenceScoreCardProps) {
  const getVerdictBadge = () => {
    switch (confidence.verdict) {
      case 'high_confidence':
        return { label: 'High Confidence Recovery', color: 'text-green bg-green/10 border-green/30' };
      case 'repaired_jitter':
        return { label: 'Repaired PTS Jitter', color: 'text-amber bg-amber/10 border-amber/30' };
      case 'partial_fragment':
        return { label: 'Partial Keyframe Fragment', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'corrupted':
        return { label: 'Corrupted Macroblocks', color: 'text-red bg-red/10 border-red/30' };
    }
  };

  const verdict = getVerdictBadge();

  return (
    <div className="p-4 rounded-xl bg-surface-02 border border-border-subtle space-y-4 shadow-sm">
      {/* Header with Score */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <h4 className="text-xs font-semibold uppercase tracking-wider font-mono text-text-primary">
            Explainable Recovery Score ({clipId})
          </h4>
        </div>
        <span
          className={`text-3xs font-mono px-2 py-0.5 rounded border uppercase font-medium ${verdict.color}`}
        >
          {verdict.label}
        </span>
      </div>

      {/* Main Score Readout */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-surface-01 border border-border-subtle">
        <div>
          <span className="text-3xs font-mono uppercase text-text-tertiary">
            Forensic Integrity Index
          </span>
          <p className="text-xs text-text-secondary mt-0.5">
            Composite score across NAL continuity and PTS monotonic order
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-accent">
            {confidence.overallScore}%
          </span>
        </div>
      </div>

      {/* Diagnostic Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-surface-01 border border-border-subtle flex items-center justify-between">
          <span className="text-text-secondary flex items-center gap-1.5">
            <FileCode2 size={12} className="text-text-tertiary" /> Header Integrity:
          </span>
          <span className="text-green flex items-center gap-1 font-semibold text-3xs">
            <CheckCircle2 size={11} /> Valid Magic
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-01 border border-border-subtle flex items-center justify-between">
          <span className="text-text-secondary flex items-center gap-1.5">
            <Layers size={12} className="text-text-tertiary" /> SPS/PPS Profile:
          </span>
          <span className={`flex items-center gap-1 font-semibold text-3xs ${confidence.spsPpsAvailability ? 'text-green' : 'text-amber'}`}>
            {confidence.spsPpsAvailability ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
            {confidence.spsPpsAvailability ? 'Consistent' : 'Inferred SPS'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-01 border border-border-subtle flex items-center justify-between">
          <span className="text-text-secondary flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-text-tertiary" /> IDR Keyframe:
          </span>
          <span className="text-green flex items-center gap-1 font-semibold text-3xs">
            <CheckCircle2 size={11} /> Present
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-01 border border-border-subtle flex items-center justify-between">
          <span className="text-text-secondary flex items-center gap-1.5">
            <Activity size={12} className="text-text-tertiary" /> Frame Continuity:
          </span>
          <span className="text-accent font-semibold text-3xs">
            {confidence.frameContinuityPct}%
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-01 border border-border-subtle flex items-center justify-between">
          <span className="text-text-secondary flex items-center gap-1.5">
            <Clock size={12} className="text-text-tertiary" /> PTS Monotonicity:
          </span>
          <span className="text-accent font-semibold text-3xs">
            {confidence.timestampContinuityPct}%
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-surface-01 border border-border-subtle flex items-center justify-between">
          <span className="text-text-secondary flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-text-tertiary" /> Fragment Gaps:
          </span>
          <span className={`font-semibold text-3xs ${confidence.fragmentGapsCount === 0 ? 'text-green' : 'text-amber'}`}>
            {confidence.fragmentGapsCount} Gaps ({confidence.droppedFramesCount} Frames Dropped)
          </span>
        </div>
      </div>
    </div>
  );
}
