'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import sql from '@/lib/db';
import { auth } from '@/auth';
import {
  getStoreCatalogHref,
  getStoreFinalPriceCents,
  getStoreProductHref,
} from '@/lib/consts/store-consts';
import { fetchCustomerIdForUser } from '@/lib/data/customer-portal-data';
import { fetchPublishedStoreProductById } from '@/lib/data/store-product-data';
import { fetchStoreOrderById } from '@/lib/data/store-order-data';
import { createStoreCheckoutPreference, getMercadoPagoProductionConfigError } from '@/lib/payments/mercadopago';

const CheckoutSchema = z.object({
  productId: z.string().uuid({ message: 'Producto inválido.' }),
  productType: z.enum(['product', 'design'], {
    message: 'Tipo de producto inválido.',
  }),
});

export type StoreCheckoutFormState = {
  errors?: {
    productId?: string[];
    productType?: string[];
  };
  message?: string | null;
  success?: boolean;
};

function toCheckoutError(
  message: string,
  formData: FormData,
  errors?: StoreCheckoutFormState['errors']
): StoreCheckoutFormState {
  return {
    message,
    errors,
    success: false,
  };
}

export async function createStoreCheckout(
  _prevState: StoreCheckoutFormState,
  formData: FormData
): Promise<StoreCheckoutFormState> {
  const validated = CheckoutSchema.safeParse({
    productId: formData.get('productId'),
    productType: formData.get('productType'),
  });

  if (!validated.success) {
    return toCheckoutError(
      'Revisá los datos del formulario.',
      formData,
      validated.error.flatten().fieldErrors
    );
  }

  const { productId, productType } = validated.data;

  const product = await fetchPublishedStoreProductById(productType, productId);
  if (!product || product.productType !== productType) {
    return toCheckoutError('El artículo no está disponible.', formData);
  }

  if (
    product.productType === 'product' &&
    (product.stock == null || product.stock <= 0)
  ) {
    return toCheckoutError('Este artículo no tiene stock disponible.', formData);
  }

  const mercadoPagoConfigError = getMercadoPagoProductionConfigError();
  if (mercadoPagoConfigError) {
    return toCheckoutError(mercadoPagoConfigError, formData);
  }

  const unitPriceCents = getStoreFinalPriceCents(
    product.priceCents,
    product.discountPercent
  );
  const quantity = 1;
  const lineTotalCents = unitPriceCents * quantity;

  let customerId: string | null = null;
  const session = await auth();
  const sessionUser = session?.user;
  if (sessionUser?.id && sessionUser.role === 'customer') {
    customerId = await fetchCustomerIdForUser(sessionUser.id);
  }

  // Buyer identity is collected by Mercado Pago; prefer session when present.
  const buyerName = sessionUser?.name?.trim() || 'Cliente';
  const buyerEmail =
    sessionUser?.email?.trim().toLowerCase() || 'checkout@pelambres.com.ar';

  let orderId: string;
  try {
    const orderRows = await sql<{ id: string }[]>`
      INSERT INTO store_orders (
        customer_id,
        buyer_email,
        buyer_name,
        status,
        currency,
        total_cents
      )
      VALUES (
        ${customerId},
        ${buyerEmail},
        ${buyerName},
        'pending',
        ${product.currency},
        ${lineTotalCents}
      )
      RETURNING id
    `;

    orderId = orderRows[0]?.id;
    if (!orderId) {
      throw new Error('Missing order id');
    }

    await sql`
      INSERT INTO store_order_items (
        order_id,
        product_id,
        product_type,
        name,
        unit_price_cents,
        discount_percent,
        quantity,
        line_total_cents
      )
      VALUES (
        ${orderId},
        ${product.id},
        ${product.productType},
        ${product.name},
        ${unitPriceCents},
        ${product.discountPercent},
        ${quantity},
        ${lineTotalCents}
      )
    `;
  } catch (error) {
    console.error(error);
    return toCheckoutError('No se pudo iniciar el checkout.', formData);
  }

  try {
    const preference = await createStoreCheckoutPreference({
      orderId,
      title: product.name,
      quantity,
      unitPrice: unitPriceCents / 100,
      currencyId: product.currency,
      buyerEmail:
        sessionUser?.email?.trim().toLowerCase() || undefined,
      buyerName: sessionUser?.name?.trim() || undefined,
    });

    await sql`
      UPDATE store_orders
      SET
        mp_preference_id = ${preference.preferenceId},
        updated_at = NOW()
      WHERE id = ${orderId}
    `;

    redirect(preference.checkoutUrl);
  } catch (error) {
    // Next.js redirect throws; rethrow
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      String((error as { digest?: string }).digest).startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }

    console.error(error);
    await sql`
      UPDATE store_orders
      SET
        status = 'failed',
        updated_at = NOW()
      WHERE id = ${orderId}
        AND status = 'pending'
    `;
    const message =
      error instanceof Error &&
      error.message.startsWith('El pago online')
        ? error.message
        : 'No se pudo conectar con Mercado Pago. Intentá de nuevo.';
    return toCheckoutError(message, formData);
  }
}

export async function applyStorePaymentApproved(params: {
  orderId: string;
  mpPaymentId: string;
}): Promise<{ ok: boolean; alreadyPaid?: boolean }> {
  const order = await fetchStoreOrderById(params.orderId);
  if (!order) {
    return { ok: false };
  }

  if (order.status === 'paid') {
    return { ok: true, alreadyPaid: true };
  }

  if (order.status !== 'pending') {
    return { ok: false };
  }

  const existingPayment = await sql<{ id: string }[]>`
    SELECT id
    FROM store_orders
    WHERE mp_payment_id = ${params.mpPaymentId}
    LIMIT 1
  `;
  if (existingPayment[0] && existingPayment[0].id !== params.orderId) {
    console.error('mp_payment_id already linked to another order');
    return { ok: false };
  }

  try {
    await sql.begin(async (tx) => {
      const updated = await tx<{ id: string }[]>`
        UPDATE store_orders
        SET
          status = 'paid',
          mp_payment_id = ${params.mpPaymentId},
          paid_at = NOW(),
          updated_at = NOW()
        WHERE id = ${params.orderId}
          AND status = 'pending'
        RETURNING id
      `;

      if (!updated[0]) {
        return;
      }

      for (const item of order.items) {
        if (item.productType !== 'product' || !item.productId) {
          continue;
        }
        await tx`
          UPDATE store_products
          SET
            stock = GREATEST(COALESCE(stock, 0) - ${item.quantity}, 0),
            updated_at = NOW()
          WHERE id = ${item.productId}
            AND product_type = 'product'
            AND deleted_at IS NULL
        `;
      }
    });
  } catch (error) {
    console.error(error);
    return { ok: false };
  }

  const item = order.items[0];
  if (item) {
    revalidatePath('/admin/store-orders');
    revalidatePath(`/admin/store-orders/${order.id}`);
    revalidatePath('/admin/products');
    revalidatePath('/store');
    revalidatePath(getStoreCatalogHref(item.productType));
    if (item.productId) {
      revalidatePath(getStoreProductHref(item.productType, item.productId));
      revalidatePath(`/admin/products/${item.productId}`);
    }
  }

  return { ok: true, alreadyPaid: false };
}

export async function applyStorePaymentRejected(orderId: string) {
  await sql`
    UPDATE store_orders
    SET
      status = 'failed',
      updated_at = NOW()
    WHERE id = ${orderId}
      AND status = 'pending'
  `;
  revalidatePath('/admin/store-orders');
  revalidatePath(`/admin/store-orders/${orderId}`);
}

export async function applyStorePaymentRefunded(params: {
  orderId: string;
  mpPaymentId: string;
}) {
  await sql`
    UPDATE store_orders
    SET
      status = 'refunded',
      mp_payment_id = COALESCE(mp_payment_id, ${params.mpPaymentId}),
      updated_at = NOW()
    WHERE id = ${params.orderId}
      AND status IN ('paid', 'pending')
  `;
  revalidatePath('/admin/store-orders');
  revalidatePath(`/admin/store-orders/${params.orderId}`);
}
