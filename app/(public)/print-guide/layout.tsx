import SideNav from '@/app/(public)/print-guide/_components/side-nav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="mb-8 max-w-3xl md:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Recursos
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
            Guía de impresión 3D
          </p>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Prepará mejor tu proyecto antes de cotizar: materiales, tolerancias, archivos y
            costos.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="w-full lg:w-56 lg:shrink-0">
            <SideNav />
          </div>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
