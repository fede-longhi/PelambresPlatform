import { forwardRef } from 'react';
import { QuoteData, QuoteItem, QuoteMath } from '@/types/quote';

type QuotePreviewProps = {
    meta: QuoteData;
    items: QuoteItem[];
    globalDiscount: number;
    math: QuoteMath;
};

export const QuotePreview = forwardRef<HTMLDivElement, QuotePreviewProps>(({ meta, items, globalDiscount, math }, ref) => {
    return (
        <div 
            ref={ref}
            className="w-full max-w-[800px] bg-white shadow-2xl p-8 md:p-16 aspect-[1/1.414] flex flex-col justify-between"
            style={{ minHeight: '1131px' }} 
        >
            <div>
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{meta.companyName}</h1>
                        <p className="text-slate-500 mt-2">Presupuesto Comercial</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-slate-800">{meta.quoteNumber}</p>
                        <p className="text-slate-500">Fecha: {meta.date}</p>
                    </div>
                </div>

                <div className="mb-12">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Preparado para:</h3>
                    <p className="text-lg font-semibold text-slate-800">{meta.clientName || 'Nombre del Cliente'}</p>
                    <p className="text-slate-600">{meta.clientEmail || 'email@cliente.com'}</p>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="py-3 font-semibold text-slate-600 w-2/5">Descripción</th>
                            <th className="py-3 font-semibold text-slate-600 text-center">Cant.</th>
                            <th className="py-3 font-semibold text-slate-600 text-right">Precio Unit.</th>
                            <th className="py-3 font-semibold text-slate-600 text-right">Desc.</th>
                            <th className="py-3 font-semibold text-slate-600 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-b border-slate-100">
                                <td className="py-4 text-slate-800 font-medium pr-4">{item.description || 'Sin descripción'}</td>
                                <td className="py-4 text-slate-600 text-center">{item.quantity}</td>
                                <td className="py-4 text-slate-600 text-right">${item.price.toFixed(2)}</td>
                                <td className="py-4 text-slate-500 text-right">
                                    {item.discount > 0 ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-sm text-xs">-{item.discount}%</span> : '-'}
                                </td>
                                <td className="py-4 text-slate-800 font-bold text-right">${math.getItemTotal(item).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <div className="flex justify-end mt-8">
                    <div className="w-1/2 space-y-3">
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