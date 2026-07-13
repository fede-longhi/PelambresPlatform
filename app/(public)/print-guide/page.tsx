import {
  GuideCallout,
  GuideCta,
  GuidePageHeader,
  GuideSection,
} from '@/app/(public)/print-guide/_components/section-components';
import { Boxes, Cpu, Layers } from 'lucide-react';
import Link from 'next/link';
import { PRINT_GUIDE_NAV } from '@/lib/consts/print-guide-consts';

export default function Page() {
  return (
    <div className="space-y-6">
      <GuidePageHeader
        title="Empezá por acá"
        description="Una visión clara de la impresión 3D industrial y de cómo trabajamos en Pelambres, para que sepas qué pedir y qué esperar."
      />

      <GuideSection title="Qué es la impresión 3D (para producción)" icon={<Cpu className="size-5" />}>
        <p>
          La impresión 3D abarca muchas industrias, desde construcción hasta medicina. En
          Pelambres nos enfocamos en <strong>producción y prototipado</strong> con tecnologías
          de escritorio e industriales accesibles.
        </p>
        <p>
          Frente a métodos como el moldeo por inyección, la impresión 3D no siempre gana en
          costo a gran escala, pero sí en <strong>flexibilidad</strong>, velocidad de iteración
          y menor inversión inicial. Por eso es ideal para prototipos, series cortas y
          piezas personalizadas.
        </p>
      </GuideSection>

      <GuideSection title="Tecnologías que usamos" icon={<Layers className="size-5" />}>
        <p>Las dos más comunes son:</p>
        <ul>
          <li>
            <strong>FDM</strong> (modelado por deposición fundida): deposita plástico fundido
            capa por capa. Es nuestra tecnología principal: versátil, económica y apta para
            prototipos y piezas funcionales.
          </li>
          <li>
            <strong>SLA</strong> (estereolitografía): solidifica resina líquida con luz. Suele
            dar mejor detalle superficial, pero el postprocesado es más exigente y el costo
            suele ser mayor.
          </li>
        </ul>
        <p>
          Hoy imprimimos principalmente en <strong>FDM</strong>. Si tu proyecto pide SLA, te
          asesoramos sobre viabilidad y alternativas.
        </p>
      </GuideSection>

      <GuideSection title="Materiales más usados" icon={<Boxes className="size-5" />}>
        <p>
          En FDM trabajamos con filamentos termoplásticos. Estos son los más frecuentes:
        </p>
        <ul>
          <li>
            <strong>PLA:</strong> fácil de imprimir. Ideal para prototipos y piezas
            decorativas. Baja resistencia al calor.
          </li>
          <li>
            <strong>PETG:</strong> buen equilibrio entre facilidad, resistencia mecánica y
            tolerancia térmica. Muy usado en piezas funcionales.
          </li>
          <li>
            <strong>TPU:</strong> flexible y resistente al desgaste. Más exigente de imprimir;
            ideal para fundas, juntas y piezas elásticas.
          </li>
          <li>
            <strong>ABS / ASA:</strong> más resistentes al calor que el PLA; requieren mejor
            control térmico. En muchos casos el PETG alcanza un resultado similar con menos
            complicaciones.
          </li>
          <li>
            <strong>Nylon:</strong> muy durable y con buena resistencia química. Absorbe
            humedad y es más difícil de imprimir.
          </li>
        </ul>
        <GuideCallout>
          <p>
            Los materiales más difíciles de imprimir suelen subir el costo por mayor tiempo,
            riesgo de fallos y postprocesado. Si no estás seguro, empezá por PLA o PETG y te
            orientamos según el uso.
          </p>
        </GuideCallout>
      </GuideSection>

      <GuideSection title="Seguí explorando">
        <ul className="!list-none !pl-0 space-y-2">
          {PRINT_GUIDE_NAV.filter((item) => item.href !== '/print-guide').map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-start gap-3 rounded-lg border border-transparent px-3 py-2 transition hover:border-border hover:bg-gray-50"
              >
                <item.icon
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>
                  <span className="block font-medium text-gray-900 group-hover:text-primary">
                    {item.name}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <GuideCta href="/quote-request">Solicitar presupuesto</GuideCta>
      </GuideSection>
    </div>
  );
}
