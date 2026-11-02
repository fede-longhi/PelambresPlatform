import type { Metadata } from 'next';
import MapStlPageClient from './_components/map-stl-page-client';

export const metadata: Metadata = {
  title: 'Mapa a STL | Herramientas | Pelambres 3D',
  description:
    'Seleccioná un área del mapa y exportá un STL del terreno listo para impresión 3D.',
};

export default function MapStlPage() {
  return <MapStlPageClient />;
}
