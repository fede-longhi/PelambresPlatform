import type { CustomerType } from '@/types/definitions';
import type { QuoteItem, QuoteItemCalculatorParams, TaxItem } from '@/types/quote';

export const QUOTE_DOCUMENT_STATUSES = [
  'draft',
  'sent',
  'accepted',
  'rejected',
  'superseded',
] as const;

export type QuoteDocumentStatus = (typeof QUOTE_DOCUMENT_STATUSES)[number];

export type QuoteDocumentListItem = {
  id: string;
  quoteNumber: number;
  revision: number;
  status: QuoteDocumentStatus;
  quoteDate: string;
  clientName: string;
  clientEmail: string;
  totalCents: number;
  customerId: string;
  orderId?: string | null;
  orderTrackingCode?: string | null;
};

export type QuoteDocumentDetail = {
  id: string;
  quoteNumber: number;
  revision: number;
  status: QuoteDocumentStatus;
  customerId: string;
  quoteRequestId: string | null;
  quoteDate: string;
  companyName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientType: CustomerType;
  notes: string;
  globalDiscountPercent: number;
  showQuoteNumber: boolean;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
  taxes: TaxItem[];
  orderId: string | null;
  orderTrackingCode: string | null;
  familyOrderId: string | null;
  familyOrderQuoteId: string | null;
  familyOrderTrackingCode: string | null;
};

export type QuoteRevisionSummary = {
  id: string;
  revision: number;
  status: QuoteDocumentStatus;
  totalCents: number;
  quoteDate: string;
};

export type QuoteDocumentSaveItem = {
  description: string;
  quantity: number;
  price: number;
  discount: number;
  calculatorParams?: QuoteItemCalculatorParams;
};

export type QuoteDocumentSaveTax = {
  name: string;
  percentage: number;
};

export type QuoteDocumentSaveInput = {
  id?: string;
  customerId: string;
  quoteRequestId?: string | null;
  date: string;
  companyName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientType: CustomerType;
  notes: string;
  globalDiscount: number;
  showQuoteNumber: boolean;
  items: QuoteDocumentSaveItem[];
  taxes: QuoteDocumentSaveTax[];
};

export type QuoteDocumentSaveResult = {
  success: boolean;
  message?: string;
  id?: string;
  quoteNumber?: number;
  revision?: number;
  errors?: {
    customerId?: string[];
    clientName?: string[];
    items?: string[];
  };
};
