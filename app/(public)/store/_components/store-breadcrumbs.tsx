import Link from 'next/link';
import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StoreBreadcrumbItem = {
  label: string;
  href?: string;
};

type StoreBreadcrumbsProps = {
  items: StoreBreadcrumbItem[];
  className?: string;
};

export function StoreBreadcrumbs({ items, className }: StoreBreadcrumbsProps) {
  return (
    <nav aria-label="Migas de pan" className={cn('mb-6', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 && (
                <li aria-hidden="true" className="text-muted-foreground/60">
                  <ChevronRight size={14} />
                </li>
              )}
              <li
                className={cn(
                  isLast && 'font-medium text-heading-foreground',
                  !isLast && item.href && 'min-w-0'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {isLast || !item.href ? (
                  <span className="line-clamp-1">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
