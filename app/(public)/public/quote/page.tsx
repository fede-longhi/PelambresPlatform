import Form from "@/app/ui/quote/quote-form"
import { ArrowBack } from "@mui/icons-material"
import Link from "next/link"

export default function Page() {
    return (
        <div className="flex flex-col">
            <Link href="/" className="rounded-md border px-2 py-1 mt-4 border-primary text-secondary-foreground items-center shadow text-sm w-[100px]"><ArrowBack className="mr-2" />Volver</Link>
            <div className="flex justify-center">
                <div className="bg-slate-200 rounded min-h-[300px] min-w-[600px] shadow-md">
                    <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-t shadow-md p-6">
                        <h1 className="text-[32px]">Cotizá tu proyecto</h1>
                    </div>
                    <div className="p-8">
                        <Form />
                    </div>
                </div>
            </div>
        </div>
    )
}