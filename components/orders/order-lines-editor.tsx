'use client';

import { useState } from 'react';
import { Calculator, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorModal } from '@/components/quote-builder/CalculatorModal';
import { computeQuoteMath, pesosToCents } from '@/lib/quote-math';
import { formatCurrency } from '@/lib/utils';
import type { QuoteItem, QuoteItemCalculatorParams, TaxItem } from '@/types/quote';

export type EditableOrderLine = {
  key: string;
  description: string;
  quantity: string;
  price: string;
  discount: string;
  calculatorParams?: QuoteItemCalculatorParams;
};

export function createEmptyOrderLine(): EditableOrderLine {
  return {
    key: crypto.randomUUID(),
    description: '',
    quantity: '1',
    price: '',
    discount: '0',
  };
}

export function linesFromQuoteItems(items: QuoteItem[]): EditableOrderLine[] {
  if (items.length === 0) {
    return [createEmptyOrderLine()];
  }

  return items.map((item) => ({
    key: item.id || crypto.randomUUID(),
    description: item.description,
    quantity: String(item.quantity),
    price: String(item.price),
    discount: String(item.discount),
    calculatorParams: item.calculatorParams,
  }));
}

export function toQuoteItems(lines: EditableOrderLine[]): QuoteItem[] {
  return lines.map((line) => ({
    id: line.key,
    description: line.description,
    quantity: Number(line.quantity) > 0 ? Number(line.quantity) : 0,
    price: Number(line.price) || 0,
    discount: Number(line.discount) || 0,
    calculatorParams: line.calculatorParams,
  }));
}

export function serializeOrderLines(lines: EditableOrderLine[]) {
  return JSON.stringify(
    lines.map((line) => ({
      description: line.description,
      quantity: Number(line.quantity),
      price: Number(line.price),
      discount: Number(line.discount),
      calculatorParams: line.calculatorParams ?? null,
    }))
  );
}

type OrderLinesEditorProps = {
  lines: EditableOrderLine[];
  onChange: (lines: EditableOrderLine[]) => void;
  taxes?: TaxItem[];
  globalDiscountPercent?: number;
  onGlobalDiscountChange?: (value: number) => void;
  showSummary?: boolean;
  allowRemoveLast?: boolean;
};

export default function OrderLinesEditor({
  lines,
  onChange,
  taxes = [],
  globalDiscountPercent = 0,
  onGlobalDiscountChange,
  showSummary = true,
  allowRemoveLast = false,
}: OrderLinesEditorProps) {
  const [activeCalcItemId, setActiveCalcItemId] = useState<string | null>(null);
  const activeCalculatorItem = lines.find((line) => line.key === activeCalcItemId);
  const quoteItems = toQuoteItems(lines);
  const preview = computeQuoteMath(quoteItems, taxes, globalDiscountPercent);
  const previewCents = Math.max(0, pesosToCents(preview.total));

  function updateLine(key: string, patch: Partial<EditableOrderLine>) {
    onChange(
      lines.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  }

  function addLine() {
    onChange([...lines, createEmptyOrderLine()]);
  }

  function removeLine(key: string) {
    if (!allowRemoveLast && lines.length <= 1) {
      return;
    }
    onChange(lines.filter((line) => line.key !== key));
  }

  function handleApplyCalculation(
    totalCost: number,
    calculatorParams: QuoteItemCalculatorParams
  ) {
    if (!activeCalcItemId) {
      return;
    }
    updateLine(activeCalcItemId, {
      price: String(Math.round(totalCost * 100) / 100),
      calculatorParams,
    });
    setActiveCalcItemId(null);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {lines.map((line, index) => (
          <div
            key={line.key}
            className="relative space-y-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Ítem {index + 1}
              </p>
              {(allowRemoveLast || lines.length > 1) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 text-destructive hover:text-destructive"
                  aria-label={`Eliminar ítem ${index + 1}`}
                  onClick={() => removeLine(line.key)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`order-line-description-${line.key}`}>
                Descripción
              </Label>
              <Input
                id={`order-line-description-${line.key}`}
                value={line.description}
                onChange={(event) =>
                  updateLine(line.key, { description: event.target.value })
                }
                placeholder="Ej: Engranaje PLA 40 mm"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[6rem_minmax(0,1fr)_6rem]">
              <div className="space-y-2">
                <Label htmlFor={`order-line-quantity-${line.key}`}>Cant.</Label>
                <Input
                  id={`order-line-quantity-${line.key}`}
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
                <Label htmlFor={`order-line-price-${line.key}`}>
                  Precio unitario
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`order-line-price-${line.key}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.price}
                    onChange={(event) =>
                      updateLine(line.key, {
                        price: event.target.value,
                        calculatorParams: undefined,
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10 shrink-0 text-primary"
                    aria-label={`Calcular precio del ítem ${index + 1}`}
                    onClick={() => setActiveCalcItemId(line.key)}
                  >
                    <Calculator className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`order-line-discount-${line.key}`}>Desc. %</Label>
                <Input
                  id={`order-line-discount-${line.key}`}
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

            {line.calculatorParams ? (
              <p className="text-xs text-muted-foreground">
                Precio calculado con la calculadora de costos.
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        onClick={addLine}
      >
        <Plus className="mr-2 size-4" aria-hidden="true" />
        Agregar ítem
      </Button>

      {onGlobalDiscountChange ? (
        <div className="max-w-xs space-y-2">
          <Label htmlFor="order-global-discount">Descuento general (%)</Label>
          <Input
            id="order-global-discount"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={globalDiscountPercent === 0 ? '' : globalDiscountPercent}
            onChange={(event) =>
              onGlobalDiscountChange(Number(event.target.value) || 0)
            }
          />
        </div>
      ) : null}

      {showSummary ? (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">
              {formatCurrency(pesosToCents(preview.itemsSubtotal))}
            </span>
          </div>
          {preview.globalDiscountAmount > 0 ? (
            <div className="mt-1 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Descuento</span>
              <span className="tabular-nums">
                −{formatCurrency(pesosToCents(preview.globalDiscountAmount))}
              </span>
            </div>
          ) : null}
          {preview.totalTaxes > 0 ? (
            <div className="mt-1 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="tabular-nums">
                {formatCurrency(pesosToCents(preview.totalTaxes))}
              </span>
            </div>
          ) : null}
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-2">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold tabular-nums text-primary">
              {formatCurrency(previewCents)}
            </span>
          </div>
        </div>
      ) : null}

      <CalculatorModal
        isOpen={activeCalcItemId !== null}
        itemId={activeCalcItemId}
        initialParams={activeCalculatorItem?.calculatorParams}
        onClose={() => setActiveCalcItemId(null)}
        onApply={handleApplyCalculation}
      />
    </div>
  );
}
