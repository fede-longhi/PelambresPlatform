import Form from "@/app/ui/quote/quote-form"

export default function Page() {
    return (
        <div className="flex flex-col">
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