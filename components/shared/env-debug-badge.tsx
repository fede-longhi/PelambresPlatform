import { getDeploymentDebugInfo } from '@/lib/utils/deployment-env';

/** Fixed corner badge — only renders outside real production. */
export function EnvDebugBadge() {
  const info = getDeploymentDebugInfo();
  if (!info) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-[100] max-w-[min(100vw-1.5rem,20rem)] rounded-md border border-amber-500/40 bg-amber-950/90 px-2.5 py-1.5 font-mono text-[11px] leading-snug text-amber-100 shadow-lg backdrop-blur-sm"
      title="Entorno no productivo (oculto en producción)"
      role="status"
    >
      <span className="font-semibold text-amber-300">env</span>
      <span className="mx-1.5 text-amber-500/80">·</span>
      <span className="break-all">{info.label}</span>
    </div>
  );
}
