import Link from 'next/link';
import { SITE_FAQS } from '@/lib/consts/faq-consts';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

type FaqSectionProps = {
  id?: string;
  className?: string;
  headingClassName?: string;
  titleAs?: 'h1' | 'h2';
};

export function FaqSection({
  id = 'faq',
  className,
  headingClassName,
  titleAs = 'h2',
}: FaqSectionProps) {
  const HeadingTag = titleAs;

  return (
    <section id={id} className={cn('scroll-mt-24', className)} aria-labelledby={`${id}-heading`}>
      <div className="mx-auto max-w-3xl text-center">
        <HeadingTag
          id={`${id}-heading`}
          className={cn(
            'text-3xl font-extrabold tracking-tight text-heading-foreground sm:text-4xl',
            headingClassName
          )}
        >
          Preguntas frecuentes
        </HeadingTag>
        <p className="mt-4 text-muted-foreground">
          Respuestas rápidas sobre archivos, materiales, plazos y precios. Si no encontrás lo
          que buscás, pedinos un presupuesto.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl divide-y divide-border rounded-xl border border-border bg-background">
        {SITE_FAQS.map((item) => (
          <details key={item.question} className="group px-4 sm:px-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-semibold text-heading-foreground outline-none marker:content-none [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <span>{item.question}</span>
              <ChevronDown
                className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="pb-4 pr-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {item.answer}
            </div>
          </details>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
        <Link
          href="/print-guide"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ver la guía de impresión
        </Link>
        <span className="hidden text-muted-foreground sm:inline" aria-hidden="true">
          ·
        </span>
        <Link
          href="/quote-request"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Solicitar presupuesto
        </Link>
      </div>
    </section>
  );
}
