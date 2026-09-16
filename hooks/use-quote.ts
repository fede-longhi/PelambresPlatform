import { useState } from 'react';
import { computeQuoteMath } from '@/lib/quote-math';
import { QuoteBuilderState, QuoteData, QuoteItem, TaxItem } from '@/types/quote';

const DEFAULT_META: QuoteData = {
    quoteNumber: '0000001',
    showQuoteNumber: true,
    date: new Date().toISOString().split('T')[0],
    companyName: 'Pelambres 3D',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    notes: 'Validez del presupuesto: 15 días. Pago por transferencia bancaria.',
};

const DEFAULT_ITEM: QuoteItem = {
    id: 'default-item',
    description: 'Impresión 3D - Pieza Mecánica (PLA)',
    quantity: 1,
    price: 5000,
    discount: 0,
};

const EMPTY_ITEM: QuoteItem = {
    id: 'empty-item',
    description: '',
    quantity: 1,
    price: 0,
    discount: 0,
};

const DEFAULT_TAX: TaxItem = {
    id: 'default-tax',
    name: 'IVA',
    percentage: 21,
};

export type UseQuoteOptions = {
    initial?: Partial<QuoteBuilderState>;
    emptyItems?: boolean;
};

export function useQuote(options: UseQuoteOptions = {}) {
    const { initial, emptyItems = false } = options;

    const [meta, setMeta] = useState<QuoteData>({
        ...DEFAULT_META,
        date: new Date().toISOString().split('T')[0],
        quoteNumber: emptyItems ? '' : DEFAULT_META.quoteNumber,
        ...initial?.meta,
    });

    const [items, setItems] = useState<QuoteItem[]>(
        initial?.items ?? [
            {
                ...(emptyItems ? EMPTY_ITEM : DEFAULT_ITEM),
                id: crypto.randomUUID(),
            },
        ]
    );

    const [taxes, setTaxes] = useState<TaxItem[]>(
        initial?.taxes ?? [{ ...DEFAULT_TAX, id: crypto.randomUUID() }]
    );

    const [globalDiscount, setGlobalDiscount] = useState<number>(
        initial?.globalDiscount ?? 0
    );

    const addItem = () =>
        setItems((currentItems) => [
            ...currentItems,
            { id: crypto.randomUUID(), description: '', quantity: 1, price: 0, discount: 0 },
        ]);
    const removeItem = (id: string) =>
        setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    const updateItem = (
        id: string,
        field: keyof QuoteItem,
        value: QuoteItem[keyof QuoteItem]
    ) => {
        setItems((currentItems) =>
            currentItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };
    const patchItem = (id: string, patch: Partial<QuoteItem>) => {
        setItems((currentItems) =>
            currentItems.map((item) => (item.id === id ? { ...item, ...patch } : item))
        );
    };

    const addTax = () =>
        setTaxes((currentTaxes) => [
            ...currentTaxes,
            { id: crypto.randomUUID(), name: 'Nuevo Impuesto', percentage: 0 },
        ]);
    const removeTax = (id: string) =>
        setTaxes((currentTaxes) => currentTaxes.filter((tax) => tax.id !== id));
    const updateTax = (id: string, field: keyof TaxItem, value: string | number) => {
        setTaxes((currentTaxes) =>
            currentTaxes.map((tax) => (tax.id === id ? { ...tax, [field]: value } : tax))
        );
    };

    const math = computeQuoteMath(items, taxes, globalDiscount);

    return {
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
        math,
    };
}
