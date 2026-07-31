/**
 * MercadoPago Checkout Pro helpers.
 *
 * Required env:
 * - MERCADOPAGO_ACCESS_TOKEN — production token on Production; test token on Preview
 * - MERCADOPAGO_WEBHOOK_SECRET — Webhooks signing secret from MP panel
 * - NEXT_PUBLIC_APP_URL / PUBLIC_APP_URL — site origin
 * - MERCADOPAGO_BACK_URL_BASE — optional public HTTPS origin for back_urls
 *   and webhooks (use on localhost; MP rejects localhost in back_urls)
 * - MERCADOPAGO_SANDBOX=true — marks intentional test mode (e.g. Production
 *   while the store is not public). Does NOT switch to sandbox_init_point:
 *   that URL is deprecated and causes ERR_TOO_MANY_REDIRECTS. Always use
 *   init_point; test Access Tokens already open the test checkout.
 *
 * Panel setup: Your integrations → Webhooks → URL
 *   {NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago
 * Subscribe to payment events.
 */
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

function getAccessToken() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not configured.');
  }
  return accessToken;
}

export function getMercadoPagoClient() {
  return new MercadoPagoConfig({ accessToken: getAccessToken() });
}

export function getAppBaseUrl() {
  const candidates = [
    // Local/dev: public HTTPS origin for MP back_urls (localhost is rejected by MP).
    process.env.MERCADOPAGO_BACK_URL_BASE,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.PUBLIC_APP_URL,
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
      : undefined,
  ];

  for (const candidate of candidates) {
    const normalized = candidate?.trim().replace(/\/$/, '');
    if (!normalized) {
      continue;
    }
    try {
      const url = new URL(
        normalized.includes('://') ? normalized : `https://${normalized}`
      );
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return `${url.protocol}//${url.host}`;
      }
    } catch {
      // try next candidate
    }
  }

  return 'http://localhost:3000';
}

export function shouldUseMercadoPagoSandbox() {
  const sandboxFlag = process.env.MERCADOPAGO_SANDBOX?.trim().toLowerCase();
  if (sandboxFlag === 'true' || sandboxFlag === '1') {
    return true;
  }
  if (sandboxFlag === 'false' || sandboxFlag === '0') {
    return false;
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? '';
  // Legacy test tokens. Newer MP test credentials often use APP_USR- too.
  if (accessToken.startsWith('TEST-')) {
    return true;
  }

  // On Vercel Production default to live checkout; elsewhere prefer sandbox.
  if (process.env.VERCEL_ENV === 'production') {
    return false;
  }

  return process.env.NODE_ENV !== 'production';
}

/**
 * Guard when Production is accidentally configured for live checkout
 * with classic TEST- tokens (always sandbox). Intentional sandbox testing
 * on Production (MERCADOPAGO_SANDBOX=true) is allowed while the store is
 * not public — use MP test buyer accounts to pay.
 */
export function getMercadoPagoProductionConfigError(): string | null {
  if (process.env.VERCEL_ENV !== 'production') {
    return null;
  }

  // Explicit sandbox on Production = intentional test mode.
  if (shouldUseMercadoPagoSandbox()) {
    return null;
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? '';
  if (accessToken.startsWith('TEST-')) {
    return 'El pago online no está disponible: hay un token de prueba con checkout real. Activá MERCADOPAGO_SANDBOX o usá credenciales de producción.';
  }

  return null;
}

/** MP Preference API: items.description max length. */
const MERCADOPAGO_ITEM_DESCRIPTION_MAX_LENGTH = 256;

export type CreateStorePreferenceItem = {
  id: string;
  title: string;
  /** Plain-text item description for MP fraud validation (max 256). */
  description: string;
  quantity: number;
  unitPrice: number;
};

/**
 * Builds a Mercado Pago item description (max 256 chars).
 * Prefer the product description; fall back to a short typed label + title.
 */
export function buildMercadoPagoItemDescription(input: {
  title: string;
  description?: string | null;
  productType?: 'product' | 'design';
}): string {
  const stripped = (input.description ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (stripped) {
    return stripped.slice(0, MERCADOPAGO_ITEM_DESCRIPTION_MAX_LENGTH);
  }

  const title = input.title.trim() || 'Artículo';
  const prefix =
    input.productType === 'design'
      ? 'Diseño digital para impresión 3D'
      : 'Producto de impresión 3D';
  const fallback = `${prefix}: ${title}`;
  return fallback.slice(0, MERCADOPAGO_ITEM_DESCRIPTION_MAX_LENGTH);
}

export type CreateStorePreferenceInput = {
  orderId: string;
  items: CreateStorePreferenceItem[];
  currencyId: string;
  buyerEmail?: string;
  buyerName?: string;
};

export async function createStoreCheckoutPreference(
  input: CreateStorePreferenceInput
) {
  const productionConfigError = getMercadoPagoProductionConfigError();
  if (productionConfigError) {
    throw new Error(productionConfigError);
  }

  if (!input.items.length) {
    throw new Error('La preferencia de pago no tiene ítems.');
  }

  const client = getMercadoPagoClient();
  const preference = new Preference(client);
  const baseUrl = getAppBaseUrl();
  const useSandbox = shouldUseMercadoPagoSandbox();

  // In sandbox, never prefill a real buyer identity — mixing a live MP account
  // email with test credentials causes "parte de prueba" / redirect loops.
  const payer =
    !useSandbox && (input.buyerEmail || input.buyerName)
      ? {
          ...(input.buyerEmail ? { email: input.buyerEmail } : {}),
          ...(input.buyerName ? { name: input.buyerName } : {}),
        }
      : undefined;

  const backUrls = {
    success: `${baseUrl}/store/checkout/success?order=${input.orderId}`,
    pending: `${baseUrl}/store/checkout/pending?order=${input.orderId}`,
    failure: `${baseUrl}/store/checkout/failure?order=${input.orderId}`,
  };

  const result = await preference.create({
    body: {
      external_reference: input.orderId,
      items: input.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: buildMercadoPagoItemDescription({
          title: item.title,
          description: item.description,
        }),
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: input.currencyId,
      })),
      ...(payer ? { payer } : {}),
      back_urls: backUrls,
      // auto_return requires valid public https back_urls; skip on localhost.
      ...(baseUrl.startsWith('https://')
        ? { auto_return: 'approved' as const }
        : {}),
      notification_url: `${baseUrl}/api/webhooks/mercadopago?source_news=webhooks`,
      metadata: {
        store_order_id: input.orderId,
      },
    },
  });

  // Always use init_point. sandbox_init_point is deprecated and causes
  // ERR_TOO_MANY_REDIRECTS on sandbox.mercadopago.com.ar. With test
  // credentials (APP_USR- / TEST-), init_point already opens the test flow.
  const checkoutUrl = result.init_point;

  if (!result.id || !checkoutUrl) {
    throw new Error('MercadoPago preference did not return a checkout URL.');
  }

  return {
    preferenceId: String(result.id),
    checkoutUrl,
  };
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const client = getMercadoPagoClient();
  const payment = new Payment(client);
  return payment.get({ id: paymentId });
}
