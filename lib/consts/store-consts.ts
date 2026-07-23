import type {
  StoreOrderStatus,
  StoreProductType,
} from '@/types/store-definitions';

export const STORE_PRODUCT_TYPES = [
  { value: 'product' as const, label: 'Artículos' },
  { value: 'design' as const, label: 'Diseños' },
] as const;

export const STORE_CURRENCIES = [
  { value: 'ARS', label: 'ARS' },
  { value: 'USD', label: 'USD' },
] as const;

/** Shown to buyers of physical products until shipping exists. */
export const PRODUCT_FULFILLMENT_MESSAGE =
  'Retiro / coordinación por WhatsApp o mail. No se pide dirección de envío.';

/** @deprecated Use PRODUCT_FULFILLMENT_MESSAGE */
export const READY_PRODUCT_FULFILLMENT_MESSAGE = PRODUCT_FULFILLMENT_MESSAGE;

export const STORE_CONTACT_EMAIL = 'pelambres3d@gmail.com';
export const STORE_WHATSAPP_NUMBER = '5491158928659';

export const STORE_TYPE_PATHS = {
  product: 'products',
  design: 'designs',
} as const;

export const STORE_FEATURED_LIMIT = 4;

export function getStoreTypePath(productType: StoreProductType): string {
  return STORE_TYPE_PATHS[productType];
}

export function getStoreCatalogHref(productType: StoreProductType): string {
  return `/store/${getStoreTypePath(productType)}`;
}

export function getStoreProductHref(
  productType: StoreProductType,
  productId: string
): string {
  return `${getStoreCatalogHref(productType)}/${productId}`;
}

export function parseStoreTypeFromPath(
  pathSegment: string
): StoreProductType | null {
  if (pathSegment === STORE_TYPE_PATHS.product) {
    return 'product';
  }
  if (pathSegment === STORE_TYPE_PATHS.design) {
    return 'design';
  }
  return null;
}

export function buildStoreWhatsAppUrl(productName: string): string {
  const text = encodeURIComponent(
    `Hola! Quiero coordinar la compra de "${productName}" en la tienda.`
  );
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${text}`;
}

export const STORE_PRODUCTS_FOLDER = 'store-products';
export const STORE_PRODUCT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const STORE_PRODUCT_IMAGE_MAX_COUNT = 8;
export const STORE_PRODUCT_FILE_MAX_SIZE_BYTES = 80 * 1024 * 1024;

export const STORE_PRODUCT_IMAGE_ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
]);

export const STORE_PRODUCT_FILE_ALLOWED_EXTENSIONS = new Set([
  'stl',
  '3mf',
  'obj',
  'zip',
  'rar',
  '7z',
  'step',
  'stp',
]);

export const STORE_PRODUCT_TAG_MAX_LENGTH = 40;
export const STORE_PRODUCT_TAG_MAX_COUNT = 20;

/** Normalize free-text product tags: trim, collapse spaces, dedupe (case-insensitive). */
export function normalizeStoreTags(rawTags: string[]): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const rawTag of rawTags) {
    const tag = rawTag.trim().replace(/\s+/g, ' ');
    if (!tag) {
      continue;
    }
    if (tag.length > STORE_PRODUCT_TAG_MAX_LENGTH) {
      continue;
    }
    const key = tag.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    normalized.push(tag);
    if (normalized.length >= STORE_PRODUCT_TAG_MAX_COUNT) {
      break;
    }
  }

  return normalized;
}

export function getStoreProductTypeLabel(productType: StoreProductType): string {
  return (
    STORE_PRODUCT_TYPES.find((entry) => entry.value === productType)?.label ??
    productType
  );
}

export function formatStorePrice(priceCents: number, currency: string): string {
  const amount = priceCents / 100;
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function hasStoreDiscount(discountPercent: number | null | undefined): boolean {
  return typeof discountPercent === 'number' && discountPercent > 0 && discountPercent <= 100;
}

export function getStoreFinalPriceCents(
  priceCents: number,
  discountPercent: number | null | undefined
): number {
  if (!hasStoreDiscount(discountPercent)) {
    return priceCents;
  }

  return Math.round((priceCents * (100 - discountPercent!)) / 100);
}

export function formatStoreDiscountLabel(discountPercent: number): string {
  return `-${discountPercent}%`;
}

export const STORE_ORDER_STATUSES = [
  { value: 'pending' as const, label: 'Pendiente' },
  { value: 'paid' as const, label: 'Pagado' },
  { value: 'failed' as const, label: 'Fallido' },
  { value: 'cancelled' as const, label: 'Cancelado' },
  { value: 'refunded' as const, label: 'Reembolsado' },
] as const;

export function getStoreOrderStatusLabel(status: StoreOrderStatus): string {
  return (
    STORE_ORDER_STATUSES.find((entry) => entry.value === status)?.label ??
    status
  );
}

export function getStoreCheckoutSuccessHref(orderId: string): string {
  return `/store/checkout/success?order=${orderId}`;
}

export function getStoreCheckoutPendingHref(orderId: string): string {
  return `/store/checkout/pending?order=${orderId}`;
}

export function getStoreCheckoutFailureHref(orderId: string): string {
  return `/store/checkout/failure?order=${orderId}`;
}
