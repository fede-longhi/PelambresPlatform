// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.

import { OrderStatus } from "./order-definitions";

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    image_url: string;
    role: string;
};

export type Invoice = {
    id: string;
    customer_id: string;
    amount: number;
    date: string;
    status: 'pending' | 'paid';
};

export type Revenue = {
    month: string;
    revenue: number;
};

export type LatestInvoice = {
    id: string;
    name: string;
    image_url: string;
    email: string;
    amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
    amount: number;
};

export type InvoicesTable = {
    id: string;
    customer_id: string;
    name: string;
    email: string;
    image_url: string;
    date: string;
    amount: number;
    status: 'pending' | 'paid';
};

export type CustomersTableType = {
    id: string;
    name: string;
    email: string;
    image_url: string;
    total_invoices: number;
    total_pending: number;
    total_paid: number;
};

export type FormattedCustomersTable = {
    id: string;
    name: string;
    email: string;
    image_url: string;
    total_invoices: number;
    total_pending: string;
    total_paid: string;
};

export type CustomerField = {
    id: string;
    name: string;
};

export type InvoiceForm = {
    id: string;
    customer_id: string;
    amount: number;
    status: 'pending' | 'paid';
};

export type Quote = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    detail: string;
}

export type QuoteTable = {
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    phone: string;
    detail: string;
    date: string;
}

export type CustomerType = 'business' | 'person';

export type Customer = {
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    type: CustomerType;
    email: string;
    phone: string;
}

export type OrderTable = {
    id: string;
    created_date: string,
    estimated_date: string,
    status: OrderStatus,
    tracking_code: string,
    amount: number,
    customer_id: string,
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    name: string,
    customer_type: CustomerType 
}

export type Order = {
    id: string,
    created_date: string,
    estimated_date: string,
    status: OrderStatus,
    tracking_code: string,
    amount: number,
    customer_id: string,
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    name: string,
    customer_type: CustomerType
}

export type OrdersSummary = {
    total_amount: number;
}

export type PrintJobStatus = 'pending' | 'printing' | 'postprocess' | 'finished' | 'failed';

export type PrintJob = {
    id: string,
    name: string,
    status: PrintJobStatus,
    estimated_printing_time: number,
    order_id: string,
    started_at: string,
    finished_at: string,
}

export type PrintJobWithGcode = {
    id: string,
    name: string,
    status: PrintJobStatus,
    estimated_printing_time: number,
    order_id: string,
    started_at: string,
    finished_at: string,
    gcode_filename: string,
    gcode_path: string,
    gcode_mime_type: string,
    gcode_size: number,
    gcode_uploaded_at: string
}

export type GCodeInfo = {
    hotendTemps?: number[],
    bedTemps?: number[],
    estimatedTimeSec?: number,
};

export type FileData = {
    id?: string;
    filename: string;
    path: string;
    mime_type: string;
    size: number;
    metadata?: object;
    hash?: string;
};

export type PrintJobModelFile = {
    id: string;
    filename: string;
    path: string;
    mime_type: string;
    size: number;
    uploaded_at: string;
    name: string;
};

export type ConfigurationVariable = {
    id: string;
    key: string;
    value: string | null;
    data_type: string | null;
    created_at: string;
    last_modified: string;
    category: string | null;
    description: string | null;
}

export type PrinterStatus = 'available' | 'maintenance' | 'offline' | 'printing';

export type Printer = {
    id: string;
    name: string;
    brand: string | null;
    model: string | null;
    power_consumption: number | null;
    size_x: number | null;
    size_y: number | null;
    size_z: number | null;
    status: PrinterStatus | null;
};

export type Filament = {
    id: string;
    type: string;
    brand: string;
    price_per_kg: number;
};

/* *** Quote *** */

export type BudgetItem = {
    id: string;
    name: string;
    quantity: number;
    individualPrice: number;
    totalPrice: number;
    discount: number;
};

export type QuoteInfo = {
    date: Date | undefined;
    quoteValidity: string;
    client: Client;
    sender: Sender;
}

export type Client = {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
}

export type Sender = {
    name?: string;
    completeName?: string;
    address?: string;
    email?: string;
    phone?: string;
    url?: string;
}