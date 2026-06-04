'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/hooks/use-quote';
import { QuoteEditor } from './QuoteEditor';
import { QuotePreview } from './QuotePreview';

export default function QuoteBuilder() {
    const quote = useQuote();
    const previewRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    
    // ESTADO: Controla si la vista previa se muestra en pantalla completa en Mobile
    const [showMobilePreview, setShowMobilePreview] = useState(false);

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
        <div className="flex w-full h-full overflow-hidden bg-slate-100 font-sans relative">
            <div className={`h-full w-full xl:w-auto relative ${showMobilePreview ? 'hidden xl:block' : 'block'}`}>
                
                <QuoteEditor {...quote} />
                
                <div className="xl:hidden fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20">
                    <Button 
                        className="w-full text-md h-12 shadow-md" 
                        onClick={() => setShowMobilePreview(true)}
                    >
                        <Eye className="mr-2" size={20} /> Ver PDF y Exportar
                    </Button>
                </div>

            </div>

            <div className={`
                flex-col items-center h-full bg-slate-100 overflow-y-auto
                ${showMobilePreview ? 'fixed inset-0 z-50 flex p-4 pb-20' : 'hidden xl:flex flex-1 p-8 min-h-0'}
            `}>
                
                <div className="w-full max-w-[800px] flex justify-between xl:justify-end items-center mb-6 shrink-0 gap-3">
                    
                    <Button 
                        variant="outline" 
                        className="xl:hidden border-slate-300 text-slate-700 bg-white shadow-sm"
                        onClick={() => setShowMobilePreview(false)}
                    >
                        <ArrowLeft size={18} className="mr-2" /> Volver
                    </Button>

                    <Button 
                        onClick={generatePDF} 
                        disabled={isGeneratingPdf}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-lg shadow-slate-900/20 shrink-0"
                    >
                        {isGeneratingPdf ? 'Generando...' : <><Download size={18} className="mr-2 hidden sm:block" /> Descargar PDF</>}
                    </Button>
                </div>
                
                <div className="w-full flex justify-center shrink-0">
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