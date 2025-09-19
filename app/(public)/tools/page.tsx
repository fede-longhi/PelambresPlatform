
import React from "react";
import Link from "next/link";
import PageHeader from '@/components/ui/page-header'
import { Calculate, RequestQuote } from '@mui/icons-material'

const tools = [
    {
        id: "calculator",
        name: "Calculadora",
        description: "Calculá los costos y precio de venta de tus impresiones.",
        image: "/images/client-manager.png",
        icon: <Calculate sx={{fontSize: 40}}/>,
        path: "/tools/calculator",
    },
    {
        id: "quote-builder",
        name: "Generador de Presupuestos",
        description: "Permite crear y exportar presupuestos en PDF.",
        image: "/images/quote-preview.png",
        icon: <RequestQuote sx={{fontSize: 40}}/>,
        path: "/tools/quote-builder",
    },
];
export default function Page() {
    return (
        <div className="flex justify-center py-10 w-full">
            <div className="max-w-6xl mx-auto px-4">
                <PageHeader className="justify-center my-6" textClassName="text-4xl" title="Herramientas para creadores" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {tools.map((tool) => (
                        <div key={tool.id}>
                            <Link href={tool.path}
                                className="bg-primary text-primary-foreground rounded-2xl shadow hover:shadow-lg transition overflow-hidden p-4 flex flex-col justify-center items-center"
                            >
                                {/* <div className="flex flex-col justify-center items-center">
                                </div> */}
                                <div className="flex flex-col justify-center items-center">
                                    <div className="my-4">
                                        {tool.icon}
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2 text-center">{tool.name}</h2>
                                </div>
                            </Link>
                            <div className="p-4">
                                <p className="text-muted-foreground text-sm mb-4 text-center">{tool.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}