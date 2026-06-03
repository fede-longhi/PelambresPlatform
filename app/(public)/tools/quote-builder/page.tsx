'use client';

import QuoteBuilder from "@/components/quote-builder/QuoteBuilder";

export default function Page(){

    return(
        <div className="absolute inset-0 flex flex-col bg-blue-400 overflow-hidden">

            <div className="flex-1 min-h-0 w-full">
                <QuoteBuilder />
            </div>
        </div>
    )
}