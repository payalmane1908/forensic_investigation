import React, { useState } from 'react';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Textarea, Separator } from '../ui/primitives';
import type { CreateCasePayload } from '../../types/case';
import { generateCaseId } from '../../utils/format';

interface CreateCaseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCasePayload) => void;
  existingIds: string[];
}

interface FormState {
  title: string;
  id: string;
  description: string;
  investigator: string;
}

interface FormErrors {
  title?: string;
  id?: string;
  investigator?: string;
}

const INITIAL_STATE: FormState = {
  title: '',
  id: '',
  description: '',
  investigator: '',
};

export function CreateCaseModal({
  open,
  onClose,
  onSubmit,
  existingIds,
}: CreateCaseModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate ID when modal opens
  React.useEffect(() => {
    if (open) {
      setForm({ ...INITIAL_STATE, id: generateCaseId(existingIds) });
      setErrors({});
    }
  }, [open, existingIds]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.title.trim()) errs.title = 'Case name is required.';
    if (!form.id.trim()) errs.id = 'Case ID is required.';
    else if (existingIds.includes(form.id.trim()))
      errs.id = 'This Case ID already exists.';
    if (!form.investigator.trim())
      errs.investigator = 'Investigator name is required.';
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
    // Simulate brief processing delay for realism
    await new Promise((r) => setTimeout(r, 600));
    onSubmit({
      id: form.id.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      investigator: form.investigator.trim(),
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Investigation"
      subtitle="All fields marked with an asterisk are required."
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
            icon={<PlusCircle size={15} />}
          >
            {submitting ? 'Creating…' : 'Create Investigation'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Case name */}
        <Input
          label="Case Name *"
          id="case-title"
          placeholder="e.g. Suspicious Activity — Central Market"
          value={form.title}
          onChange={handleChange('title')}
          error={errors.title}
          autoFocus
        />

        {/* Case ID */}
        <Input
          label="Case ID *"
          id="case-id"
          placeholder="CASE-025"
          value={form.id}
          onChange={handleChange('id')}
          error={errors.id}
          mono
          hint="Auto-generated. You may edit this."
        />

        <Separator />

        {/* Investigator */}
        <Input
          label="Lead Investigator *"
          id="case-investigator"
          placeholder="e.g. Insp. R. Sharma"
          value={form.investigator}
          onChange={handleChange('investigator')}
          error={errors.investigator}
        />

        {/* Description */}
        <Textarea
          label="Description"
          id="case-description"
          placeholder="Brief description of the incident, location, and scope of investigation…"
          rows={4}
          value={form.description}
          onChange={handleChange('description')}
          hint="Optional but recommended for audit purposes."
        />

        {/* Legal notice */}
        <div className="flex gap-2.5 bg-amber-dim border border-amber/20 rounded-md px-3.5 py-3">
          <AlertCircle size={14} className="text-amber shrink-0 mt-0.5" />
          <p className="text-xs text-amber/90 leading-relaxed">
            All investigation records are subject to the IT Act, 2000 and the
            Indian Evidence Act. Ensure proper authorization before proceeding.
          </p>
        </div>
      </div>
    </Modal>
  );
}
