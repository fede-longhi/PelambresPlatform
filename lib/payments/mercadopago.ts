/**
 * MercadoPago Checkout Pro helpers.
 *
 * Required env:
 * - MERCADOPAGO_ACCESS_TOKEN — test or production access token
 * - MERCADOPAGO_WEBHOOK_SECRET — Webhooks signing secret from MP panel
 * - NEXT_PUBLIC_APP_URL — public site origin (back_urls + notification_url)
 * - MERCADOPAGO_SANDBOX=true — force sandbox checkout (needed when test
 *   credentials also use APP_USR- prefix; ignore in real production)
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
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (explicit) {
    return explicit;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
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

  return process.env.NODE_ENV !== 'production';
}

export type CreateStorePreferenceInput = {
  orderId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  currencyId: string;
  buyerEmail: string;
  buyerName: string;
};

export async function createStoreCheckoutPreference(
  input: CreateStorePreferenceInput
) {
  const client = getMercadoPagoClient();
  const preference = new Preference(client);
  const baseUrl = getAppBaseUrl();

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
      payer: {
        email: input.buyerEmail,
        name: input.buyerName,
      },
      back_urls: {
        success: `${baseUrl}/store/checkout/success?order=${input.orderId}`,
        pending: `${baseUrl}/store/checkout/pending?order=${input.orderId}`,
        failure: `${baseUrl}/store/checkout/failure?order=${input.orderId}`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/webhooks/mercadopago?source_news=webhooks`,
      metadata: {
        store_order_id: input.orderId,
      },
    },
  });

  const checkoutUrl = shouldUseMercadoPagoSandbox()
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
