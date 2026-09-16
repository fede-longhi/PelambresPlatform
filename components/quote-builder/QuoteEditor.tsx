import { FileText, Calculator, Building, User, Plus, Trash2, BadgePercent, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { QuoteData, QuoteItem, QuoteItemCalculatorParams, TaxItem } from '@/types/quote';
import { CalculatorModal } from '@/components/quote-builder/CalculatorModal';
import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

type QuoteEditorProps = {
    meta: QuoteData;
    setMeta: (meta: QuoteData) => void;
    items: QuoteItem[];
    addItem: () => void;
    removeItem: (id: string) => void;
    updateItem: (id: string, field: keyof QuoteItem, value: QuoteItem[keyof QuoteItem]) => void;
    patchItem: (id: string, patch: Partial<QuoteItem>) => void;
    taxes: TaxItem[];
    addTax: () => void;
    removeTax: (id: string) => void;
    updateTax: (id: string, field: keyof TaxItem, value: string | number) => void;
    globalDiscount: number;
    setGlobalDiscount: (val: number) => void;
    title?: string;
    quoteNumberReadOnly?: boolean;
    customerPicker?: ReactNode;
    onSave?: () => void;
    isSaving?: boolean;
    saveError?: string | null;
};

export function QuoteEditor(props: QuoteEditorProps) {
    const {
        meta,
        setMeta,
        items,
        addItem,
        removeItem,
        updateItem,
        patchItem,
        taxes,
        addTax,
        removeTax,
        updateTax,
        globalDiscount,
        setGlobalDiscount,
        title = 'Crear Cotización',
        quoteNumberReadOnly = false,
        customerPicker,
        onSave,
        isSaving = false,
        saveError,
    } = props;
    const [activeCalcItemId, setActiveCalcItemId] = useState<string | null>(null);
    const activeCalculatorItem = items.find((item) => item.id === activeCalcItemId);

    const handleApplyCalculation = (totalCost: number, calculatorParams: QuoteItemCalculatorParams) => {
        if (activeCalcItemId) {
            patchItem(activeCalcItemId, {
                price: Math.round(totalCost * 100) / 100,
                calculatorParams,
            });
        }
        setActiveCalcItemId(null);
    };

    return (
        <div className="w-full xl:w-[450px] shrink-0 h-full overflow-y-auto bg-white border-r border-slate-200 p-6 pb-28 xl:pb-6 flex flex-col gap-8 shadow-xl z-10">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                    <FileText className="text-primary" /> {title}
                </h2>
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Building size={16} /> Datos Principales
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="quote-number">N° Presupuesto</Label>
                            <Input
                                id="quote-number"
                                value={meta.quoteNumber}
                                readOnly={quoteNumberReadOnly}
                                placeholder={quoteNumberReadOnly ? 'Se asignará al guardar' : undefined}
                                onChange={
                                    quoteNumberReadOnly
                                        ? undefined
                                        : (event) => setMeta({ ...meta, quoteNumber: event.target.value })
                                }
                                className={cn('bg-white', quoteNumberReadOnly && 'bg-slate-100')}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <Switch
                                    id="show-quote-number"
                                    checked={meta.showQuoteNumber}
                                    onCheckedChange={(checked) => setMeta({ ...meta, showQuoteNumber: checked })}
                                />
                                <Label htmlFor="show-quote-number" className="text-xs font-normal text-slate-500">
                                    Mostrar en el PDF
                                </Label>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="quote-date">Fecha</Label>
                            <Input id="quote-date" type="date" value={meta.date} onChange={(e) => setMeta({...meta, date: e.target.value})} className="bg-white" />
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
                {customerPicker}
                <div>
                    <Label htmlFor="client-name">Nombre del Cliente</Label>
                    <Input
                        id="client-name"
                        placeholder="Ej: Juan Pérez"
                        value={meta.clientName}
                        onChange={(event) => setMeta({ ...meta, clientName: event.target.value })}
                        className="bg-white"
                    />
                </div>
                <div>
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                        id="client-email"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        value={meta.clientEmail}
                        onChange={(event) => setMeta({ ...meta, clientEmail: event.target.value })}
                        className="bg-white"
                    />
                </div>
                <div>
                    <Label htmlFor="client-phone">Teléfono</Label>
                    <Input
                        id="client-phone"
                        type="text"
                        placeholder="11 1234-5678"
                        value={meta.clientPhone}
                        onChange={(event) => setMeta({ ...meta, clientPhone: event.target.value })}
                        className="bg-white"
                    />
                </div>
                <div>
                    <Label htmlFor="client-address">Dirección</Label>
                    <Input
                        id="client-address"
                        type="text"
                        placeholder="Calle, localidad"
                        value={meta.clientAddress}
                        onChange={(event) => setMeta({ ...meta, clientAddress: event.target.value })}
                        className="bg-white"
                    />
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
                itemId={activeCalcItemId}
                initialParams={activeCalculatorItem?.calculatorParams}
                onClose={() => setActiveCalcItemId(null)} 
                onApply={handleApplyCalculation} 
            />

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
                <Label htmlFor="quote-notes">Notas y Condiciones</Label>
                <textarea
                    id="quote-notes"
                    className="w-full min-h-[100px] p-3 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={meta.notes}
                    onChange={(event) => setMeta({ ...meta, notes: event.target.value })}
                />
            </div>

            {onSave ? (
                <div className="space-y-2">
                    {saveError ? (
                        <p className="text-sm text-destructive">{saveError}</p>
                    ) : null}
                    <Button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving}
                        className="hidden w-full xl:inline-flex"
                    >
                        <Save size={16} className="mr-2" />
                        {isSaving ? 'Guardando...' : 'Guardar presupuesto'}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}