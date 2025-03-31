import { lusitana } from "@/app/ui/fonts";
import { Info, TipsAndUpdates } from "@mui/icons-material";

export default function Page() {
    return (
        <div className="mb-96">
            <h1 className={`${lusitana.className} text-center font-medium text-[44px]`}>Guía de Impresión 3d</h1>
            <p>
            Bienvenido a nuestra guía de impresión 3D. Si es tu primera vez solicitando una impresión o quieres optimizar tus diseños, aquí encontrarás toda la información necesaria para obtener los mejores resultados.
            </p>
            <br />
            <p className="font-medium text-[18px] mb-2">
            En esta guía aprenderás:
            </p>

            <ul>
                <li>
                ✅ Cómo preparar tu archivo 3D para evitar errores de impresión.
                </li>
                <li>
                ✅ Qué materiales elegir según la resistencia y el acabado que necesites.
                </li>
                <li>
                ✅ Factores que influyen en el precio y tiempo de producción.
                </li>
                <li>
                ✅ Cómo solicitar una cotización y realizar un pedido en nuestro sitio.
                </li>
            </ul>
            <br />
            <p>
            <TipsAndUpdates className="mr-2 text-primary" /><b>Consejo:</b> Una buena preparación del archivo y la elección correcta del material pueden hacer una gran diferencia en el resultado final. ¡Sigue leyendo para descubrir cómo lograrlo!
            </p>
            
            <div className="mt-12 bg-slate-200 pb-4">
                <h2 className={`${lusitana.className} font-medium text-[32px] bg-primary text-primary-foreground p-2 px-8 mb-2`}>Introducción a la Impresión 3d</h2>
                <div className="md:m-4">
                    <p>La impresión 3d involucra muchas tecnologías y areas, desde la construcción hasta el uso en medicina. Sin embargo nos vamos a centrar en lo que es la producción industrial.</p>
                    <p>En este sentido la impresión 3d introduce una alternativa a los métodos tradicionales como el moldeo por inyección. A pesar de que a gran escala es más rapido y barato, la impresión 3d ofrece mayor versatilidad y menor inversión inicial para la producción. Esto lo hace perfecta para el desarrollo de prototipos y producciones en pequeña y mediana escala.</p>
                    <div>
                        <h3 className="font-medium text-[24px] mt-4">Tecnologías</h3>
                        <p>Hay diferentes tecnologías para la impresión 3d siendo FDM y SLA las más comunes.</p>
                        <ul className="list-none md:list-disc m-4">
                            <li><b>FDM</b> (moldeado por deposición fundida): consiste en ir depositando material fundido (plástico en nuestro caso) en diferentes capas.</li> 
                            <li><b>SLA</b> (estereolitografía ): utiliza resinas líquidas que se solidifcan al ser expuestas a la luz. Esta téncnica es un poco más costosa y requiere un proceso más complejo de postprocesado, pero suele ser más rápida y tener mejores terminaciones.</li> 
                        </ul>
                        <p>Nosotros actualmente utilizamos principalmente FDM, pero ofrecemos asesoramiento en SLA.</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-[24px] mt-4">Materiales</h3>
                        <div>
                            <p>Para la impresión FDM utilizamos bobinas de filamento de distintos materiales termoplásticos (materiales que se deforman a altas temperaturas).</p>
                            Estos son los más comunes:
                            <ul className="list-none md:list-disc m-4">
                                <li><b>PLA</b>: utilizado principalmente para prototipos y piezas decorativas. Fácil de imprimir. Baja tolerancia al calor. Rígido, poca resistencia mecánica.</li> 
                                <li><b>PET-G</b>: un poco más complicado de imprimir que el PLA pero sigue siendo fácil de imprimir. Tiene mejor tolerancia al calor y mejor resistencia mecánica.</li> 
                                <li><b>TPU</b>: flexible. Complejo para imprimir. Fuerte y resistente al calor.</li> 
                                <li><b>ABS</b>: características similares al PET-G, suele ser un poco más complicado para imprimir por eso se suele utilizar el PET-G antes que el ABS.</li> 
                                <li><b>NYLON</b>: extremadamente duradero y notable resistencia química. Difícil de imprimir.</li> 
                            </ul>

                            <p><Info className="mr-2 text-primary" />Para tener en cuenta, los materiales que suelen ser más difíciles de imprimir tienden a incrementar el costo de la impresión por su mayor tasa de fallos. Además el suele perder algo de calidad en el acabado final.</p>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}