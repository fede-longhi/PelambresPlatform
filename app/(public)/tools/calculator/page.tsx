'use client';

import SimpleCalculator from "@/components/simple-calculator/simple-calculator";

export default function Page(){
    const defaultMaterialCost = 20000;
    const defaultPrintTimeValue = 500;
    const defaultMarkup = 200;

    return(
        <div className="flex items-center justify-center m-8 w-full">
            <div className="flex-1 bg-white p-8 rounded-2xl shadow-lg max-w-[600px]">
                <h1 className="text-3xl font-bold text-center text-primary mb-6">Calculadora de Costo</h1>
                <p className="text-center text-gray-500 mb-8">
                    Calcula un precio estimado para tus impresiones 3D.
                </p>
                <SimpleCalculator
                    defaultMaterialCost={defaultMaterialCost}
                    defaultPrintTimeValue={defaultPrintTimeValue}
                    defaultMarkup={defaultMarkup}
                />
            </div>
        </div>
    )
}