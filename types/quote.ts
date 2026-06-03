export type QuoteItem = {
    id: string;
    description: string;
    quantity: number;
    price: number;
    discount: number;
};

export type TaxItem = {
    id: string;
    name: string;
    percentage: number;
};

export type QuoteData = {
    quoteNumber: string;
    date: string;
    companyName: string;
    clientName: string;
    clientEmail: string;
    notes: string;
};

export type QuoteMath = {
    itemsSubtotal: number;
    globalDiscountAmount: number;
    taxableSubtotal: number;
    calculatedTaxes: (TaxItem & { amount: number })[];
    totalTaxes: number;
    total: number;
    getItemTotal: (item: QuoteItem) => number;
};