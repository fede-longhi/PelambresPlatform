import type { PrinterStatus } from '@/types/definitions';

export const PRINTER_STATUS_LABELS: Record<PrinterStatus, string> = {
  available: 'Disponible',
  maintenance: 'Mantenimiento',
  offline: 'Fuera de línea',
  printing: 'Imprimiendo',
};

export function getPrinterStatusLabel(status: string | null): string {
  if (!status) {
    return '—';
  }

  return PRINTER_STATUS_LABELS[status as PrinterStatus] ?? status;
}
