import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BookOpen, ExternalLink, Info } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';

export function GuidePageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8 space-y-2 md:mb-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function GuideSection({
  title,
  icon,
  children,
  className,
}: {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-white p-5 shadow-sm sm:p-6',
        className
      )}
    >
      {title ? (
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-0.5 text-primary" aria-hidden="true">
            {icon ?? <BookOpen className="size-5" />}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            {title}
          </h2>
        </div>
      ) : null}
      <div className="space-y-3 text-base leading-relaxed text-gray-700 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5">
        {children}
      </div>
    </section>
  );
}

export function GuideCallout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-gray-700',
        className
      )}
      role="note"
    >
      <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0 space-y-1">{children}</div>
    </div>
  );
}

export function GuideExternalLink({
  href,
  name,
  description,
  domain,
}: {
  href: string;
  name: string;
  description?: string;
  domain: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <Image
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
        alt=""
        width={16}
        height={16}
        className="size-4 shrink-0"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-gray-900">{name}</span>
        {description ? (
          <span className="block text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">(se abre en una pestaña nueva)</span>
    </a>
  );
}

export function GuideCta({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <div className="pt-2">
      <Link
        href={href}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        {children}
      </Link>
    </div>
  );
}

/** @deprecated Prefer GuideSection */
export function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="text-primary" aria-hidden="true">
        {icon ?? <BookOpen className="size-5" />}
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
    </div>
  );
}

/** @deprecated Prefer GuidePageHeader */
export function Header({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        'mb-8 text-center text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl',
        className
      )}
    >
      {title}
    </h1>
  );
}

/** @deprecated Prefer GuideSection */
export function Section({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl border bg-white p-5 sm:p-6', className)} {...props} />
  );
}

/** @deprecated Prefer children of GuideSection */
export function SectionContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-3', className)} {...props} />;
}

/** @deprecated Prefer GuideExternalLink */
export function ExternalLinkButton(props: {
  href: string;
  name: string;
  description?: string;
  domain: string;
}) {
  return <GuideExternalLink {...props} />;
}
