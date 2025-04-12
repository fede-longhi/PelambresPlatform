import Form from "@/app/ui/quote/quote-form"

export default function Page() {
    return (
        <div className="flex flex-col">
            <div className="flex justify-center w-full my-12">
                <div className="bg-slate-200 rounded shadow-md flex-grow md:flex-grow-0 md:min-w-[600px]">
                    <div className="flex items-center justify-center bg-primary text-primary-foreground md:rounded-t shadow-md p-6">
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