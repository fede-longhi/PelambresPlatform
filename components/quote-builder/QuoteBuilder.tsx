'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/hooks/use-quote';
import { QuoteEditor } from './QuoteEditor';
import { QuotePreview } from './QuotePreview';

export default function QuoteBuilder() {
    const quote = useQuote();
    const previewRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const generatePDF = async () => {
        if (!previewRef.current) return;
        setIsGeneratingPdf(true);

        try {
            const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Presupuesto_${quote.meta.quoteNumber}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="flex w-full flex-col xl:flex-row h-full overflow-hidden bg-slate-100 font-sans">
            <QuoteEditor {...quote} />
            
            <div className="flex-1 p-4 md:p-8 flex flex-col items-center w-full h-full overflow-auto">
                <div className="w-full max-w-[800px] flex justify-end mb-4">
                    <Button 
                        onClick={generatePDF} 
                        disabled={isGeneratingPdf}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-lg shadow-slate-900/20"
                    >
                        {isGeneratingPdf ? 'Generando...' : <><Download size={18} className="mr-2" /> Descargar PDF</>}
                    </Button>
                </div>
                <div className="">
                    <QuotePreview 
                        ref={previewRef}
                        meta={quote.meta}
                        items={quote.items}
                        globalDiscount={quote.globalDiscount}
                        math={quote.math}
                    />
                </div>
            </div>
        </div>
    );
}