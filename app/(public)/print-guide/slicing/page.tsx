import {
  GuideCallout,
  GuideCta,
  GuidePageHeader,
  GuideSection,
} from '@/app/(public)/print-guide/_components/section-components';
import { FileCheck, Settings, Slice } from 'lucide-react';

export default function SlicingPage() {
  return (
    <div className="space-y-6">
      <GuidePageHeader
        title="Archivos y laminado"
        description="Cómo preparar el STL, qué miramos en el laminado y qué parámetros mueven calidad y precio."
      />

      <GuideSection
        title="El archivo STL y la malla"
        icon={<FileCheck className="size-5" />}
      >
        <p>
          El formato más habitual es <strong>.STL</strong>: describe la geometría como una
          malla de triángulos. También aceptamos otros formatos según el caso (por ejemplo
          3MF u OBJ); si dudás, mandá el STL.
        </p>

        <h3 className="text-base font-semibold text-gray-900">Malla cerrada (manifold)</h3>
        <p>
          El modelo tiene que estar cerrado para que el laminador sepa qué es interior y qué
          es exterior. Una malla abierta puede generar agujeros o errores de impresión.
        </p>
        <ul>
          <li>
            <strong>Unidades:</strong> modelá en <strong>milímetros</strong>. Si el archivo
            está en pulgadas, la pieza sale ~25,4 veces más chica.
          </li>
          <li>
            <strong>Reparación:</strong> antes de exportar, usá la reparación de tu CAD o
            herramientas como Microsoft 3D Builder / Meshmixer.
          </li>
        </ul>
      </GuideSection>

      <GuideSection
        title="Qué es el laminado (slicing)"
        icon={<Slice className="size-5" />}
      >
        <p>
          El laminador convierte el modelo en instrucciones capa a capa (G-code) para la
          impresora. Ajustes típicos que afectan calidad y presupuesto:
        </p>
        <ul>
          <li>
            <strong>Altura de capa:</strong>{' '}
            <strong>0,2&nbsp;mm</strong> (estándar, buen equilibrio) ·{' '}
            <strong>0,12&nbsp;mm</strong> (más detalle, más tiempo y costo).
          </li>
          <li>
            <strong>Relleno (infill):</strong> 10–20&nbsp;% para prototipos; 50–100&nbsp;%
            cuando hay carga o necesidad de rigidez.
          </li>
          <li>
            <strong>Soportes:</strong> material temporal para voladizos. Más soportes =
            más tiempo, más postprocesado y a veces más costo.
          </li>
        </ul>
        <GuideCallout>
          <p>
            Si no indicás relleno ni altura de capa, usamos el perfil estándar:{' '}
            <strong>20&nbsp;% de relleno</strong> y <strong>0,2&nbsp;mm</strong> de altura,
            pensando en buena relación calidad–precio.
          </p>
        </GuideCallout>
      </GuideSection>

      <GuideSection title="Archivos G-code" icon={<Settings className="size-5" />}>
        <p>
          Si mandás un <strong>.gcode</strong> ya laminado, igual revisamos los parámetros
          con vos. Trabajamos con perfiles propios, optimizados para calidad y para el
          cuidado de nuestras máquinas.
        </p>
        <GuideCta href="/quote-request">Subir archivos y cotizar</GuideCta>
      </GuideSection>
    </div>
  );
}
