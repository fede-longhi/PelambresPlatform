export type QuoteItemCalculatorParams = {
    materialCostPerKg: number;
    partWeightGrams: number;
    machineCostPerHour: number;
    printTimeH: number;
    printTimeM: number;
    laborCostPerHour: number;
    laborTimeH: number;
    laborTimeM: number;
    extraMaterialsCost: number;
    markupPercentage: number;
    discountPercentage: number;
};

export type QuoteItem = {
    id: string;
    description: string;
    quantity: number;
    price: number;
    discount: number;
    calculatorParams?: QuoteItemCalculatorParams;
};

export type TaxItem = {
    id: string;
    name: string;
    percentage: number;
};

export type QuoteData = {
    quoteNumber: string;
    showQuoteNumber: boolean;
    date: string;
    companyName: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientAddress: string;
    notes: string;
};

export type QuoteBuilderState = {
    meta: QuoteData;
    items: QuoteItem[];
    taxes: TaxItem[];
    globalDiscount: number;
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