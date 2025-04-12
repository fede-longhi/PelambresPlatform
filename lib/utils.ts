import { Customer, GCodeInfo, OrderTable } from "@/app/lib/definitions";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
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

export function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}