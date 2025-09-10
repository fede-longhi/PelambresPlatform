import { Customer, GCodeInfo, OrderTable, Revenue } from "@/app/lib/definitions";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
    });
};

export const formatDateToLocal = (
    dateStr: string,
    locale: string = 'en-US',
) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    };
    const formatter = new Intl.DateTimeFormat(locale, options);
    return formatter.format(date);
};

export const formatDateTimeToLocal = (
    dateStr: string,
    locale: string = 'en-US',
) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    const formatter = new Intl.DateTimeFormat(locale, options);
    return formatter.format(date);
};

export const generateYAxis = (revenue: Revenue[]) => {
    // Calculate what labels we need to display on the y-axis
    // based on highest record and in 1000s
    const yAxisLabels = [];
    const highestRecord = Math.max(...revenue.map((month) => month.revenue));
    const topLabel = Math.ceil(highestRecord / 1000) * 1000;

    for (let i = topLabel; i >= 0; i -= 1000) {
        yAxisLabels.push(`$${i / 1000}K`);
    }

    return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
    // If the total number of pages is 7 or less,
    // display all pages without any ellipsis.
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // If the current page is among the first 3 pages,
    // show the first 3, an ellipsis, and the last 2 pages.
    if (currentPage <= 3) {
        return [1, 2, 3, '...', totalPages - 1, totalPages];
    }

    // If the current page is among the last 3 pages,
    // show the first 2, an ellipsis, and the last 3 pages.
    if (currentPage >= totalPages - 2) {
        return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    // If the current page is somewhere in the middle,
    // show the first page, an ellipsis, the current page and its neighbors,
    // another ellipsis, and the last page.
    return [
        1,
        '...',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        '...',
        totalPages,
    ];
};

export async function calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function secondsToTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export async function getGcodeInfo(gcode : File) {
    const fileContent = await gcode.text();
    const lines = fileContent.split('\n');
    const info: GCodeInfo = {
        hotendTemps: [],
        bedTemps: [],
    };

    for (const line of lines) {
        const cleanLine = line.trim();

        if (cleanLine.startsWith(';TIME:')) {
        info.estimatedTimeSec = parseInt(cleanLine.split(':')[1]);
        }

        if (cleanLine.startsWith('M104') || cleanLine.startsWith('M109')) {
        const match = cleanLine.match(/S(\d+\.?\d*)/);
        if (match && info.hotendTemps) info.hotendTemps.push(parseFloat(match[1]));
        }

        if (cleanLine.startsWith('M140') || cleanLine.startsWith('M190')) {
        const match = cleanLine.match(/S(\d+\.?\d*)/);
        if (match && info.bedTemps) info.bedTemps.push(parseFloat(match[1]));
        }
    }

    return info;
}

export function generateCode(chars : string, codeLength : number) {
    let codigo = '';
    for (let i = 0; i < codeLength; i++) {
        codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
}

export function getCustomerName(customer: Customer) {
    return customer.type === 'person' ? customer.last_name + ", " + customer.first_name : customer.name;
}

export function getOrderCustomerName(order: OrderTable) {
    return order.customer_type === 'person' ? order.last_name + ", " + order.first_name : order.name;
}

export function dateLongStringToString(dateLongString: string) {
    const date = new Date(dateLongString);
    
    const dateString = date.getFullYear() + "-" + 
    String(date.getMonth() + 1).padStart(2, "0") + "-" + 
    String(date.getDate()).padStart(2, "0");

    return dateString;
}

export function getMonthNameFromDate(date: Date) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[date.getMonth()];
}