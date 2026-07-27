import { forwardRef } from 'react';
import { QuoteData, QuoteItem, QuoteMath } from '@/types/quote';

/** A4 width at screen DPI — keep fixed so PDF capture stays consistent. */
export const QUOTE_PREVIEW_WIDTH_PX = 794;
/** Exact A4 aspect (297/210) to avoid a near-blank second PDF page. */
export const QUOTE_PREVIEW_MIN_HEIGHT_PX = Math.round(QUOTE_PREVIEW_WIDTH_PX * (297 / 210));

type QuotePreviewProps = {
    meta: QuoteData;
    items: QuoteItem[];
    globalDiscount: number;
    math: QuoteMath;
    /** Hide drop shadow — used for the offscreen PDF capture source. */
    forPdfCapture?: boolean;
};

export const QuotePreview = forwardRef<HTMLDivElement, QuotePreviewProps>(({ meta, items, globalDiscount, math, forPdfCapture = false }, ref) => {
    return (
        <div 
            ref={ref}
            className={`bg-white p-16 aspect-[1/1.414] flex flex-col justify-between box-border ${forPdfCapture ? '' : 'shadow-2xl'}`}
            style={{ width: QUOTE_PREVIEW_WIDTH_PX, minHeight: QUOTE_PREVIEW_MIN_HEIGHT_PX }} 
        >
            <div>
                <div className="flex justify-between items-start gap-6 border-b-2 border-slate-900 pb-8 mb-8">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase break-words">
                            {meta.companyName}
                        </h1>
                        <p className="text-slate-500 mt-2">Presupuesto Comercial</p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-xl md:text-2xl font-bold text-slate-800">{meta.quoteNumber}</p>
                        <p className="text-slate-500 whitespace-nowrap">Fecha: {meta.date}</p>
                    </div>
                </div>

                <div className="mb-12">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Preparado para:</h3>
                    <p className="text-lg font-semibold text-slate-800">{meta.clientName || 'Nombre del Cliente'}</p>
                    <p className="text-slate-600">{meta.clientEmail || 'email@cliente.com'}</p>
                </div>

                <table className="w-full table-fixed text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="py-3 font-semibold text-slate-600 w-[36%]">Descripción</th>
                            <th className="py-3 font-semibold text-slate-600 text-center w-[12%]">Cant.</th>
                            <th className="py-3 font-semibold text-slate-600 text-right w-[18%]">Precio Unit.</th>
                            <th className="py-3 font-semibold text-slate-600 text-right w-[14%]">Desc.</th>
                            <th className="py-3 font-semibold text-slate-600 text-right w-[20%]">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100">
                                <td className="py-4 text-slate-800 font-medium pr-4 break-words">{item.description || 'Sin descripción'}</td>
                                <td className="py-4 text-slate-600 text-center">{item.quantity}</td>
                                <td className="py-4 text-slate-600 text-right whitespace-nowrap">${item.price.toFixed(2)}</td>
                                <td className="py-4 text-slate-500 text-right">
                                    {item.discount > 0 ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-sm text-xs whitespace-nowrap">-{item.discount}%</span> : '-'}
                                </td>
                                <td className="py-4 text-slate-800 font-bold text-right whitespace-nowrap">${math.getItemTotal(item).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <div className="flex justify-end mt-8">
                    <div className="w-1/2 min-w-[240px] space-y-3">
                        <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                            <span>Subtotal</span>
                            <span>${math.itemsSubtotal.toFixed(2)}</span>
                        </div>

                        {globalDiscount > 0 && (
                            <div className="flex justify-between text-green-600 font-medium text-sm">
                                <span>Descuento General ({globalDiscount}%)</span>
                                <span>-${math.globalDiscountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        
                        {math.calculatedTaxes.map((tax) => (
                            <div key={tax.id} className="flex justify-between text-slate-500 text-sm">
                                <span>{tax.name || 'Impuesto'} ({tax.percentage}%)</span>
                                <span>${tax.amount.toFixed(2)}</span>
                            </div>
                        ))}

                        <div className="flex justify-between text-xl font-black text-slate-900 border-t-2 border-slate-900 pt-3 mt-2">
                            <span>Total Final</span>
                            <span>${math.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-200 text-sm text-slate-500">
                    <p className="font-semibold text-slate-700 mb-1">Notas y Condiciones:</p>
                    <p className="whitespace-pre-wrap">{meta.notes}</p>
                </div>
            </div>
        </div>
    );
});

QuotePreview.displayName = 'QuotePreview';
