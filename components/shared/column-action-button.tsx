'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function ColumnActionButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'rounded-md text-left hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      {children}
    </button>
  );
}
