import { Search } from 'lucide-react';
import { InvestigationWorkspace } from '../components/investigation/InvestigationWorkspace';

export function InvestigatePage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 pb-24">
      {/* ── Page Header ── */}
      <div className="pt-8 pb-6 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Search size={16} className="text-accent" />
            <span className="text-2xs font-mono uppercase tracking-widest text-text-tertiary">
              Forensic Intelligence Hub
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight font-mono">
            Investigation & Target Search
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Neural target classification, cross-camera suspect re-identification (Re-ID), and multi-channel timeline correlation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-01 border border-border-subtle text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="text-text-secondary">AI Neural Index: Active</span>
          </div>
        </div>
      </div>

      {/* ── Investigation Workspace ── */}
      <InvestigationWorkspace initialCaseId="all" isCaseScoped={false} />
    </div>
  );
}
