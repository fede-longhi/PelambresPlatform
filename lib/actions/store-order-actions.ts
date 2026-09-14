'use server';

import { revalidatePath } from 'next/cache';
import sql from '@/lib/db';
import { requireAdminSessionUserId } from '@/lib/auth/require-admin';
import { applyStorePaymentApproved } from '@/lib/actions/store-checkout-actions';
import { fetchStoreOrderById } from '@/lib/data/store-order-data';

export type StoreOrderAdminActionState = {
  message?: string | null;
  success?: boolean;
};

export async function markStoreOrderPaid(
  _prevState: StoreOrderAdminActionState,
  formData: FormData
): Promise<StoreOrderAdminActionState> {
  await requireAdminSessionUserId();

  const orderId = String(formData.get('orderId') ?? '');
  if (!orderId) {
    return { message: 'Pedido inválido.', success: false };
  }

  const order = await fetchStoreOrderById(orderId);
  if (!order) {
    return { message: 'Pedido no encontrado.', success: false };
  }

  if (order.status === 'paid') {
    return { message: 'El pedido ya estaba marcado como pagado.', success: true };
  }

  if (order.status !== 'pending' && order.status !== 'payment_review') {
    return {
      message: 'Este pedido no se puede marcar como pagado.',
      success: false,
    };
  }

  const result = await applyStorePaymentApproved({ orderId });
  if (!result.ok) {
    return { message: 'No se pudo marcar el pedido como pagado.', success: false };
  }

  revalidatePath('/admin/store-orders');
  revalidatePath(`/admin/store-orders/${orderId}`);
  revalidatePath('/store/checkout/transfer');

  return { message: 'Pedido marcado como pagado.', success: true };
}

export async function cancelStoreOrder(
  _prevState: StoreOrderAdminActionState,
  formData: FormData
): Promise<StoreOrderAdminActionState> {
  await requireAdminSessionUserId();

  const orderId = String(formData.get('orderId') ?? '');
  if (!orderId) {
    return { message: 'Pedido inválido.', success: false };
  }

  const order = await fetchStoreOrderById(orderId);
  if (!order) {
    return { message: 'Pedido no encontrado.', success: false };
  }

  if (order.status === 'paid') {
    return {
      message: 'No se puede cancelar un pedido ya pagado.',
      success: false,
    };
  }

  if (order.status === 'cancelled') {
    return { message: 'El pedido ya estaba cancelado.', success: true };
  }

  await sql`
    UPDATE store_orders
    SET
      status = 'cancelled',
      updated_at = NOW()
    WHERE id = ${orderId}
      AND status IN ('pending', 'payment_review', 'failed')
  `;

  revalidatePath('/admin/store-orders');
  revalidatePath(`/admin/store-orders/${orderId}`);
  revalidatePath('/store/checkout/transfer');

  return { message: 'Pedido cancelado.', success: true };
}
