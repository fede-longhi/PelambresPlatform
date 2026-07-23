import { NextRequest, NextResponse } from 'next/server';
import {
  applyStorePaymentApproved,
  applyStorePaymentRefunded,
  applyStorePaymentRejected,
} from '@/lib/actions/store-checkout-actions';
import { fetchMercadoPagoPayment } from '@/lib/payments/mercadopago';
import { verifyMercadoPagoWebhookSignature } from '@/lib/payments/mercadopago-webhook';

export const runtime = 'nodejs';

type WebhookBody = {
  type?: string;
  action?: string;
  data?: { id?: string | number };
};

export async function POST(request: NextRequest) {
  let body: WebhookBody = {};
  try {
    body = (await request.json()) as WebhookBody;
  } catch {
    // MP sometimes sends query-only notifications
  }

  const topic =
    request.nextUrl.searchParams.get('type') ||
    request.nextUrl.searchParams.get('topic') ||
    body.type ||
    '';
  const dataId =
    request.nextUrl.searchParams.get('data.id') ||
    request.nextUrl.searchParams.get('id') ||
    (body.data?.id != null ? String(body.data.id) : null);

  const xSignature = request.headers.get('x-signature');
  const xRequestId = request.headers.get('x-request-id');

  const isValid = verifyMercadoPagoWebhookSignature({
    xSignature,
    xRequestId,
    dataId,
  });

  if (!isValid) {
    console.error('Invalid MercadoPago webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (!dataId) {
    return NextResponse.json({ ok: true });
  }

  const normalizedTopic = topic.toLowerCase();
  if (
    normalizedTopic &&
    normalizedTopic !== 'payment' &&
    !normalizedTopic.includes('payment')
  ) {
    return NextResponse.json({ ok: true });
  }

  try {
    const payment = await fetchMercadoPagoPayment(dataId);
    const orderId =
      (payment.external_reference as string | undefined) ||
      (payment.metadata?.store_order_id as string | undefined);

    if (!orderId) {
      console.error('Payment without store order reference', dataId);
      return NextResponse.json({ ok: true });
    }

    const status = String(payment.status ?? '');
    const mpPaymentId = String(payment.id ?? dataId);

    if (status === 'approved') {
      await applyStorePaymentApproved({ orderId, mpPaymentId });
    } else if (
      status === 'rejected' ||
      status === 'cancelled' ||
      status === 'charged_back'
    ) {
      await applyStorePaymentRejected(orderId);
    } else if (status === 'refunded') {
      await applyStorePaymentRefunded({ orderId, mpPaymentId });
    }
  } catch (error) {
    console.error('MercadoPago webhook processing error:', error);
    // Still 200 so MP does not retry forever on our bugs; log for ops.
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
