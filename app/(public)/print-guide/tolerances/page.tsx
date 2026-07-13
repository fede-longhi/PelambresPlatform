import {
  GuideCallout,
  GuideCta,
  GuidePageHeader,
  GuideSection,
} from '@/app/(public)/print-guide/_components/section-components';
import { Layers, Ruler, Settings } from 'lucide-react';

export default function TolerancesPage() {
  return (
    <div className="space-y-6">
      <GuidePageHeader
        title="Tolerancias y acabados"
        description="Qué precisión esperar en FDM, cómo diseñar ensambles y qué opciones de postprocesado ofrecemos."
      />

      <GuideSection
        title="Tolerancias dimensionales"
        icon={<Ruler className="size-5" />}
      >
        <p>
          En impresión FDM la precisión tiene límites. En nuestras máquinas, la tolerancia
          general que apuntamos es de <strong>±0,2&nbsp;mm</strong> o{' '}
          <strong>±0,5&nbsp;%</strong> (el que resulte mayor).
        </p>

        <h3 className="text-base font-semibold text-gray-900">Ajuste de ensambles</h3>
        <p>
          Si dos piezas tienen que encajar (por ejemplo un eje en un orificio), dejá holgura
          entre ellas:
        </p>
        <ul>
          <li>
            <strong>Ajuste holgado:</strong> para piezas que giran o se deslizan. Holgura
            sugerida de <strong>0,3 a 0,5&nbsp;mm</strong> por lado.
          </li>
          <li>
            <strong>Ajuste a presión:</strong> para uniones firmes. Holgura sugerida de{' '}
            <strong>0,1 a 0,2&nbsp;mm</strong> por lado.
          </li>
        </ul>
        <GuideCallout>
          <p>
            Si dudás, diseñá un poco más holgado. Es más fácil ajustar después (lijar o
            agregar material) que agrandar un orificio demasiado justo.
          </p>
        </GuideCallout>
      </GuideSection>

      <GuideSection
        title="Acabado superficial y orientación"
        icon={<Layers className="size-5" />}
      >
        <p>
          El aspecto final depende de la altura de capa y de cómo orientamos la pieza en la
          impresora.
        </p>
        <ul>
          <li>
            <strong>Altura de capa:</strong> el estándar es <strong>0,2&nbsp;mm</strong>. Para
            más detalle se puede usar 0,12&nbsp;mm, con más tiempo y costo.
          </li>
          <li>
            <strong>Líneas de capa:</strong> se notan más en curvas e inclinaciones. Para un
            acabado más limpio, orientamos esas caras hacia el eje Z cuando es posible.
          </li>
        </ul>

        <h3 className="text-base font-semibold text-gray-900">Diseño estructural</h3>
        <ul>
          <li>
            <strong>Voladizos:</strong> evitá ángulos mayores a <strong>45°</strong> si querés
            reducir soportes.
          </li>
          <li>
            <strong>Espesor de pared:</strong> apuntá a un mínimo de{' '}
            <strong>0,8 a 1,2&nbsp;mm</strong> para una extrusión confiable.
          </li>
        </ul>
      </GuideSection>

      <GuideSection title="Postprocesado" icon={<Settings className="size-5" />}>
        <p>Podemos mejorar el acabado con:</p>
        <ul>
          <li>
            <strong>Lijado y relleno:</strong> para suavizar líneas de capa.
          </li>
          <li>
            <strong>Pintura:</strong> acabados acrílicos para piezas decorativas o de
            exhibición.
          </li>
          <li>
            <strong>Ensamble:</strong> si el modelo viene en varias partes.
          </li>
        </ul>
        <GuideCta href="/quote-request">Cotizar con postprocesado</GuideCta>
      </GuideSection>
    </div>
  );
}
