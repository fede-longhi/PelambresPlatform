import Form from "@/app/ui/quote/quote-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PageHeader from "@/components/layout/page-header";
import { Upload } from "lucide-react";

export default function Page() {
    return (
        <div className="flex justify-center py-12 w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title="Solicitar tu Cotización de"
                    coloredTitle="Impresión 3D"
                    description="Cargá tus archivos y proporciona los detalles para que podamos enviarte un presupuesto en 24 horas." />

                <Card className="w-full max-w-2xl mx-auto shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl">
                            <Upload className="w-6 h-6 mr-3 text-primary" />
                            Archivos y Detalles
                        </CardTitle>
                        <CardDescription>
                            Completa los campos de contacto y describe tu proyecto para recibir tu cotización.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}