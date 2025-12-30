import React from 'react';
import Link from 'next/link';
import { Section, SectionContent, SectionHeader } from "@/app/ui/print-guide/components";
import { Info, Ruler, Settings, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TolerancesPage() {
    return (
        <div className="space-y-12">
            <Section>
                <SectionHeader title="Tolerancias Dimensionables y Ajuste de Piezas" icon={<Ruler />} />
                <SectionContent className="space-y-4">
                    <p>
                        La precisión en la impresión FDM (Fused Deposition Modeling), que utilizamos en Pelambres, tiene límites. La tolerancia dimensional general que podemos garantizar en nuestras impresoras de alta calidad es de 0.2 mm o ± 0.5% (el valor que sea mayor).
                    </p>
                    
                    <h3 className="text-xl font-semibold mt-6">Ajuste de Ensambles (Fits)</h3>
                    <p>
                        Si tu proyecto requiere que dos piezas se ensamblen (por ejemplo, un eje en un orificio), es crucial dejar un espacio (gap) o tolerancia de holgura entre ellas.
                    </p>
                    
                    <ul className="list-disc list-inside ml-4 space-y-2">
                        <li>
                            **Ajuste Holgado (Loose Fit):** Recomendado para piezas que deben girar o deslizarse libremente. Sugerimos una holgura de **0.3 mm a 0.5 mm** por lado.
                        </li>
                        <li>
                            **Ajuste de Presión (Snap Fit / Tight Fit):** Para uniones firmes o que encajen a presión, sugerimos una holgura de **0.1 mm a 0.2 mm** por lado.
                        </li>
                    </ul>

                    <div className="flex flex-row bg-primary/10 p-4 border-l-4 border-primary rounded-r-md my-6">
                        <Info className="mr-3 text-primary w-5 h-5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                            **Consejo:** Si no estás seguro, diseña siempre con un ajuste ligeramente holgado. Es más fácil lijar o añadir cinta para un ajuste más apretado que eliminar material de un ajuste demasiado apretado.
                        </p>
                    </div>
                </SectionContent>
            </Section>

            <Section>
                <SectionHeader title="Acabado Superficial y Orientación de Pieza" icon={<Layers />} />
                <SectionContent className="space-y-4">
                    <p>
                        El acabado de la pieza está determinado por la altura de capa (layer height) y la orientación de la pieza en la impresora.
                    </p>
                    
                    <ul className="list-disc list-inside ml-4 space-y-2">
                        <li>
                            **Altura de Capa:** La configuración estándar es 0.2 mm. Para detalles finos o figuras, se puede usar 0.12 mm, pero esto incrementa el tiempo de impresión y el costo.
                        </li>
                        <li>
                            **Lineas de Capa:** Las líneas serán más visibles en las superficies curvas o inclinadas. Para una apariencia suave, estas superficies deben orientarse hacia el eje Z (vertical) tanto como sea posible.
                        </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6">Consideraciones de Diseño Estructural</h3>
                    <p>
                        Para garantizar la integridad estructural y minimizar la necesidad de soportes complejos:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-2">
                        <li>
                            **Voladizos (Overhangs):** Evita ángulos de voladizo superiores a 45° si no quieres usar soportes.
                        </li>
                        <li>
                            **Espesor de Pared:** Asegura que las paredes tengan un grosor mínimo de 0.8 mm a 1.2 mm para que el filamento pueda extruirse correctamente.
                        </li>
                    </ul>

                </SectionContent>
            </Section>

            <Section>
                <SectionHeader title="Opciones de Post-Procesado" icon={<Settings />} />
                <SectionContent className="space-y-4">
                    <p>
                        Ofrecemos servicios de post-procesado para mejorar el acabado de tu pieza:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-2">
                        <li>**Lijado y Relleno:** Para eliminar las líneas de capa visibles.</li>
                        <li>**Pintura y Acabado:** Pintura acrílica profesional para piezas decorativas o modelos de exhibición.</li>
                        <li>**Ensamblaje:** Si el modelo está dividido en varias piezas.</li>
                    </ul>
                    
                    <div className="mt-8">
                        <Link href="/quote-request" passHref>
                            <Button className="text-lg">
                                Solicitar Cotización con Post-Procesado
                            </Button>
                        </Link>
                    </div>
                </SectionContent>
            </Section>

        </div>
    );
}