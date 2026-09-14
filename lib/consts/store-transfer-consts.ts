import {
  STORE_WHATSAPP_NUMBER,
  formatStorePrice,
} from '@/lib/consts/store-consts';

export const STORE_TRANSFER_RECEIPTS_FOLDER = 'store-orders/receipts';
export const STORE_TRANSFER_RECEIPT_MAX_SIZE_BYTES = 8 * 1024 * 1024;

export const STORE_TRANSFER_RECEIPT_ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'pdf',
]);

export type StoreTransferBankDetails = {
  holder: string;
  cbu: string | null;
  alias: string | null;
  bank: string | null;
  cuit: string | null;
};

function trimEnv(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getStoreTransferBankDetails(): StoreTransferBankDetails | null {
  const holder = trimEnv(process.env.STORE_TRANSFER_HOLDER);
  const cbu = trimEnv(process.env.STORE_TRANSFER_CBU);
  const alias = trimEnv(process.env.STORE_TRANSFER_ALIAS);
  const bank = trimEnv(process.env.STORE_TRANSFER_BANK);
  const cuit = trimEnv(process.env.STORE_TRANSFER_CUIT);

  if (!holder || (!cbu && !alias)) {
    return null;
  }

  return { holder, cbu, alias, bank, cuit };
}

export function isStoreTransferConfigured(): boolean {
  return getStoreTransferBankDetails() !== null;
}

/** Short concept code for the bank transfer (letters/digits only). */
export function buildStoreTransferReference(orderId: string): string {
  return orderId.replace(/-/g, '').slice(0, 8).toUpperCase();
}

export function getStoreTransferCheckoutHref(orderId: string): string {
  return `/store/checkout/transfer?order=${orderId}`;
}

export function buildStoreTransferWhatsAppUrl(input: {
  orderId: string;
  transferReference: string;
  totalCents: number;
  currency: string;
}): string {
  const amount = formatStorePrice(input.totalCents, input.currency);
  const text = encodeURIComponent(
    `Hola! Ya transferí el pedido ${input.transferReference} (${amount}). Pedido: ${input.orderId}`
  );
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${text}`;
}
