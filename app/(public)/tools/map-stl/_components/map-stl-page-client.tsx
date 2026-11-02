'use client';

import dynamic from 'next/dynamic';

const MapStlTool = dynamic(
  () =>
    import('@/components/tools/MapStlTool').then((mod) => mod.MapStlTool),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground sm:px-8">
        Cargando herramienta de mapa…
      </div>
    ),
  },
);

export default function MapStlPageClient() {
  return <MapStlTool />;
}
