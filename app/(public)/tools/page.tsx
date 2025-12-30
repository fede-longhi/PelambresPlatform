// app/tools/page.tsx

import React from "react";
import Link from "next/link";
// Asumo que tienes PageHeader en '@/components/ui/page-header'
import PageHeader from '@/components/ui/page-header'
// 💡 Cambiamos los iconos de MUI a Lucide (si no tienes Lucide, instala 'lucide-react')
import { Calculator, FileText } from 'lucide-react' 

// Definimos la interfaz para las herramientas para asegurar tipado
interface Tool {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    path: string;
}

const tools: Tool[] = [
    {
        id: "calculator",
        name: "Calculadora de Costos",
        description: "Calculá con precisión los costos de material, luz y tiempo para establecer el precio de venta de tus impresiones 3D.",
        // Usamos el componente Calculator de Lucide
        icon: <Calculator className="w-8 h-8 text-primary" />, 
        path: "/tools/calculator",
    },
    {
        id: "quote-builder",
        name: "Generador de Presupuestos PDF",
        description: "Crea, organiza y exporta presupuestos profesionales y estandarizados directamente a un archivo PDF listo para enviar al cliente.",
        // Usamos el componente FileText (similar a RequestQuote) de Lucide
        icon: <FileText className="w-8 h-8 text-primary" />,
        path: "/tools/quote-builder",
    },
    // Puedes añadir más herramientas aquí
];

export default function ToolsPage() {
    return (
        <div className="flex justify-center py-10 w-full">
            <div className="max-w-6xl mx-auto px-4">
                
                <PageHeader 
                    className="my-6 justify-center" 
                    textClassName="text-4xl text-center" 
                    title="Herramientas para la comunidad Maker"
                />
                <p className="text-xl text-center text-muted-foreground max-w-2xl mx-auto mb-10">
                    Potencia tu negocio de impresión 3D con nuestras utilidades diseñadas para optimizar costos, tiempo y gestión de documentos.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {tools.map((tool) => (
                        <Link 
                            key={tool.id} 
                            href={tool.path}
                            className="group flex flex-col items-start p-6 border border-gray-200 rounded-xl shadow-lg 
                                transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:bg-gray-50"
                        >
                            
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="p-3 rounded-full bg-primary/10">
                                    {tool.icon} 
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-primary">
                                    {tool.name}
                                </h2>
                            </div>

                            <p className="text-base text-muted-foreground mt-2">
                                {tool.description}
                            </p>
                            
                            <span className="mt-4 text-sm font-semibold text-primary flex items-center transition-transform group-hover:translate-x-1">
                                Usar herramienta 
                                <span aria-hidden="true" className="ml-1 text-xl leading-none">→</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}