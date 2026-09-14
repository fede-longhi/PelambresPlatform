'use server';

import { z } from 'zod';
import { put, del } from '@vercel/blob';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import sql from '@/lib/db';
import { auth } from '@/auth';
import {
  getStoreCatalogHref,
  getStoreFinalPriceCents,
  getStoreProductHref,
} from '@/lib/consts/store-consts';
import {
  STORE_TRANSFER_RECEIPTS_FOLDER,
  STORE_TRANSFER_RECEIPT_ALLOWED_EXTENSIONS,
  STORE_TRANSFER_RECEIPT_MAX_SIZE_BYTES,
  buildStoreTransferReference,
  getStoreTransferCheckoutHref,
  isStoreTransferConfigured,
} from '@/lib/consts/store-transfer-consts';
import { fetchCustomerIdForUser } from '@/lib/data/customer-portal-data';
import {
  fetchPublishedStoreProductById,
  fetchPublishedStoreProductsByIds,
} from '@/lib/data/store-product-data';
import { fetchStoreOrderById } from '@/lib/data/store-order-data';
import {
  buildMercadoPagoItemDescription,
  createStoreCheckoutPreference,
  getMercadoPagoProductionConfigError,
} from '@/lib/payments/mercadopago';
import type { StorePaymentMethod } from '@/types/store-definitions';

function isNextRedirect(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    'digest' in error &&
    String((error as { digest?: string }).digest).startsWith('NEXT_REDIRECT')
  );
}

function revalidateStoreOrderPaths(orderId: string) {
  revalidatePath('/admin/store-orders');
  revalidatePath(`/admin/store-orders/${orderId}`);
  revalidatePath(`/store/checkout/transfer`);
}

const PaymentMethodSchema = z.enum(['mercadopago', 'transfer'], {
  message: 'Método de pago inválido.',
});

const BuyerContactSchema = z.object({
  buyerName: z
    .string()
    .trim()
    .min(2, { message: 'Ingresá tu nombre.' })
    .max(120, { message: 'El nombre es demasiado largo.' }),
  buyerEmail: z
    .string()
    .trim()
    .email({ message: 'Ingresá un email válido.' })
    .transform((value) => value.toLowerCase()),
});

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
  paymentMethod: PaymentMethodSchema.default('mercadopago'),
  buyerName: z.string().optional(),
  buyerEmail: z.string().optional(),
});

export type StoreCheckoutFormState = {
  errors?: {
    productId?: string[];
    productType?: string[];
    quantity?: string[];
    paymentMethod?: string[];
    buyerName?: string[];
    buyerEmail?: string[];
  };
  message?: string | null;
  success?: boolean;
};

function toCheckoutError(
  message: string,
  errors?: StoreCheckoutFormState['errors']
): StoreCheckoutFormState {
  return {
    message,
    errors,
    success: false,
  };
}

async function resolveBuyerIdentity(input: {
  paymentMethod: StorePaymentMethod;
  buyerName?: string;
  buyerEmail?: string;
}): Promise<
  | { ok: true; buyerName: string; buyerEmail: string; customerId: string | null }
  | { ok: false; errors: StoreCheckoutFormState['errors']; message: string }
> {
  const session = await auth();
  const sessionUser = session?.user;

  let customerId: string | null = null;
  if (sessionUser?.id && sessionUser.role === 'customer') {
    customerId = await fetchCustomerIdForUser(sessionUser.id);
  }

  if (input.paymentMethod === 'transfer') {
    const contact = BuyerContactSchema.safeParse({
      buyerName: input.buyerName || sessionUser?.name || '',
      buyerEmail: input.buyerEmail || sessionUser?.email || '',
    });
    if (!contact.success) {
      return {
        ok: false,
        message: 'Completá tu nombre y email para la transferencia.',
        errors: contact.error.flatten().fieldErrors,
      };
    }
    return {
      ok: true,
      buyerName: contact.data.buyerName,
      buyerEmail: contact.data.buyerEmail,
      customerId,
    };
  }

  return {
    ok: true,
    buyerName: sessionUser?.name?.trim() || 'Cliente',
    buyerEmail:
      sessionUser?.email?.trim().toLowerCase() || 'checkout@pelambres.com.ar',
    customerId,
  };
}

type OrderLineInsert = {
  productId: string;
  productType: 'product' | 'design';
  name: string;
  unitPriceCents: number;
  discountPercent: number | null;
  quantity: number;
  lineTotalCents: number;
};

async function insertStoreOrderWithItems(input: {
  customerId: string | null;
  buyerEmail: string;
  buyerName: string;
  currency: string;
  totalCents: number;
  paymentMethod: StorePaymentMethod;
  transferReference: string | null;
  lines: OrderLineInsert[];
}): Promise<string> {
  const orderRows = await sql<{ id: string }[]>`
    INSERT INTO store_orders (
      customer_id,
      buyer_email,
      buyer_name,
      status,
      payment_method,
      currency,
      total_cents,
      transfer_reference
    )
    VALUES (
      ${input.customerId},
      ${input.buyerEmail},
      ${input.buyerName},
      'pending',
      ${input.paymentMethod},
      ${input.currency},
      ${input.totalCents},
      ${input.transferReference}
    )
    RETURNING id
  `;

  const orderId = orderRows[0]?.id;
  if (!orderId) {
    throw new Error('Missing order id');
  }

  for (const line of input.lines) {
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

  return orderId;
}

export async function createStoreCheckout(
  _prevState: StoreCheckoutFormState,
  formData: FormData
): Promise<StoreCheckoutFormState> {
  const validated = CheckoutSchema.safeParse({
    productId: formData.get('productId'),
    productType: formData.get('productType'),
    quantity: formData.get('quantity') || 1,
    paymentMethod: formData.get('paymentMethod') || 'mercadopago',
    buyerName: formData.get('buyerName') || undefined,
    buyerEmail: formData.get('buyerEmail') || undefined,
  });

  if (!validated.success) {
    return toCheckoutError(
      'Revisá los datos del formulario.',
      validated.error.flatten().fieldErrors
    );
  }

  const { productId, productType, quantity, paymentMethod } = validated.data;

  if (paymentMethod === 'transfer' && !isStoreTransferConfigured()) {
    return toCheckoutError(
      'La transferencia bancaria no está disponible por ahora.'
    );
  }

  if (paymentMethod === 'mercadopago') {
    const mercadoPagoConfigError = getMercadoPagoProductionConfigError();
    if (mercadoPagoConfigError) {
      return toCheckoutError(mercadoPagoConfigError);
    }
  }

  const product = await fetchPublishedStoreProductById(productType, productId);
  if (!product || product.productType !== productType) {
    return toCheckoutError('El artículo no está disponible.');
  }

  if (
    product.productType === 'product' &&
    (product.stock == null || product.stock < quantity)
  ) {
    return toCheckoutError(
      product.stock == null || product.stock <= 0
        ? 'Este artículo no tiene stock disponible.'
        : `Solo hay ${product.stock} unidades disponibles.`
    );
  }

  const buyer = await resolveBuyerIdentity({
    paymentMethod,
    buyerName: validated.data.buyerName,
    buyerEmail: validated.data.buyerEmail,
  });
  if (!buyer.ok) {
    return toCheckoutError(buyer.message, buyer.errors);
  }

  const unitPriceCents = getStoreFinalPriceCents(
    product.priceCents,
    product.discountPercent
  );
  const lineTotalCents = unitPriceCents * quantity;

  let orderId: string;
  try {
    orderId = await insertStoreOrderWithItems({
      customerId: buyer.customerId,
      buyerEmail: buyer.buyerEmail,
      buyerName: buyer.buyerName,
      currency: product.currency,
      totalCents: lineTotalCents,
      paymentMethod,
      transferReference:
        paymentMethod === 'transfer'
          ? buildStoreTransferReference(crypto.randomUUID())
          : null,
      lines: [
        {
          productId: product.id,
          productType: product.productType,
          name: product.name,
          unitPriceCents,
          discountPercent: product.discountPercent,
          quantity,
          lineTotalCents,
        },
      ],
    });

    if (paymentMethod === 'transfer') {
      const realReference = buildStoreTransferReference(orderId);
      await sql`
        UPDATE store_orders
        SET transfer_reference = ${realReference}, updated_at = NOW()
        WHERE id = ${orderId}
      `;
      redirect(getStoreTransferCheckoutHref(orderId));
    }
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    console.error(error);
    return toCheckoutError('No se pudo iniciar el checkout.');
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
        buyer.buyerEmail !== 'checkout@pelambres.com.ar'
          ? buyer.buyerEmail
          : undefined,
      buyerName: buyer.buyerName !== 'Cliente' ? buyer.buyerName : undefined,
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
    if (isNextRedirect(error)) {
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
    return toCheckoutError(message);
  }
}

const CartCheckoutSchema = z.object({
  itemsJson: z.string().min(2, { message: 'El carrito está vacío.' }),
  paymentMethod: PaymentMethodSchema.default('mercadopago'),
  buyerName: z.string().optional(),
  buyerEmail: z.string().optional(),
});

const CartLineSchema = z.object({
  productId: z.string().uuid(),
  productType: z.enum(['product', 'design']),
  quantity: z.number().int().min(1).max(99),
});

export type StoreCartCheckoutFormState = {
  errors?: {
    buyerName?: string[];
    buyerEmail?: string[];
    paymentMethod?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createStoreCartCheckout(
  _prevState: StoreCartCheckoutFormState,
  formData: FormData
): Promise<StoreCartCheckoutFormState> {
  const validated = CartCheckoutSchema.safeParse({
    itemsJson: formData.get('itemsJson'),
    paymentMethod: formData.get('paymentMethod') || 'mercadopago',
    buyerName: formData.get('buyerName') || undefined,
    buyerEmail: formData.get('buyerEmail') || undefined,
  });

  if (!validated.success) {
    return {
      message: 'El carrito está vacío o es inválido.',
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { paymentMethod } = validated.data;

  if (paymentMethod === 'transfer' && !isStoreTransferConfigured()) {
    return {
      message: 'La transferencia bancaria no está disponible por ahora.',
      success: false,
    };
  }

  if (paymentMethod === 'mercadopago') {
    const mercadoPagoConfigError = getMercadoPagoProductionConfigError();
    if (mercadoPagoConfigError) {
      return { message: mercadoPagoConfigError, success: false };
    }
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

  type ResolvedLine = OrderLineInsert & {
    description: string | null;
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

  const buyer = await resolveBuyerIdentity({
    paymentMethod,
    buyerName: validated.data.buyerName,
    buyerEmail: validated.data.buyerEmail,
  });
  if (!buyer.ok) {
    return {
      message: buyer.message,
      errors: buyer.errors,
      success: false,
    };
  }

  let orderId: string;
  try {
    orderId = await insertStoreOrderWithItems({
      customerId: buyer.customerId,
      buyerEmail: buyer.buyerEmail,
      buyerName: buyer.buyerName,
      currency,
      totalCents,
      paymentMethod,
      transferReference:
        paymentMethod === 'transfer'
          ? buildStoreTransferReference(crypto.randomUUID())
          : null,
      lines: resolvedLines,
    });

    if (paymentMethod === 'transfer') {
      const realReference = buildStoreTransferReference(orderId);
      await sql`
        UPDATE store_orders
        SET transfer_reference = ${realReference}, updated_at = NOW()
        WHERE id = ${orderId}
      `;
      redirect(getStoreTransferCheckoutHref(orderId));
    }
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
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
      buyerEmail:
        buyer.buyerEmail !== 'checkout@pelambres.com.ar'
          ? buyer.buyerEmail
          : undefined,
      buyerName: buyer.buyerName !== 'Cliente' ? buyer.buyerName : undefined,
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
    if (isNextRedirect(error)) {
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

export type StoreTransferReceiptFormState = {
  message?: string | null;
  success?: boolean;
};

function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export async function uploadStoreTransferReceipt(
  _prevState: StoreTransferReceiptFormState,
  formData: FormData
): Promise<StoreTransferReceiptFormState> {
  const orderIdRaw = formData.get('orderId');
  const orderId =
    typeof orderIdRaw === 'string' &&
    z.string().uuid().safeParse(orderIdRaw).success
      ? orderIdRaw
      : null;

  if (!orderId) {
    return { message: 'Pedido inválido.', success: false };
  }

  const order = await fetchStoreOrderById(orderId);
  if (!order || order.paymentMethod !== 'transfer') {
    return { message: 'Pedido no encontrado.', success: false };
  }

  if (order.status !== 'pending' && order.status !== 'payment_review') {
    return {
      message: 'Este pedido ya no acepta comprobantes.',
      success: false,
    };
  }

  const file = formData.get('receipt');
  if (!(file instanceof File) || file.size === 0) {
    return { message: 'Seleccioná un archivo de comprobante.', success: false };
  }

  if (file.size > STORE_TRANSFER_RECEIPT_MAX_SIZE_BYTES) {
    return {
      message: 'El archivo es demasiado grande (máx. 8 MB).',
      success: false,
    };
  }

  const extension = getFileExtension(file.name);
  if (!STORE_TRANSFER_RECEIPT_ALLOWED_EXTENSIONS.has(extension)) {
    return {
      message: 'Formatos permitidos: JPG, PNG, WEBP o PDF.',
      success: false,
    };
  }

  let uploadedUrl: string | null = null;
  try {
    const safeName = file.name.replace(/[^\w.\-]+/g, '_').slice(0, 80);
    const blob = await put(
      `${STORE_TRANSFER_RECEIPTS_FOLDER}/${orderId}-${Date.now()}-${safeName}`,
      file,
      { access: 'public' }
    );
    uploadedUrl = blob.downloadUrl;

    await sql`
      UPDATE store_orders
      SET
        transfer_receipt_url = ${uploadedUrl},
        transfer_receipt_uploaded_at = NOW(),
        status = 'payment_review',
        updated_at = NOW()
      WHERE id = ${orderId}
        AND payment_method = 'transfer'
        AND status IN ('pending', 'payment_review')
    `;

    if (order.transferReceiptUrl && order.transferReceiptUrl !== uploadedUrl) {
      try {
        await del(order.transferReceiptUrl);
      } catch (error) {
        console.error('Failed to delete previous receipt blob:', error);
      }
    }
  } catch (error) {
    console.error(error);
    if (uploadedUrl) {
      try {
        await del(uploadedUrl);
      } catch {
        // ignore cleanup failure
      }
    }
    return { message: 'No se pudo subir el comprobante.', success: false };
  }

  revalidateStoreOrderPaths(orderId);
  return {
    message: 'Comprobante enviado. Vamos a verificar el pago.',
    success: true,
  };
}

export async function applyStorePaymentApproved(params: {
  orderId: string;
  mpPaymentId?: string | null;
}): Promise<{ ok: boolean; alreadyPaid?: boolean }> {
  const order = await fetchStoreOrderById(params.orderId);
  if (!order) {
    return { ok: false };
  }

  if (order.status === 'paid') {
    return { ok: true, alreadyPaid: true };
  }

  if (order.status !== 'pending' && order.status !== 'payment_review') {
    return { ok: false };
  }

  if (params.mpPaymentId) {
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
  }

  try {
    await sql.begin(async (tx) => {
      const updated = params.mpPaymentId
        ? await tx<{ id: string }[]>`
            UPDATE store_orders
            SET
              status = 'paid',
              mp_payment_id = ${params.mpPaymentId},
              paid_at = NOW(),
              updated_at = NOW()
            WHERE id = ${params.orderId}
              AND status IN ('pending', 'payment_review')
            RETURNING id
          `
        : await tx<{ id: string }[]>`
            UPDATE store_orders
            SET
              status = 'paid',
              paid_at = NOW(),
              updated_at = NOW()
            WHERE id = ${params.orderId}
              AND status IN ('pending', 'payment_review')
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
      AND status IN ('paid', 'pending', 'payment_review')
  `;
  revalidatePath('/admin/store-orders');
  revalidatePath(`/admin/store-orders/${params.orderId}`);
}
