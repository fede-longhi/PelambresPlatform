'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import OrderLinesEditor, {
  linesFromQuoteItems,
  serializeOrderLines,
  type EditableOrderLine,
} from '@/components/orders/order-lines-editor';
import { formatQuoteNumber } from '@/lib/consts/quote-document-consts';
import { computeQuoteMath, pesosToCents } from '@/lib/quote-math';
import { formatCurrency } from '@/lib/utils';
import {
  updateOrderItems,
  type OrderItemsFormState,
} from '@/lib/actions/order-actions';
import type { QuoteItem, TaxItem } from '@/types/quote';

export default function OrderItemsForm({
  orderId,
  quoteId,
  quoteNumber,
  quoteRevision,
  quotedAmountCents,
  globalDiscountPercent,
  taxes,
  items,
  hasPayments,
}: {
  orderId: string;
  quoteId?: string | null;
  quoteNumber?: number | null;
  quoteRevision?: number | null;
  quotedAmountCents: number | null;
  globalDiscountPercent: number;
  taxes: TaxItem[];
  items: QuoteItem[];
  hasPayments: boolean;
}) {
  const [lines, setLines] = useState<EditableOrderLine[]>(() =>
    linesFromQuoteItems(items)
  );
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const initialState: OrderItemsFormState = { message: null, success: false };
  const boundAction = updateOrderItems.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  const preview = computeQuoteMath(
    lines.map((line) => ({
      id: line.key,
      description: line.description,
      quantity: Number(line.quantity) > 0 ? Number(line.quantity) : 0,
      price: Number(line.price) || 0,
      discount: Number(line.discount) || 0,
    })),
    taxes,
    globalDiscountPercent
  );
  const previewCents = Math.max(0, pesosToCents(preview.total));

  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Ítems del pedido</h2>
        {quoteId ? (
          <Link
            href={`/admin/quotes/${quoteId}`}
            className="text-sm text-primary hover:underline"
          >
            Presupuesto
            {quoteNumber != null
              ? ` Nº ${formatQuoteNumber(quoteNumber, quoteRevision ?? 1)}`
              : ''}
          </Link>
        ) : null}
      </div>

      {quotedAmountCents != null ? (
        <p className="text-sm text-muted-foreground">
          Cotizado {formatCurrency(quotedAmountCents)} · Actual{' '}
          {formatCurrency(previewCents)}
        </p>
      ) : null}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="itemsJson" value={serializeOrderLines(lines)} />
        <input
          type="hidden"
          name="notifyCustomer"
          value={notifyCustomer ? 'true' : 'false'}
        />

        <OrderLinesEditor
          lines={lines}
          onChange={setLines}
          taxes={taxes}
          globalDiscountPercent={globalDiscountPercent}
          showSummary
        />

        <div className="space-y-2">
          <Label htmlFor="order-items-reason">Motivo del cambio</Label>
          <Textarea
            id="order-items-reason"
            name="reason"
            rows={3}
            placeholder="Por ejemplo: el cliente pidió pasar de 50 a 100 unidades."
            aria-describedby="order-items-reason-error"
          />
          <FieldErrorDisplay
            id="order-items-reason-error"
            errors={state.errors?.reason}
          />
        </div>

        {hasPayments ? (
          <div className="flex items-center gap-2">
            <Checkbox
              id="notify-customer"
              checked={notifyCustomer}
              onCheckedChange={(checked) => setNotifyCustomer(checked === true)}
            />
            <Label htmlFor="notify-customer">
              Avisar al cliente por email si cambia el total
            </Label>
          </div>
        ) : null}

        {state.errors?.items ? (
          <FieldErrorDisplay id="order-items-error" errors={state.errors.items} />
        ) : null}
        {state.message ? (
          <p
            className={
              state.success
                ? 'text-sm text-muted-foreground'
                : 'text-sm text-destructive'
            }
            role={state.success ? 'status' : 'alert'}
          >
            {state.message}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar líneas'}
          </Button>
        </div>
      </form>
    </section>
  );
}
