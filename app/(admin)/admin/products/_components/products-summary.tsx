import { Eye, EyeOff, Package, PenTool, Star } from 'lucide-react';
import type { StoreProductAdminStats } from '@/lib/data/store-product-data';

type ProductsSummaryProps = {
  stats: StoreProductAdminStats;
};

const SUMMARY_ITEMS = [
  {
    key: 'total',
    label: 'Total',
    icon: null,
  },
  {
    key: 'published',
    label: 'Publicados',
    icon: Eye,
  },
  {
    key: 'drafts',
    label: 'Borradores',
    icon: EyeOff,
  },
  {
    key: 'featured',
    label: 'Destacados',
    icon: Star,
  },
  {
    key: 'products',
    label: 'Productos',
    icon: Package,
  },
  {
    key: 'designs',
    label: 'Diseños',
    icon: PenTool,
  },
] as const;

export function ProductsSummary({ stats }: ProductsSummaryProps) {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {SUMMARY_ITEMS.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key];

        return (
          <li
            key={item.key}
            className="rounded-lg border border-border bg-card px-4 py-3"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {Icon ? <Icon size={14} aria-hidden="true" /> : null}
              <span>{item.label}</span>
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
              {value}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
