'use client';

import { useMemo, useState } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import { formatQuoteNumber } from '@/lib/consts/quote-document-consts';
import { computeQuoteMath } from '@/lib/quote-math';
import { formatCurrency } from '@/lib/utils';
import {
  updateOrderItems,
  type OrderItemsFormState,
} from '@/lib/actions/order-actions';
import type { QuoteItem, TaxItem } from '@/types/quote';

type EditableLine = {
  key: string;
  description: string;
  quantity: string;
  price: string;
  discount: string;
};

function toEditableLines(items: QuoteItem[]): EditableLine[] {
  return items.map((item) => ({
    key: item.id,
    description: item.description,
    quantity: String(item.quantity),
    price: String(item.price),
    discount: String(item.discount),
  }));
}

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
  const [lines, setLines] = useState(() => toEditableLines(items));
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const initialState: OrderItemsFormState = { message: null, success: false };
  const boundAction = updateOrderItems.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const previewItems: QuoteItem[] = useMemo(
    () =>
      lines.map((line) => ({
        id: line.key,
        description: line.description,
        quantity: Number(line.quantity) > 0 ? Number(line.quantity) : 0,
        price: Number(line.price) || 0,
        discount: Number(line.discount) || 0,
      })),
    [lines]
  );
  const preview = computeQuoteMath(previewItems, taxes, globalDiscountPercent);
  const previewCents = Math.max(0, Math.round(preview.total * 100));
  const itemsJson = JSON.stringify(
    lines.map((line) => ({
      description: line.description,
      quantity: Number(line.quantity),
      price: Number(line.price),
      discount: Number(line.discount),
    }))
  );

  function updateLine(key: string, patch: Partial<EditableLine>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  }

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
        <input type="hidden" name="itemsJson" value={itemsJson} />
        <input
          type="hidden"
          name="notifyCustomer"
          value={notifyCustomer ? 'true' : 'false'}
        />

        <div className="space-y-4">
          {lines.map((line, index) => (
            <div
              key={line.key}
              className="grid grid-cols-1 gap-3 border-b border-border pb-4 md:grid-cols-[minmax(0,1fr)_6rem_8rem_6rem]"
            >
              <div className="space-y-2">
                <Label htmlFor={`item-description-${line.key}`}>
                  Descripción {index + 1}
                </Label>
                <Input
                  id={`item-description-${line.key}`}
                  value={line.description}
                  onChange={(event) =>
                    updateLine(line.key, { description: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`item-quantity-${line.key}`}>Cantidad</Label>
                <Input
                  id={`item-quantity-${line.key}`}
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={line.quantity}
                  onChange={(event) =>
                    updateLine(line.key, { quantity: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`item-price-${line.key}`}>Precio unitario</Label>
                <Input
                  id={`item-price-${line.key}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.price}
                  onChange={(event) =>
                    updateLine(line.key, { price: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`item-discount-${line.key}`}>Desc. %</Label>
                <Input
                  id={`item-discount-${line.key}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={line.discount}
                  onChange={(event) =>
                    updateLine(line.key, { discount: event.target.value })
                  }
                />
              </div>
            </div>
          ))}
        </div>

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
            className={state.success ? 'text-sm text-muted-foreground' : 'text-sm text-destructive'}
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
