'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeploymentDebugPanelData } from '@/lib/utils/deployment-env';

type EnvDebugBadgeClientProps = {
  data: DeploymentDebugPanelData;
};

function DebugSection({
  title,
  fields,
  defaultOpen = true,
}: {
  title: string;
  fields: { label: string; value: string }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const sectionId = useId();

  return (
    <section className="border-b border-amber-500/20 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-amber-300 hover:bg-amber-900/40"
        aria-expanded={open}
        aria-controls={sectionId}
        onClick={() => setOpen((current) => !current)}
      >
        {title}
        <ChevronDown
          size={14}
          className={cn(
            'shrink-0 text-amber-400 transition-transform',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <dl id={sectionId} className="space-y-1.5 px-3 pb-3">
          {fields.map((field) => (
            <div key={field.label} className="grid grid-cols-[7.5rem_1fr] gap-2">
              <dt className="text-amber-500/90">{field.label}</dt>
              <dd className="break-all text-amber-50">{field.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

export function EnvDebugBadgeClient({ data }: EnvDebugBadgeClientProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={panelRef}
      className="fixed bottom-3 right-3 z-[100] flex flex-col items-end gap-2"
    >
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Debug environment panel"
          className="w-[min(100vw-1.5rem,22rem)] overflow-hidden rounded-lg border border-amber-500/40 bg-amber-950/95 font-mono text-[11px] leading-snug text-amber-100 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-2 border-b border-amber-500/30 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                Debug
              </p>
              <p className="truncate text-amber-100">{data.badgeLabel}</p>
            </div>
            <button
              type="button"
              className="rounded p-1 text-amber-200 hover:bg-amber-900/60 hover:text-white"
              aria-label="Cerrar panel de debug"
              onClick={() => setOpen(false)}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-[min(70vh,28rem)] overflow-y-auto">
            <DebugSection title="Environment" fields={data.environment} />
            <DebugSection title="Mercado Pago" fields={data.mercadoPago} />
            <DebugSection title="Database" fields={data.database} />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="max-w-[min(100vw-1.5rem,20rem)] rounded-md border border-amber-500/40 bg-amber-950/90 px-2.5 py-1.5 text-left font-mono text-[11px] leading-snug text-amber-100 shadow-lg backdrop-blur-sm hover:border-amber-400/60 hover:bg-amber-900/95"
        title="Abrir panel de debug (oculto en producción)"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="font-semibold text-amber-300">env</span>
        <span className="mx-1.5 text-amber-500/80">·</span>
        <span className="break-all">{data.badgeLabel}</span>
      </button>
    </div>
  );
}
