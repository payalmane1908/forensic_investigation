import React, { useState } from 'react';
import { Crosshair } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Textarea, Separator } from '../ui/primitives';
import type { CreateInvestigationPayload } from '../../types/investigation';

interface CreateInvestigationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateInvestigationPayload) => void;
  caseId: string;
  defaultAnalyst?: string;
}

interface FormState {
  title: string;
  objective: string;
  leadAnalyst: string;
}

interface FormErrors {
  title?: string;
  objective?: string;
  leadAnalyst?: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  objective: '',
  leadAnalyst: '',
};

export function CreateInvestigationModal({
  open,
  onClose,
  onSubmit,
  caseId,
  defaultAnalyst = '',
}: CreateInvestigationModalProps) {
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, leadAnalyst: defaultAnalyst });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, leadAnalyst: defaultAnalyst });
      setErrors({});
    }
  }, [open, defaultAnalyst]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.title.trim())      errs.title = 'Investigation title is required.';
    if (!form.objective.trim())  errs.objective = 'Objective is required.';
    if (!form.leadAnalyst.trim()) errs.leadAnalyst = 'Lead analyst is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    onSubmit({
      caseId,
      title: form.title.trim(),
      objective: form.objective.trim(),
      leadAnalyst: form.leadAnalyst.trim(),
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Investigation"
      subtitle={`New investigation for case ${caseId}`}
      width="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            icon={<Crosshair size={15} />}
          >
            {submitting ? 'Creating…' : 'Create Investigation'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Title */}
        <Input
          label="Investigation Title *"
          id="inv-title"
          placeholder="e.g. Primary Suspect — Red Jacket"
          value={form.title}
          onChange={handleChange('title')}
          error={errors.title}
          autoFocus
        />

        <Separator />

        {/* Objective */}
        <Textarea
          label="Objective *"
          id="inv-objective"
          placeholder="Describe what this investigation is attempting to establish — targets, timeframes, cameras, re-ID goals…"
          rows={4}
          value={form.objective}
          onChange={handleChange('objective')}
          error={errors.objective}
        />

        {/* Lead Analyst */}
        <Input
          label="Lead Analyst *"
          id="inv-analyst"
          placeholder="e.g. Insp. R. Sharma"
          value={form.leadAnalyst}
          onChange={handleChange('leadAnalyst')}
          error={errors.leadAnalyst}
          hint="Pre-filled from case lead investigator."
        />

        {/* Informational note */}
        <div className="rounded-md border border-border-subtle bg-surface-02 px-3.5 py-3">
          <p className="text-xs text-text-tertiary leading-relaxed">
            Evidence is automatically scoped to the parent case. Specific detection
            events can be pinned to this investigation after it is created.
          </p>
        </div>
      </div>
    </Modal>
  );
}
