import { lusitana } from "@/app/ui/fonts";
import { Header, Section, SectionContent, SectionHeader } from "@/app/ui/print-guide/components";
import { Info, TipsAndUpdates } from "@mui/icons-material";

export default function Page() {
    return (
        <div>
            <Header title="Introducción a la Impresión 3d" />
            <div className="space-y-12">
                <Section>
                    <SectionContent>
                        <p>La impresión 3d involucra muchas tecnologías y areas, desde la construcción hasta el uso en medicina. Sin embargo nos vamos a centrar en lo que es la producción industrial.</p>
                        <p>En este sentido la impresión 3d introduce una alternativa a los métodos tradicionales como el moldeo por inyección. A pesar de que a gran escala es más rapido y barato, la impresión 3d ofrece mayor versatilidad y menor inversión inicial para la producción. Esto lo hace perfecta para el desarrollo de prototipos y producciones en pequeña y mediana escala.</p>
                    </SectionContent>
                </Section>

                <Section>
                    <SectionHeader title="Tecnologías" />
                    <SectionContent>
                            <p>Hay diferentes tecnologías para la impresión 3d siendo FDM y SLA las más comunes.</p>
                            <ul className="list-none md:list-disc m-4">
                                <li><b>FDM</b> (moldeado por deposición fundida): consiste en ir depositando material fundido (plástico en nuestro caso) en diferentes capas.</li> 
                                <li><b>SLA</b> (estereolitografía ): utiliza resinas líquidas que se solidifcan al ser expuestas a la luz. Esta téncnica es un poco más costosa y requiere un proceso más complejo de postprocesado, pero suele ser más rápida y tener mejores terminaciones.</li> 
                            </ul>
                            <p>Nosotros actualmente utilizamos principalmente FDM, pero ofrecemos asesoramiento en SLA.</p>
                    </SectionContent>
                </Section>

                <Section>
                    <SectionHeader title="Materiales" />
                    <SectionContent>
                        <p>Para la impresión FDM utilizamos bobinas de filamento de distintos materiales termoplásticos (materiales que se deforman a altas temperaturas).</p>
                        Estos son los más comunes:
                        <ul className="list-none md:list-disc m-4">
                            <li><b>PLA</b>: utilizado principalmente para prototipos y piezas decorativas. Fácil de imprimir. Baja tolerancia al calor. Rígido, poca resistencia mecánica.</li> 
                            <li><b>PET-G</b>: un poco más complicado de imprimir que el PLA pero sigue siendo fácil de imprimir. Tiene mejor tolerancia al calor y mejor resistencia mecánica.</li> 
                            <li><b>TPU</b>: flexible. Complejo para imprimir. Fuerte y resistente al calor.</li> 
                            <li><b>ABS</b>: características similares al PET-G, suele ser un poco más complicado para imprimir por eso se suele utilizar el PET-G antes que el ABS.</li> 
                            <li><b>NYLON</b>: extremadamente duradero y notable resistencia química. Difícil de imprimir.</li> 
                        </ul>
                        <div className="flex flex-row bg-secondary/50 p-4">
                            <Info className="mr-2 text-primary"/>
                            Para tener en cuenta, los materiales que suelen ser más difíciles de imprimir tienden a incrementar el costo de la impresión por su mayor tasa de fallos. Además el suele perder algo de calidad en el acabado final.
                        </div>
                    </SectionContent>
                </Section>
            </div>
        </div>
    )
}