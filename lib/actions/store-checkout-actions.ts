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
import { fetchPublishedStoreProductById, fetchPublishedStoreProductsByIds } from '@/lib/data/store-product-data';
import { fetchStoreOrderById } from '@/lib/data/store-order-data';
import {
  buildMercadoPagoItemDescription,
  createStoreCheckoutPreference,
  getMercadoPagoProductionConfigError,
} from '@/lib/payments/mercadopago';

const CheckoutSchema = z.object({
  productId: z.string().uuid({ message: 'Producto inválido.' }),
  productType: z.enum(['product', 'design'], {
    message: 'Tipo de producto inválido.',
  }),
  quantity: z.coerce
    .number({ message: 'Cantidad inválida.' })
    .int({ message: 'Cantidad inválida.' })
    .min(1, { message: 'La cantidad mínima es 1.' })
    .max(99, { message: 'La cantidad máxima es 99.' })
    .default(1),
});

export type StoreCheckoutFormState = {
  errors?: {
    productId?: string[];
    productType?: string[];
    quantity?: string[];
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
    quantity: formData.get('quantity') || 1,
  });

  if (!validated.success) {
    return toCheckoutError(
      'Revisá los datos del formulario.',
      formData,
      validated.error.flatten().fieldErrors
    );
  }

  const { productId, productType, quantity } = validated.data;

  const product = await fetchPublishedStoreProductById(productType, productId);
  if (!product || product.productType !== productType) {
    return toCheckoutError('El artículo no está disponible.', formData);
  }

  if (
    product.productType === 'product' &&
    (product.stock == null || product.stock < quantity)
  ) {
    return toCheckoutError(
      product.stock == null || product.stock <= 0
        ? 'Este artículo no tiene stock disponible.'
        : `Solo hay ${product.stock} unidades disponibles.`,
      formData
    );
  }

  const mercadoPagoConfigError = getMercadoPagoProductionConfigError();
  if (mercadoPagoConfigError) {
    return toCheckoutError(mercadoPagoConfigError, formData);
  }

  const unitPriceCents = getStoreFinalPriceCents(
    product.priceCents,
    product.discountPercent
  );
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
      currencyId: product.currency,
      items: [
        {
          id: product.id,
          title: product.name,
          description: buildMercadoPagoItemDescription({
            title: product.name,
            description: product.description,
            productType: product.productType,
          }),
          quantity,
          unitPrice: unitPriceCents / 100,
        },
      ],
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

const CartCheckoutSchema = z.object({
  itemsJson: z.string().min(2, { message: 'El carrito está vacío.' }),
});

const CartLineSchema = z.object({
  productId: z.string().uuid(),
  productType: z.enum(['product', 'design']),
  quantity: z.number().int().min(1).max(99),
});

export type StoreCartCheckoutFormState = {
  message?: string | null;
  success?: boolean;
};

export async function createStoreCartCheckout(
  _prevState: StoreCartCheckoutFormState,
  formData: FormData
): Promise<StoreCartCheckoutFormState> {
  const validated = CartCheckoutSchema.safeParse({
    itemsJson: formData.get('itemsJson'),
  });

  if (!validated.success) {
    return {
      message: 'El carrito está vacío o es inválido.',
      success: false,
    };
  }

  let parsedLines: unknown;
  try {
    parsedLines = JSON.parse(validated.data.itemsJson);
  } catch {
    return { message: 'No se pudo leer el carrito.', success: false };
  }

  const linesResult = z.array(CartLineSchema).min(1).safeParse(parsedLines);
  if (!linesResult.success) {
    return { message: 'El carrito tiene ítems inválidos.', success: false };
  }

  const mercadoPagoConfigError = getMercadoPagoProductionConfigError();
  if (mercadoPagoConfigError) {
    return { message: mercadoPagoConfigError, success: false };
  }

  const merged = new Map<
    string,
    { productId: string; productType: 'product' | 'design'; quantity: number }
  >();
  for (const line of linesResult.data) {
    const key = `${line.productType}:${line.productId}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + line.quantity);
    } else {
      merged.set(key, { ...line });
    }
  }
  const cartLines = Array.from(merged.values());

  const products = await fetchPublishedStoreProductsByIds(
    cartLines.map((line) => line.productId)
  );
  const productByKey = new Map(
    products.map((product) => [
      `${product.productType}:${product.id}`,
      product,
    ])
  );

  type ResolvedLine = {
    productId: string;
    productType: 'product' | 'design';
    name: string;
    description: string | null;
    unitPriceCents: number;
    discountPercent: number | null;
    quantity: number;
    lineTotalCents: number;
    currency: string;
  };

  const resolvedLines: ResolvedLine[] = [];

  for (const line of cartLines) {
    const key = `${line.productType}:${line.productId}`;
    const product = productByKey.get(key);
    if (!product) {
      return {
        message: 'Uno de los artículos ya no está disponible.',
        success: false,
      };
    }

    if (
      product.productType === 'product' &&
      (product.stock == null || product.stock < line.quantity)
    ) {
      return {
        message: `No hay stock suficiente de "${product.name}".`,
        success: false,
      };
    }

    const unitPriceCents = getStoreFinalPriceCents(
      product.priceCents,
      product.discountPercent
    );
    resolvedLines.push({
      productId: product.id,
      productType: product.productType,
      name: product.name,
      description: product.description,
      unitPriceCents,
      discountPercent: product.discountPercent,
      quantity: line.quantity,
      lineTotalCents: unitPriceCents * line.quantity,
      currency: product.currency,
    });
  }

  const currencies = new Set(resolvedLines.map((line) => line.currency));
  if (currencies.size !== 1) {
    return {
      message: 'No se pueden combinar monedas distintas en el mismo pedido.',
      success: false,
    };
  }
  const currency = resolvedLines[0].currency;
  const totalCents = resolvedLines.reduce(
    (sum, line) => sum + line.lineTotalCents,
    0
  );

  let customerId: string | null = null;
  const session = await auth();
  const sessionUser = session?.user;
  if (sessionUser?.id && sessionUser.role === 'customer') {
    customerId = await fetchCustomerIdForUser(sessionUser.id);
  }

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
        ${currency},
        ${totalCents}
      )
      RETURNING id
    `;

    orderId = orderRows[0]?.id;
    if (!orderId) {
      throw new Error('Missing order id');
    }

    for (const line of resolvedLines) {
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
          ${line.productId},
          ${line.productType},
          ${line.name},
          ${line.unitPriceCents},
          ${line.discountPercent},
          ${line.quantity},
          ${line.lineTotalCents}
        )
      `;
    }
  } catch (error) {
    console.error(error);
    return { message: 'No se pudo iniciar el checkout.', success: false };
  }

  try {
    const preference = await createStoreCheckoutPreference({
      orderId,
      currencyId: currency,
      items: resolvedLines.map((line) => ({
        id: line.productId,
        title: line.name,
        description: buildMercadoPagoItemDescription({
          title: line.name,
          description: line.description,
          productType: line.productType,
        }),
        quantity: line.quantity,
        unitPrice: line.unitPriceCents / 100,
      })),
      buyerEmail: sessionUser?.email?.trim().toLowerCase() || undefined,
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
      error instanceof Error && error.message.startsWith('El pago online')
        ? error.message
        : 'No se pudo conectar con Mercado Pago. Intentá de nuevo.';
    return { message, success: false };
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
