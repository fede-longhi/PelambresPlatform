import React from 'react';
import Link from 'next/link';
import { Section, SectionContent, SectionHeader } from "@/app/ui/print-guide/components";
import { Slice, Settings, FileCheck, Info } from 'lucide-react'; 
import { Button } from '@/components/ui/button';

export default function SlicingPage() {
    return (
        <div className="space-y-12">
            <Section>
                <SectionHeader title="El Archivo STL y la Integridad del Modelo" icon={<FileCheck />} />
                <SectionContent className="space-y-4">
                    <p>
                        El archivo más común que utilizamos para la impresión es el <span className="font-semibold">.STL</span> (Standard Tessellation Language). Este formato define la geometría de tu modelo como una malla de triángulos.
                    </p>
                    
                    <h3 className="text-xl font-semibold mt-6">Verificación de la Malla (Manifold)</h3>
                    <p>
                        Es crucial que tu modelo sea &quot;manifold&quot; (cerrado) para que el software laminador (slicer) sepa exactamente dónde está el interior y el exterior de la pieza. Una malla no manifold puede causar errores o agujeros en la impresión final.
                    </p>
                    
                    <ul className="list-disc list-inside ml-4 space-y-2">
                        <li>
                            **Escala:** Siempre modela en <span className="font-bold">milímetros (mm)</span>. Si tu archivo está en pulgadas, la impresora lo reducirá en 25.4 veces.
                        </li>
                        <li>
                            **Reparación:** Utiliza herramientas gratuitas como MeshMixer o la función de reparación de modelos de tu software CAD antes de exportar el STL final.
                        </li>
                    </ul>
                </SectionContent>
            </Section>
            

            {/* Sección 2: Fundamentos del Laminado (Slicing) */}
            <Section>
                <SectionHeader title="Conceptos Clave del Laminado (Slicing)" icon={<Slice />} />
                <SectionContent className="space-y-4">
                    <p>
                        El laminado es el proceso donde el software (como Cura o PrusaSlicer) toma tu archivo STL y lo convierte en instrucciones (código G) para la impresora, definiendo capa por capa cómo se debe mover el extrusor. 
                    </p>
                    
                    <h3 className="text-xl font-semibold mt-6">Ajustes que Afectan el Presupuesto y la Calidad</h3>
                    <ul className="list-disc list-inside ml-4 space-y-2">
                        <li>
                            **Altura de Capa (Layer Height):** Determina la calidad del detalle y la suavidad de las curvas.
                            <p className="text-sm text-muted-foreground ml-4">
                                <span className="font-bold">0.2 mm</span> (Estándar, rápido y balanceado). <span className="font-bold">0.12 mm</span> (Alta calidad, más lento y costoso).
                            </p>
                        </li>
                        <li>
                            **Relleno (Infill):** El porcentaje de material que rellena el interior de la pieza. Afecta la resistencia y el costo del material.
                            <p className="text-sm text-muted-foreground ml-4">
                                <span className="font-bold">10-20%</span> (Estándar para prototipos). <span className="font-bold">50-100%</span> (Piezas funcionales o de alta carga).
                            </p>
                        </li>
                        <li>
                            **Soportes (Supports):** Material temporal necesario para imprimir voladizos o geometrías complejas.
                            <p className="text-sm text-muted-foreground ml-4">
                                El costo y el tiempo de post-procesado aumentan si se requieren soportes densos.
                            </p>
                        </li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-6">Consideraciones de Diseño Estructural</h3>
                    <p>
                        Para garantizar la integridad estructural y minimizar la necesidad de soportes complejos:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-2">
                        <li>
                            **Voladizos (Overhangs):** Evita ángulos de voladizo superiores a <span className="font-bold">45°</span> si no quieres usar soportes.
                        </li>
                        <li>
                            **Espesor de Pared:** Asegura que las paredes tengan un grosor mínimo de <span className="font-bold">0.8 mm a 1.2 mm</span> para que el filamento pueda extruirse correctamente.
                        </li>
                    </ul>
                </SectionContent>
            </Section>
            
            <Section>
                <SectionHeader title="Optimización del Archivo Final" icon={<Settings />} />
                <SectionContent className="space-y-4">
                    <p>
                        Si envías un archivo que ya fue laminado (.GCODE), **siempre confirmaremos los ajustes contigo**, ya que solo usamos nuestros perfiles optimizados para garantizar la calidad y la durabilidad de nuestras máquinas.
                    </p>
                    
                    <div className="flex flex-row bg-primary/10 p-4 border-l-4 border-primary rounded-r-md my-6">
                        <Info className="mr-3 text-primary w-5 h-5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                            **Consejo Pelambres:** Si no especificas el relleno o la altura de capa, usaremos nuestros ajustes estándar (<span className="font-bold">20%</span> de relleno, <span className="font-bold">0.2 mm</span> de altura) para darte la mejor relación costo-beneficio.
                        </p>
                    </div>

                    <Link href="/quote-request" passHref>
                        <Button className="text-lg">
                            Listo para Cotizar - Sube tus Archivos
                        </Button>
                    </Link>
                </SectionContent>
            </Section>

        </div>
    );
}