'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Eye, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/hooks/use-quote';
import { QuoteEditor } from './QuoteEditor';
import {
    QuotePreview,
    QUOTE_PREVIEW_MIN_HEIGHT_PX,
    QUOTE_PREVIEW_WIDTH_PX,
} from './QuotePreview';
import CustomerSelectField from '@/components/shared/customer-select-field';
import { saveQuoteDocument } from '@/lib/actions/quote-document-actions';
import { formatQuoteNumber, getQuoteClientDisplayName } from '@/lib/consts/quote-document-consts';
import { useToast } from '@/hooks/use-toast';
import type { Customer, CustomerType } from '@/types/definitions';
import type { QuoteBuilderState } from '@/types/quote';

/** Leave side breathing room when scaling the A4 preview on narrow screens. */
const MOBILE_PREVIEW_SIDE_GAP_PX = 16;

export type QuoteBuilderProps = {
    mode?: 'public' | 'admin';
    quoteId?: string;
    quoteRequestId?: string | null;
    initialQuote?: Partial<QuoteBuilderState>;
    initialCustomer?: {
        id: string;
        label: string;
        type: CustomerType;
    };
    editorTitle?: string;
};

export default function QuoteBuilder({
    mode = 'public',
    quoteId,
    quoteRequestId = null,
    initialQuote,
    initialCustomer,
    editorTitle,
}: QuoteBuilderProps) {
    const isAdmin = mode === 'admin';
    const quote = useQuote({
        initial: initialQuote,
        emptyItems: isAdmin && !initialQuote?.items,
    });
    const pdfSourceRef = useRef<HTMLDivElement>(null);
    const displayPreviewRef = useRef<HTMLDivElement>(null);
    const previewViewportRef = useRef<HTMLDivElement>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);
    const [previewHeight, setPreviewHeight] = useState(QUOTE_PREVIEW_MIN_HEIGHT_PX);
    const [customerId, setCustomerId] = useState(initialCustomer?.id ?? '');
    const [customerType, setCustomerType] = useState<CustomerType>(
        initialCustomer?.type ?? 'person'
    );
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const viewport = previewViewportRef.current;
        if (!viewport) {
            return;
        }

        const updateScale = () => {
            const availableWidth = Math.max(0, viewport.clientWidth - MOBILE_PREVIEW_SIDE_GAP_PX * 2);
            if (availableWidth <= 0) {
                return;
            }
            setPreviewScale(Math.min(1, availableWidth / QUOTE_PREVIEW_WIDTH_PX));
        };

        const frameId = requestAnimationFrame(updateScale);
        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(viewport);
        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
        };
    }, [showMobilePreview]);

    useEffect(() => {
        const previewNode = displayPreviewRef.current;
        if (!previewNode) {
            return;
        }

        const updateHeight = () => {
            setPreviewHeight(Math.max(QUOTE_PREVIEW_MIN_HEIGHT_PX, previewNode.offsetHeight));
        };

        updateHeight();
        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(previewNode);
        return () => resizeObserver.disconnect();
    }, [showMobilePreview, quote.items, quote.meta, quote.globalDiscount, quote.taxes]);

    const applyCustomerSnapshot = (customer: Customer) => {
        setCustomerId(customer.id);
        setCustomerType(customer.type);
        quote.setMeta({
            ...quote.meta,
            clientName: getQuoteClientDisplayName(customer),
            clientEmail: customer.email ?? '',
            clientPhone: customer.phone ?? '',
            clientAddress: customer.address ?? '',
        });
    };

    const generatePDF = async () => {
        const source = pdfSourceRef.current;
        if (!source) return;
        setIsGeneratingPdf(true);

        try {
            const canvas = await html2canvas(source, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: QUOTE_PREVIEW_WIDTH_PX,
                windowWidth: QUOTE_PREVIEW_WIDTH_PX,
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const overflowToleranceMm = 2;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > overflowToleranceMm) {
                position -= pageHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileNumber = quote.meta.quoteNumber.trim() || 'borrador';
            pdf.save(`Presupuesto_${fileNumber}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleSave = async () => {
        if (!isAdmin) {
            return;
        }

        if (!customerId) {
            setSaveError('Seleccioná un cliente para guardar el presupuesto.');
            return;
        }

        if (!quote.meta.clientName.trim()) {
            setSaveError('El nombre del cliente es obligatorio.');
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const result = await saveQuoteDocument({
                id: quoteId,
                customerId,
                quoteRequestId,
                date: quote.meta.date,
                companyName: quote.meta.companyName,
                clientName: quote.meta.clientName.trim(),
                clientEmail: quote.meta.clientEmail.trim(),
                clientPhone: quote.meta.clientPhone.trim(),
                clientAddress: quote.meta.clientAddress.trim(),
                clientType: customerType,
                notes: quote.meta.notes,
                globalDiscount: quote.globalDiscount,
                showQuoteNumber: quote.meta.showQuoteNumber,
                items: quote.items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    discount: item.discount,
                    calculatorParams: item.calculatorParams,
                })),
                taxes: quote.taxes.map((tax) => ({
                    name: tax.name,
                    percentage: tax.percentage,
                })),
            });

            if (!result.success || !result.id || result.quoteNumber == null) {
                setSaveError(result.message ?? 'No se pudo guardar el presupuesto.');
                return;
            }

            toast({
                title: 'Presupuesto guardado',
                description: `Quedó registrado como Nº ${formatQuoteNumber(result.quoteNumber)}.`,
                variant: 'success',
            });

            if (!quoteId) {
                router.push(`/admin/quotes/${result.id}/edit`);
                router.refresh();
                return;
            }

            quote.setMeta({
                ...quote.meta,
                quoteNumber: formatQuoteNumber(result.quoteNumber),
            });
            router.refresh();
        } catch (error) {
            console.error(error);
            setSaveError('No se pudo guardar el presupuesto.');
        } finally {
            setIsSaving(false);
        }
    };

    const previewProps = {
        meta: quote.meta,
        items: quote.items,
        globalDiscount: quote.globalDiscount,
        math: quote.math,
    };

    const scaledPreviewHeight = previewHeight * previewScale;
    const scaledPreviewWidth = QUOTE_PREVIEW_WIDTH_PX * previewScale;

    return (
        <div className="flex w-full h-full overflow-hidden bg-slate-100 font-sans relative">
            <div
                className="pointer-events-none absolute -z-10"
                aria-hidden="true"
                style={{ left: -10000, top: 0, width: QUOTE_PREVIEW_WIDTH_PX }}
            >
                <QuotePreview ref={pdfSourceRef} {...previewProps} forPdfCapture />
            </div>

            <div className={`h-full w-full xl:w-auto relative ${showMobilePreview ? 'hidden xl:block' : 'block'}`}>
                <QuoteEditor
                    {...quote}
                    title={editorTitle}
                    quoteNumberReadOnly={isAdmin}
                    onSave={isAdmin ? handleSave : undefined}
                    isSaving={isSaving}
                    saveError={saveError}
                    customerPicker={
                        isAdmin ? (
                            <CustomerSelectField
                                defaultValue={
                                    initialCustomer
                                        ? { value: initialCustomer.id, label: initialCustomer.label }
                                        : undefined
                                }
                                onCustomerChange={applyCustomerSnapshot}
                            />
                        ) : undefined
                    }
                />

                <div className="xl:hidden fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20">
                    {isAdmin ? (
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <Save className="mr-2" size={18} />
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </Button>
                            <Button
                                type="button"
                                className="h-12 shadow-md"
                                onClick={() => setShowMobilePreview(true)}
                            >
                                <Eye className="mr-2" size={18} /> Ver PDF
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="w-full text-md h-12 shadow-md"
                            onClick={() => setShowMobilePreview(true)}
                        >
                            <Eye className="mr-2" size={20} /> Ver PDF y Exportar
                        </Button>
                    )}
                </div>
            </div>

            <div
                className={`
                flex-col items-center h-full bg-slate-100 overflow-y-auto
                ${showMobilePreview ? 'fixed inset-0 z-50 flex px-4 py-4 pb-20' : 'hidden xl:flex flex-1 p-8 min-h-0'}
            `}
            >
                <div className="w-full max-w-[800px] flex justify-between xl:justify-end items-center mb-5 shrink-0 gap-2 sm:gap-3">
                    <Button
                        variant="outline"
                        className="xl:hidden border-slate-300 text-slate-700 bg-white shadow-sm"
                        onClick={() => setShowMobilePreview(false)}
                    >
                        <ArrowLeft size={18} className="mr-1 sm:mr-2" /> Volver
                    </Button>

                    {isAdmin ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-white"
                        >
                            <Save size={18} className="sm:mr-2" />
                            <span className="hidden sm:inline">
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </span>
                        </Button>
                    ) : null}

                    <Button
                        onClick={generatePDF}
                        disabled={isGeneratingPdf}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 sm:px-6 shadow-lg shadow-slate-900/20 shrink-0"
                    >
                        {isGeneratingPdf ? (
                            'Generando...'
                        ) : (
                            <>
                                <Download size={18} className="sm:mr-2" />
                                <span className="hidden sm:inline">Descargar PDF</span>
                                <span className="sm:hidden ml-2">PDF</span>
                            </>
                        )}
                    </Button>
                </div>

                {isAdmin && saveError ? (
                    <p className="mb-4 w-full max-w-[800px] text-sm text-destructive">{saveError}</p>
                ) : null}

                <div
                    ref={previewViewportRef}
                    className="w-full max-w-[800px] flex justify-center shrink-0 overflow-x-hidden"
                >
                    <div
                        className="relative"
                        style={{
                            width: scaledPreviewWidth,
                            height: scaledPreviewHeight,
                        }}
                    >
                        <div
                            className="absolute top-0 left-0"
                            style={{
                                width: QUOTE_PREVIEW_WIDTH_PX,
                                transform: `scale(${previewScale})`,
                                transformOrigin: 'top left',
                            }}
                        >
                            <QuotePreview ref={displayPreviewRef} {...previewProps} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
