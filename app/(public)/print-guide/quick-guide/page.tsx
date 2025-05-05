import { ExternalLinkButton, Header, Section, SectionContent, SectionHeader } from "@/app/ui/print-guide/components";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info } from "lucide-react";

const filamentos = [
    {
        nombre: "PLA",
        propiedades: "Fácil de imprimir, biodegradable, baja resistencia térmica",
        costo: "bajo",
        usos: "Prototipos, decoración, piezas no funcionales, modelos para pintar"
    },
    {
        nombre: "PETG",
        propiedades: "Resistente, resistente a químicos, mejor resistencia térmica que el PLA",
        costo: "bajo",
        usos: "Piezas funcionales, piezas expuestas al exterior"
    },
    {
        nombre: "TPU",
        propiedades: "Flexible, elástico, resistente al desgaste",
        costo: "moderado",
        usos: "Fundas, juntas, ruedas, piezas que requieren elasticidad"
    },
    {
        nombre: "PLA FLEX",
        propiedades: "Similar al PLA pero con mayor flexibilidad, fácil de imprimir",
        costo: "bajo",
        usos: "Piezas decorativas con flexibilidad, juguetes, prototipos con partes móviles"
    }
];

export default function Page() {
    return (
        <div>
            <Header title="Guía Rápida"/>

            <div className="space-y-12">
                <Section>
                    <SectionHeader title="¿Cómo empezar?"/>
                    <SectionContent className="space-y-2">
                        <p>Para poder imprimir un archivo contactate con nosotros, envíanos el archivo o contanos que querés imprimir y nosotros te asesoramos.</p>
                        <p>Los modelos los podes diseñar vos, encontrar en internet o pedirnos a nosotros el diseño.</p>
                        <p>Dependiendo del tamaño y la complejidad la impresión suele estar en <b>menos de 5 días hábiles.</b></p>
                        <p>Si ya tenés el modelo y la impresión es pequeña el modelo puede llegar a estar en el día!</p>
                    </SectionContent>
                </Section>

                <Section>
                    <SectionHeader title="Links para buscar modelos"/>
                    <SectionContent>
                        <p>En los siguientes links podes buscar modelos hechos por la comunidad:</p>
                        <div className="m-2 flex flex-col w-fit space-y-2">
                            <ExternalLinkButton
                                name="Thingiverse"
                                description="todos los modelos son gratis"
                                href="https://www.thingiverse.com/"
                                domain="thingiverse.com"
                            />
                            <ExternalLinkButton
                                href="https://cults3d.com/"
                                name="Cults 3D"
                                description="modelos gratuitos y pagos"
                                domain="cults3d.com"
                            />
                            <ExternalLinkButton
                                href="https://thangs.com/"
                                name="Thangs"
                                description="buscador de modelos en varios sitios a la vez"
                                domain="thangs.com"
                            />
                            <ExternalLinkButton
                                href="https://www.myminifactory.com/"
                                name="My mini factory"
                                description="modelos gratuitos y pagos"
                                domain="myminifactory.com"
                            />
                        </div>
                        ¡Proximamente nuestro propio catálogo! 
                    </SectionContent>
                </Section>

                <Section>
                    <SectionHeader title="Que filamento elegir"/>
                    <SectionContent>
                        Hay una gran cantidad de materiales para elegir, sin embargo acá te contamos las opciones más populares:

                        <div className="m-12">
                            <Table>
                                <TableCaption>Lista de filamentos más populares.</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Filamento</TableHead>
                                        <TableHead>Propiedades</TableHead>
                                        <TableHead>Costo</TableHead>
                                        <TableHead>Usos</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        filamentos.map((filamento) => (
                                            <TableRow key={filamento.nombre}> 
                                                <TableCell>{filamento.nombre}</TableCell>
                                                <TableCell>{filamento.propiedades}</TableCell>
                                                <TableCell>{filamento.costo}</TableCell>
                                                <TableCell>{filamento.usos}</TableCell>
                                            </TableRow>

                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </div>

                    </SectionContent>
                </Section>

                <Section>
                    <SectionHeader title="Catálogo de filamentos"/>
                    <SectionContent>
                        En Pelambres utilizamos la mejor calidad de filamentos. Los principales proveedores son:
                        <div className="m-2 flex flex-col w-fit space-y-2">
                            <ExternalLinkButton
                                href="https://printalot.com.ar/categoria-producto/filamentos/"
                                name="Printalot"
                                domain="printalot.com.ar"
                            />        
                            <ExternalLinkButton
                                href="https://grilon3.com.ar/productos/"
                                name="Grilon"
                                domain="grilon3.com.ar"
                            />
                        </div>

                        Además podes encontrar más opciones en:
                        <div className="m-2 flex flex-col w-fit space-y-2">
                            <ExternalLinkButton
                                href="https://hellbot.com.ar/11-filamentos/"
                                name="Hellbot"
                                domain="hellbot.com.ar"
                            />
                            <span className="text-sm text-gray-700">
                            Consultar por otras opciones
                            </span>
                        </div>


                    </SectionContent>
                </Section>

                <Section>
                    <SectionHeader title="Cómo se calcula el valor del proyecto"/>
                    <SectionContent>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-2">Costo de la impresión</h2>
                            <p className="mb-2">Este valor depende principalmente de dos factores:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>
                                    <strong>Tiempo de impresión</strong>:
                                    <ul className="list-disc list-inside ml-5 space-y-1">
                                        <li>Tamaño de las piezas</li>
                                        <li>Complejidad del modelo</li>
                                    </ul>
                                </li>
                                <li>
                                    <strong>Costo del material</strong>:
                                    <ul className="list-disc list-inside ml-5 space-y-1">
                                        <li>Cantidad de filamento utilizado</li>
                                        <li>Tipo de material (PLA, PETG, TPU, etc.)</li>
                                    </ul>
                                </li>
                            </ul>
                            <div className="flex flex-row bg-secondary/50 p-4 my-4">
                                <Info className="mr-2 text-primary" />
                                Importante: una pieza más grande no siempre cuesta más, ya que una pieza pequeña pero densa o compleja puede requerir más tiempo y material.
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold mb-2">Costo total del proyecto</h2>
                            <p>Además del costo de impresión, hay otros elementos que componen el precio final:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Diseño del modelo</strong>: si hay que crearlo desde cero o modificar uno existente.</li>
                                <li><strong>Impresión 3D</strong>: basado en tiempo y materiales como se explicó arriba.</li>
                                <li>
                                <strong>Postprocesado</strong>: tareas adicionales como:
                                <ul className="list-disc list-inside ml-5 space-y-1">
                                    <li>Emprolijar bordes o soportes</li>
                                    <li>Pintura y acabados</li>
                                    <li>Ensamblaje de piezas</li>
                                    <li>Otros detalles personalizados</li>
                                </ul>
                                </li>
                            </ul>
                        </div>
                    </SectionContent>
                </Section>

            </div>
        </div>
    )
}