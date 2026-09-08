import React from 'react';

// ─── Button ──────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-sm shadow-accent/20',
  secondary:
    'bg-surface-02 text-text-primary border border-border-subtle hover:bg-surface-03 hover:border-border-default active:scale-[0.98]',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-02 active:scale-[0.98]',
  danger:
    'bg-red/10 text-red border border-red/20 hover:bg-red/20 active:scale-[0.98]',
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium rounded-md
          transition-all duration-150 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base
          disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
          ${buttonVariantClasses[variant]}
          ${buttonSizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          iconPosition === 'left' && icon && <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!loading && iconPosition === 'right' && icon && (
          <span className="shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ─── Badge ───────────────────────────────────────────────────────────────────

type BadgeVariant = 'active' | 'processing' | 'closed' | 'critical' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  dot?: boolean;
  className?: string;
}

const badgeConfig: Record<
  BadgeVariant,
  { label: string; dotClass: string; bgClass: string; textClass: string; borderClass: string }
> = {
  active: {
    label: 'Active',
    dotClass: 'bg-green animate-pulse-soft',
    bgClass: 'bg-green-dim',
    textClass: 'text-green',
    borderClass: 'border-green/20',
  },
  processing: {
    label: 'Processing',
    dotClass: 'bg-amber',
    bgClass: 'bg-amber-dim',
    textClass: 'text-amber',
    borderClass: 'border-amber/20',
  },
  closed: {
    label: 'Closed',
    dotClass: 'bg-text-tertiary',
    bgClass: 'bg-surface-02',
    textClass: 'text-text-secondary',
    borderClass: 'border-border-subtle',
  },
  critical: {
    label: 'Critical',
    dotClass: 'bg-red animate-pulse',
    bgClass: 'bg-red-dim',
    textClass: 'text-red',
    borderClass: 'border-red/20',
  },
  neutral: {
    label: '',
    dotClass: 'bg-text-tertiary',
    bgClass: 'bg-surface-02',
    textClass: 'text-text-secondary',
    borderClass: 'border-border-subtle',
  },
};

export function Badge({ variant, label, dot = true, className = '' }: BadgeProps) {
  const cfg = badgeConfig[variant];
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5
        text-xs font-medium rounded-full border
        ${cfg.bgClass} ${cfg.textClass} ${cfg.borderClass}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />}
      <span>{label ?? cfg.label}</span>
    </span>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  mono?: boolean;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  mono = false,
  icon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-secondary uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full h-10 rounded-md border text-sm transition-colors duration-150
            bg-surface-03 border-border-subtle text-text-primary
            placeholder:text-text-tertiary
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
            ${error ? 'border-red focus:border-red focus:ring-red/20' : ''}
            ${icon ? 'pl-9' : 'px-3'}
            ${mono ? 'font-mono' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red">{error}</p>}
      {hint && !error && <p className="text-xs text-text-tertiary">{hint}</p>}
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-secondary uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full rounded-md border text-sm transition-colors duration-150 resize-none
          bg-surface-03 border-border-subtle text-text-primary
          placeholder:text-text-tertiary
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
          px-3 py-2.5
          ${error ? 'border-red' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red">{error}</p>}
      {hint && !error && <p className="text-xs text-text-tertiary">{hint}</p>}
    </div>
  );
}

// ─── Separator ───────────────────────────────────────────────────────────────

export function Separator({ className = '' }: { className?: string }) {
  return <hr className={`border-border-subtle ${className}`} />;
}

// ─── Mono label ──────────────────────────────────────────────────────────────

export function MonoLabel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-xs tracking-widest text-text-secondary uppercase ${className}`}
    >
      {children}
    </span>
  );
}
