import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Validates MercadoPago webhook x-signature.
 * Configure MERCADOPAGO_WEBHOOK_SECRET from the app's Webhooks secret in MP panel.
 * Docs: https://www.mercadopago.com.ar/developers/en/docs/your-integrations/notifications/webhooks
 */
export function verifyMercadoPagoWebhookSignature(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error('MERCADOPAGO_WEBHOOK_SECRET is not configured.');
    return false;
  }

  const { xSignature, xRequestId, dataId } = params;
  if (!xSignature || !xRequestId || !dataId) {
    return false;
  }

  const parts = Object.fromEntries(
    xSignature.split(',').map((part) => {
      const [key, ...rest] = part.trim().split('=');
      return [key, rest.join('=')];
    })
  );

  const timestamp = parts.ts;
  const hash = parts.v1;
  if (!timestamp || !hash) {
    return false;
  }

  const manifestId = /[a-zA-Z]/.test(dataId)
    ? dataId.toLowerCase()
    : dataId;
  const manifest = `id:${manifestId};request-id:${xRequestId};ts:${timestamp};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');

  try {
    const expectedBuffer = Buffer.from(expected, 'hex');
    const receivedBuffer = Buffer.from(hash, 'hex');
    if (expectedBuffer.length !== receivedBuffer.length) {
      return false;
    }
    return timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch {
    return false;
  }
}
