'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CopyFieldProps = {
  label: string;
  value: string;
};

export function StoreTransferCopyField({ label, value }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <Check size={14} className="mr-1" aria-hidden="true" />
            Copiado
          </>
        ) : (
          <>
            <Copy size={14} className="mr-1" aria-hidden="true" />
            Copiar
          </>
        )}
      </Button>
    </div>
  );
}
