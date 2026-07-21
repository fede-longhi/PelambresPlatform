import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FeatureFlagListItem } from '@/types/feature-flag-definitions';

type FeatureFlagsListProps = {
  features: FeatureFlagListItem[];
};

function statusLabel(feature: FeatureFlagListItem) {
  if (feature.isEnabled) {
    return { label: 'Pública', variant: 'default' as const };
  }
  if (feature.allowlistCount > 0) {
    return {
      label: `Restringida (${feature.allowlistCount})`,
      variant: 'secondary' as const,
    };
  }
  return { label: 'Oculta', variant: 'outline' as const };
}

export function FeatureFlagsList({ features }: FeatureFlagsListProps) {
  if (features.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay features registradas.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {features.map((feature) => {
        const status = statusLabel(feature);
        return (
          <li
            key={feature.key}
            className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{feature.label}</h2>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              {feature.description ? (
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">Clave: {feature.key}</p>
            </div>
            <Link
              href={`/admin/features/${feature.key}`}
              className={cn(buttonVariants({ variant: 'outline' }), 'shrink-0')}
            >
              Configurar
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
