import {
  GuideCallout,
  GuideCta,
  GuideExternalLink,
  GuidePageHeader,
  GuideSection,
} from '@/app/(public)/print-guide/_components/section-components';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calculator, Link2, PackageSearch, Rocket } from 'lucide-react';

const filamentos = [
  {
    nombre: 'PLA',
    propiedades: 'Fácil de imprimir, rígido, baja resistencia al calor',
    costo: 'Bajo',
    usos: 'Prototipos, decoración, piezas no estructurales',
  },
  {
    nombre: 'PETG',
    propiedades: 'Buena resistencia mecánica y química, mejor al calor que el PLA',
    costo: 'Bajo',
    usos: 'Piezas funcionales, uso liviano en exterior',
  },
  {
    nombre: 'TPU',
    propiedades: 'Flexible, elástico, resistente al desgaste',
    costo: 'Moderado',
    usos: 'Fundas, juntas, ruedas, piezas con elasticidad',
  },
  {
    nombre: 'PLA Flex',
    propiedades: 'Más flexible que el PLA estándar, relativamente fácil de imprimir',
    costo: 'Bajo / moderado',
    usos: 'Decoración con algo de flexión, juguetes, prototipos móviles',
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <GuidePageHeader
        title="Guía rápida"
        description="Todo lo esencial para empezar: cómo encargar una pieza, dónde buscar modelos, qué material elegir y cómo se arma el precio."
      />

      <GuideSection title="¿Cómo empezar?" icon={<Rocket className="size-5" />}>
        <p>
          Para imprimir, escribinos o pedí un presupuesto: mandanos el archivo o contanos qué
          necesitás y te asesoramos.
        </p>
        <p>
          El modelo lo podés diseñar vos, buscarlo en repositorios de la comunidad o pedirnos el
          diseño.
        </p>
        <p>
          Según tamaño y complejidad, la entrega suele estar en{' '}
          <strong>menos de 5 días hábiles</strong>. Si ya tenés el modelo y la pieza es chica,
          a veces llega el mismo día.
        </p>
        <GuideCta href="/quote-request">Pedir presupuesto</GuideCta>
      </GuideSection>

      <GuideSection title="Dónde buscar modelos" icon={<Link2 className="size-5" />}>
        <p>Sitios útiles de la comunidad (gratis y/o pagos):</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <GuideExternalLink
            name="MakerWorld"
            description="Catálogo de Bambu Lab"
            href="https://www.makerworld.com/"
            domain="makerworld.com"
          />
          <GuideExternalLink
            name="Thingiverse"
            description="Modelos mayormente gratuitos"
            href="https://www.thingiverse.com/"
            domain="thingiverse.com"
          />
          <GuideExternalLink
            name="Printables"
            description="Catálogo de Prusa"
            href="https://www.printables.com/"
            domain="printables.com"
          />
          <GuideExternalLink
            name="Cults 3D"
            description="Gratuitos y pagos"
            href="https://cults3d.com/"
            domain="cults3d.com"
          />
          <GuideExternalLink
            name="Thangs"
            description="Busca en varios sitios a la vez"
            href="https://thangs.com/"
            domain="thangs.com"
          />
          <GuideExternalLink
            name="MyMiniFactory"
            description="Gratuitos y pagos"
            href="https://www.myminifactory.com/"
            domain="myminifactory.com"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Pronto vamos a sumar un catálogo propio de Pelambres.
        </p>
      </GuideSection>

      <GuideSection title="Qué filamento elegir" icon={<PackageSearch className="size-5" />}>
        <p>Hay muchos materiales; estos son los más pedidos:</p>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableCaption>Filamentos más usados en Pelambres.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Filamento</TableHead>
                <TableHead>Propiedades</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Usos típicos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filamentos.map((filamento) => (
                <TableRow key={filamento.nombre}>
                  <TableCell className="font-medium">{filamento.nombre}</TableCell>
                  <TableCell>{filamento.propiedades}</TableCell>
                  <TableCell>{filamento.costo}</TableCell>
                  <TableCell>{filamento.usos}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p>
          Trabajamos con filamentos de buena calidad. Proveedores frecuentes:
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <GuideExternalLink
            href="https://printalot.com.ar/categoria-producto/filamentos/"
            name="Printalot"
            domain="printalot.com.ar"
          />
          <GuideExternalLink
            href="https://grilon3.com.ar/productos/"
            name="Grilon3"
            domain="grilon3.com.ar"
          />
        </div>
        <p>
          Si necesitás un material puntual, consultanos: el mercado cambia rápido y podemos
          conseguir opciones específicas.
        </p>
      </GuideSection>

      <GuideSection title="Cómo se calcula el valor" icon={<Calculator className="size-5" />}>
        <h3 className="text-base font-semibold text-gray-900">Costo de impresión</h3>
        <p>Depende sobre todo de:</p>
        <ul>
          <li>
            <strong>Tiempo de impresión:</strong> tamaño y complejidad del modelo.
          </li>
          <li>
            <strong>Material:</strong> cantidad de filamento y tipo (PLA, PETG, TPU, etc.).
          </li>
        </ul>
        <GuideCallout>
          <p>
            Una pieza más grande no siempre sale más cara: una chica pero densa o con muchos
            soportes puede consumir más tiempo y material.
          </p>
        </GuideCallout>

        <h3 className="pt-2 text-base font-semibold text-gray-900">Costo total del proyecto</h3>
        <p>Al presupuesto de impresión se pueden sumar:</p>
        <ul>
          <li>
            <strong>Diseño:</strong> crear o adaptar el modelo.
          </li>
          <li>
            <strong>Impresión 3D:</strong> tiempo + material.
          </li>
          <li>
            <strong>Postprocesado:</strong> limpieza de soportes, lijado, pintura, ensamble u
            otros acabados.
          </li>
        </ul>
        <GuideCta href="/quote-request">Cotizar mi proyecto</GuideCta>
      </GuideSection>
    </div>
  );
}
