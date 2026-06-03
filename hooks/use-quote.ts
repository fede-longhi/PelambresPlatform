import { useState } from 'react';
import { QuoteData, QuoteItem, TaxItem, QuoteMath } from '@/types/quote';

export function useQuote() {
    const [meta, setMeta] = useState<QuoteData>({
        quoteNumber: '0000001',
        date: new Date().toISOString().split('T')[0],
        companyName: 'Pelambres 3D',
        clientName: '',
        clientEmail: '',
        notes: 'Validez del presupuesto: 15 días. Pago por transferencia bancaria.',
    });

    const [items, setItems] = useState<QuoteItem[]>([
        { id: crypto.randomUUID(), description: 'Impresión 3D - Pieza Mecánica (PLA)', quantity: 1, price: 5000, discount: 0 }
    ]);

    const [taxes, setTaxes] = useState<TaxItem[]>([
        { id: crypto.randomUUID(), name: 'IVA', percentage: 21 }
    ]);

    const [globalDiscount, setGlobalDiscount] = useState<number>(0);

    const addItem = () => setItems([...items, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0, discount: 0 }]);
    const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));
    const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addTax = () => setTaxes([...taxes, { id: crypto.randomUUID(), name: 'Nuevo Impuesto', percentage: 0 }]);
    const removeTax = (id: string) => setTaxes(taxes.filter(tax => tax.id !== id));
    const updateTax = (id: string, field: keyof TaxItem, value: string | number) => {
        setTaxes(taxes.map(tax => tax.id === id ? { ...tax, [field]: value } : tax));
    };

    const getItemTotal = (item: QuoteItem) => (item.quantity * item.price) * (1 - (item.discount / 100));
    const itemsSubtotal = items.reduce((acc, item) => acc + getItemTotal(item), 0);
    const globalDiscountAmount = itemsSubtotal * (globalDiscount / 100);
    const taxableSubtotal = itemsSubtotal - globalDiscountAmount;
    
    const calculatedTaxes = taxes.map(tax => ({
        ...tax,
        amount: taxableSubtotal * (tax.percentage / 100)
    }));
    
    const totalTaxes = calculatedTaxes.reduce((acc, tax) => acc + tax.amount, 0);
    const total = taxableSubtotal + totalTaxes;

    const math: QuoteMath = {
        itemsSubtotal, globalDiscountAmount, taxableSubtotal, calculatedTaxes, totalTaxes, total, getItemTotal
    };

    return {
        meta, setMeta,
        items, addItem, removeItem, updateItem,
        taxes, addTax, removeTax, updateTax,
        globalDiscount, setGlobalDiscount,
        math
    };
}