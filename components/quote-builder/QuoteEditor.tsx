import { FileText, Calculator, Building, User, Plus, Trash2, BadgePercent, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuoteData, QuoteItem, TaxItem } from '@/types/quote';
import { CalculatorModal } from '@/components/quote-builder/CalculatorModal';
import { useState } from 'react';

type QuoteEditorProps = {
    meta: QuoteData;
    setMeta: (meta: QuoteData) => void;
    items: QuoteItem[];
    addItem: () => void;
    removeItem: (id: string) => void;
    updateItem: (id: string, field: keyof QuoteItem, value: string | number) => void;
    taxes: TaxItem[];
    addTax: () => void;
    removeTax: (id: string) => void;
    updateTax: (id: string, field: keyof TaxItem, value: string | number) => void;
    globalDiscount: number;
    setGlobalDiscount: (val: number) => void;
};

export function QuoteEditor(props: QuoteEditorProps) {
    const { meta, setMeta, items, addItem, removeItem, updateItem, taxes, addTax, removeTax, updateTax, globalDiscount, setGlobalDiscount } = props;
    const [activeCalcItemId, setActiveCalcItemId] = useState<string | null>(null);

    const handleApplyCalculation = (totalCost: number) => {
        if (activeCalcItemId) {
            updateItem(activeCalcItemId, 'price', totalCost);
            // Si tu calculadora también devuelve nombre/descripción, podrías inyectarlo acá:
            // updateItem(activeCalcItemId, 'description', `Impresión 3D - ${totalCost} hs`);
        }
        setActiveCalcItemId(null); // Cerramos el modal
    };

    return (
        <div className="w-full h-full xl:w-[450px] bg-white border-r border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto shadow-xl z-10">
            {/* Meta Data */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                    <FileText className="text-primary" /> Crear Cotización
                </h2>
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Building size={16} /> Datos Principales
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>N° Presupuesto</Label>
                            <Input value={meta.quoteNumber} onChange={(e) => setMeta({...meta, quoteNumber: e.target.value})} className="bg-white" />
                        </div>
                        <div>
                            <Label>Fecha</Label>
                            <Input type="date" value={meta.date} onChange={(e) => setMeta({...meta, date: e.target.value})} className="bg-white" />
                        </div>
                    </div>
                    <div>
                        <Label>Tu Empresa / Marca</Label>
                        <Input value={meta.companyName} onChange={(e) => setMeta({...meta, companyName: e.target.value})} className="bg-white" />
                    </div>
                </div>
            </div>

            {/* Cliente */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <User size={16} /> Cliente
                </h3>
                <div>
                    <Label>Nombre del Cliente</Label>
                    <Input placeholder="Ej: Juan Pérez" value={meta.clientName} onChange={(e) => setMeta({...meta, clientName: e.target.value})} className="bg-white" />
                </div>
                <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="juan@ejemplo.com" value={meta.clientEmail} onChange={(e) => setMeta({...meta, clientEmail: e.target.value})} className="bg-white" />
                </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Servicios / Ítems</h3>
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex flex-col gap-2 p-4 bg-white border border-slate-200 rounded-xl relative group shadow-sm">
                            <Label className="text-xs text-slate-400">Ítem {index + 1}</Label>
                            <Input placeholder="Descripción" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                            <div className="flex gap-2">
                                <div className="w-1/4">
                                    <Label className="text-[10px] uppercase text-slate-400">Cant.</Label>
                                    <Input type="number" min="1" value={item.quantity === 0 ? '' : item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                                </div>
                                <div className="w-2/4 relative">
                                    <Label className="text-[10px] uppercase text-slate-400">Precio Unit.</Label>
                                    <div className="flex items-center gap-1">
                                        <Input type="number" min="0" step="0.01" value={item.price === 0 ? '' : item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} />
                                        <Button 
                                            type="button"
                                            variant="outline" 
                                            size="icon"
                                            className="h-10 w-10 shrink-0 text-primary hover:bg-primary/10"
                                            onClick={() => setActiveCalcItemId(item.id)}
                                            title="Calcular costo de impresión"
                                        >
                                            <Calculator size={18} />
                                        </Button>
                                    </div>
                                </div>
                                <div className="w-1/4 relative">
                                    <Label className="text-[10px] uppercase text-slate-400">Desc. %</Label>
                                    <Input type="number" min="0" max="100" value={item.discount === 0 ? '' : item.discount} onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)} className="pr-5" />
                                    <span className="absolute right-2 top-[34px] text-slate-400 text-xs">%</span>
                                </div>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <Button onClick={addItem} variant="outline" className="w-full border-dashed border-2">
                    <Plus size={18} className="mr-2" /> Agregar Ítem
                </Button>
            </div>

            <CalculatorModal 
                isOpen={activeCalcItemId !== null} 
                onClose={() => setActiveCalcItemId(null)} 
                onApply={handleApplyCalculation} 
            />

            {/* <Dialog open={activeCalcItemId !== null} onOpenChange={(open) => !open && setActiveCalcItemId(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Calculadora de Costos 3D</DialogTitle>
                    </DialogHeader>
                    
                    <SimpleCalculator 
                        // onApply={(result) => handleApplyCalculation(result.totalCost)} 
                        // onCancel={() => setActiveCalcItemId(null)}
                    />
                    
                </DialogContent>
            </Dialog> */}

            {/* Impuestos y Descuentos */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <BadgePercent size={16} /> Descuentos e Impuestos
                </h3>
                <div className="pb-4 border-b border-slate-200">
                    <Label>Descuento General (%)</Label>
                    <div className="relative mt-1">
                        <Input type="number" min="0" max="100" value={globalDiscount === 0 ? '' : globalDiscount} onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)} className="bg-white pr-8" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                    </div>
                </div>
                <div className="space-y-3 pt-2">
                    <Label className="text-xs text-slate-400 uppercase">Impuestos Adicionales</Label>
                    {taxes.map((tax) => (
                        <div key={tax.id} className="flex gap-2 items-center relative group">
                            <div className="w-2/3">
                                <Input placeholder="Nombre (Ej: IVA)" value={tax.name} onChange={(e) => updateTax(tax.id, 'name', e.target.value)} className="bg-white h-9" />
                            </div>
                            <div className="w-1/3 relative">
                                <Input type="number" min="0" step="0.1" value={tax.percentage === 0 ? '' : tax.percentage} onChange={(e) => updateTax(tax.id, 'percentage', parseFloat(e.target.value) || 0)} className="bg-white h-9 pr-6" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                            </div>
                            <button onClick={() => removeTax(tax.id)} className="text-red-400 hover:text-red-600 p-1">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                <Button onClick={addTax} variant="ghost" size="sm" className="w-full text-slate-500 hover:text-slate-800 border border-slate-200 bg-white">
                    <Plus size={14} className="mr-2" /> Agregar Impuesto
                </Button>
            </div>

            {/* Notas */}
            <div className="space-y-2 mt-4">
                <Label>Notas y Condiciones</Label>
                <textarea className="w-full min-h-[100px] p-3 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" value={meta.notes} onChange={(e) => setMeta({...meta, notes: e.target.value})} />
            </div>
        </div>
    );
}