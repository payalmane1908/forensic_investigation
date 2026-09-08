
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/primitives';

interface PlaceholderPageProps {
  module: string;
}

export function PlaceholderPage({ module }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-screen-xl mx-auto px-6">
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-surface-01 border border-border-subtle flex items-center justify-center">
          <Shield size={24} className="text-text-tertiary" />
        </div>

        {/* Text */}
        <div className="text-center max-w-sm">
          <p className="text-xs font-mono text-text-tertiary uppercase tracking-widest mb-3">
            Module Pending
          </p>
          <h1 className="text-lg font-semibold text-text-primary mb-2">{module}</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            This module is under active development and will be available in an upcoming build of FORENSIC&#x2011;X.
          </p>
        </div>

        {/* Back */}
        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={13} />}
          onClick={() => navigate('/')}
        >
          Back to Cases
        </Button>
      </div>
    </div>
  );
}
