/**
 * MercadoPago Checkout Pro helpers.
 *
 * Required env:
 * - MERCADOPAGO_ACCESS_TOKEN — production token on Production; test token on Preview
 * - MERCADOPAGO_WEBHOOK_SECRET — Webhooks signing secret from MP panel
 * - NEXT_PUBLIC_APP_URL — public site origin (back_urls + notification_url)
 * - MERCADOPAGO_SANDBOX=true — force sandbox checkout (Preview / test only).
 *   On Production with real buyers this must be false and the access token
 *   must be a production credential — otherwise MP shows
 *   "una de las partes … es de prueba".
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

export type CreateStorePreferenceInput = {
  orderId: string;
  title: string;
  quantity: number;
  unitPrice: number;
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
      items: [
        {
          id: input.orderId,
          title: input.title,
          quantity: input.quantity,
          unit_price: input.unitPrice,
          currency_id: input.currencyId,
        },
      ],
      ...(payer ? { payer } : {}),
      back_urls: backUrls,
      // auto_return requires valid public https back_urls; skip on localhost.
      ...(baseUrl.startsWith('https://') ? { auto_return: 'approved' as const } : {}),
      notification_url: `${baseUrl}/api/webhooks/mercadopago?source_news=webhooks`,
      metadata: {
        store_order_id: input.orderId,
      },
    },
  });

  const checkoutUrl = useSandbox
    ? result.sandbox_init_point || result.init_point
    : result.init_point;

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
