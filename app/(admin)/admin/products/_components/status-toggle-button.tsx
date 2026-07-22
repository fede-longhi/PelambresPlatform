'use client';

import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';

type StatusToggleButtonProps = {
  pressed: boolean;
  onPressedChange: (next: boolean) => void;
  label: string;
  description?: string;
  iconOn: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
  iconOff: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
  activeClassName: string;
  disabled?: boolean;
};

export function StatusToggleButton({
  pressed,
  onPressedChange,
  label,
  description,
  iconOn: IconOn,
  iconOff: IconOff,
  activeClassName,
  disabled,
}: StatusToggleButtonProps) {
  const Icon = pressed ? IconOn : IconOff;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      disabled={disabled}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:opacity-50',
        pressed
          ? activeClassName
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
      )}
    >
      <span
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-full border',
          pressed ? 'border-current/20 bg-white/70' : 'border-slate-200 bg-slate-50'
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
        ) : null}
      </span>
    </button>
  );
}
