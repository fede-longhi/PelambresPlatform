import Link from 'next/link';

type ToolChromeProps = {
  eyebrow: string;
  title: string;
  lead: string;
  children: React.ReactNode;
  wide?: boolean;
};

export function ToolChrome({
  eyebrow,
  title,
  lead,
  children,
  wide = false,
}: ToolChromeProps) {
  return (
    <section className="w-full border-b border-border">
      <div
        className={`mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-8 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`}
      >
        <Link
          href="/tools"
          className="text-sm font-semibold text-primary transition hover:text-primary/80"
        >
          ← Volver a herramientas
        </Link>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {lead}
        </p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
