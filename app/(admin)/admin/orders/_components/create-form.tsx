'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createOrder,
  loadCustomerAcceptedQuotesForCreate,
  loadQuoteForOrderImport,
  OrderFormState,
} from '@/lib/actions/order-actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import { FileAttachmentPicker } from '@/components/shared/file-attachment-picker';
import OrderLinesEditor, {
  createEmptyOrderLine,
  linesFromQuoteItems,
  serializeOrderLines,
  type EditableOrderLine,
} from '@/components/orders/order-lines-editor';
import {
  CustomerSelectField,
  StatusField,
  TrackingCodeInput,
} from './form-fields';
import type { CustomerField } from './form-fields';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_ATTACHMENT_SIZE_BYTES,
} from '@/lib/consts';
import { ORDER_PAYMENT_METHOD_OPTIONS } from '@/lib/consts/order-payment-consts';
import { formatQuoteNumber } from '@/lib/consts/quote-document-consts';
import { formatCurrency, formatFileSize } from '@/lib/utils';
import { centsToPesos, computeQuoteMath, pesosToCents } from '@/lib/quote-math';
import type { QuoteDocumentListItem } from '@/types/quote-document-definitions';
import type { TaxItem } from '@/types/quote';

function defaultEstimatedDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().split('T')[0];
}

export default function CreateForm({
  defaultCustomer,
}: {
  defaultCustomer?: CustomerField;
}) {
  const router = useRouter();
  const initialState: OrderFormState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(
    createOrder,
    initialState
  );

  const [customerId, setCustomerId] = useState(defaultCustomer?.value ?? '');
  const [lines, setLines] = useState<EditableOrderLine[]>([
    createEmptyOrderLine(),
  ]);
  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [globalDiscountPercent, setGlobalDiscountPercent] = useState(0);
  const [quoteId, setQuoteId] = useState('');
  const [availableQuotes, setAvailableQuotes] = useState<
    QuoteDocumentListItem[]
  >([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [isImportingQuote, setIsImportingQuote] = useState(false);
  const [registerDeposit, setRegisterDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('transfer');
  const [files, setFiles] = useState<File[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>(
    []
  );

  const preview = useMemo(
    () =>
      computeQuoteMath(
        lines.map((line) => ({
          id: line.key,
          description: line.description,
          quantity: Number(line.quantity) > 0 ? Number(line.quantity) : 0,
          price: Number(line.price) || 0,
          discount: Number(line.discount) || 0,
        })),
        taxes,
        globalDiscountPercent
      ),
    [lines, taxes, globalDiscountPercent]
  );
  const totalCents = Math.max(0, pesosToCents(preview.total));

  useEffect(() => {
    let cancelled = false;

    async function loadQuotes() {
      if (!customerId) {
        setAvailableQuotes([]);
        setQuoteId('');
        return;
      }

      setIsLoadingQuotes(true);
      try {
        const quotes = await loadCustomerAcceptedQuotesForCreate(customerId);
        if (!cancelled) {
          setAvailableQuotes(quotes);
        }
      } catch {
        if (!cancelled) {
          setAvailableQuotes([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingQuotes(false);
        }
      }
    }

    loadQuotes();
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  async function handleQuoteImport(nextQuoteId: string) {
    setQuoteId(nextQuoteId);
    if (!nextQuoteId) {
      return;
    }

    setIsImportingQuote(true);
    try {
      const quote = await loadQuoteForOrderImport(nextQuoteId);
      if (!quote) {
        return;
      }
      setLines(linesFromQuoteItems(quote.items));
      setTaxes(quote.taxes);
      setGlobalDiscountPercent(quote.globalDiscountPercent);
      if (registerDeposit && !depositAmount) {
        setDepositAmount(
          String(centsToPesos(Math.round(quote.totalCents * 0.3)))
        );
      }
    } finally {
      setIsImportingQuote(false);
    }
  }

  return (
    <form
      className="space-y-6"
      action={(formData) => {
        formData.set('filesCount', String(files.length));
        files.forEach((file, index) => {
          formData.set(`file-${index}`, file);
        });
        formAction(formData);
      }}
    >
      <input type="hidden" name="itemsJson" value={serializeOrderLines(lines)} />
      <input type="hidden" name="taxesJson" value={JSON.stringify(taxes)} />
      <input
        type="hidden"
        name="globalDiscountPercent"
        value={String(globalDiscountPercent)}
      />
      <input type="hidden" name="quoteId" value={quoteId} />
      <input
        type="hidden"
        name="registerDeposit"
        value={registerDeposit ? 'true' : 'false'}
      />

      <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold">Datos del pedido</h2>
        <TrackingCodeInput errors={state.errors?.code} />
        <CustomerSelectField
          defaultValue={defaultCustomer}
          onCustomerChange={(customer) => {
            setCustomerId(customer.id);
            setQuoteId('');
          }}
        />
        <FieldErrorDisplay
          id="customer-error"
          errors={state.errors?.customerId}
        />

        {customerId ? (
          <div className="space-y-2">
            <Label htmlFor="quote-import">Importar desde presupuesto</Label>
            <Select
              value={quoteId || 'none'}
              onValueChange={(value) =>
                handleQuoteImport(value === 'none' ? '' : value)
              }
              disabled={isLoadingQuotes || isImportingQuote || isPending}
            >
              <SelectTrigger id="quote-import">
                <SelectValue
                  placeholder={
                    isLoadingQuotes
                      ? 'Cargando presupuestos...'
                      : 'Sin presupuesto'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin presupuesto</SelectItem>
                {availableQuotes.map((quote) => (
                  <SelectItem key={quote.id} value={quote.id}>
                    Nº {formatQuoteNumber(quote.quoteNumber, quote.revision)} ·{' '}
                    {formatCurrency(quote.totalCents)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Solo presupuestos aceptados sin pedido. Podés editar las líneas
              después de importar.
            </p>
            <FieldErrorDisplay
              id="quote-error"
              errors={state.errors?.quoteId}
            />
          </div>
        ) : null}

        <StatusField state={state} />

        <div className="space-y-2">
          <Label htmlFor="estimatedDate">Fecha estimada</Label>
          <Input
            id="estimatedDate"
            type="date"
            name="estimatedDate"
            defaultValue={
              (state.payload?.get('estimatedDate') as string) ||
              defaultEstimatedDate()
            }
            aria-invalid={!!state.errors?.estimatedDate}
            aria-describedby="estimated-date-error"
          />
          <FieldErrorDisplay
            id="estimated-date-error"
            errors={state.errors?.estimatedDate}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm md:p-6">
        <div>
          <h2 className="text-lg font-semibold">Ítems</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            El pedido necesita al menos un ítem. Usá la calculadora para cotizar
            impresión 3D.
          </p>
        </div>
        <OrderLinesEditor
          lines={lines}
          onChange={setLines}
          taxes={taxes}
          globalDiscountPercent={globalDiscountPercent}
          onGlobalDiscountChange={setGlobalDiscountPercent}
        />
        <FieldErrorDisplay id="items-error" errors={state.errors?.items} />
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold">Notas internas</h2>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={(state.payload?.get('notes') as string) || ''}
          placeholder="Contexto interno del pedido (no visible para el cliente)."
          aria-describedby="notes-error"
        />
        <FieldErrorDisplay id="notes-error" errors={state.errors?.notes} />
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm md:p-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="register-deposit"
            checked={registerDeposit}
            onCheckedChange={(checked) => {
              const enabled = checked === true;
              setRegisterDeposit(enabled);
              if (enabled && !depositAmount && totalCents > 0) {
                setDepositAmount(
                  String(centsToPesos(Math.round(totalCents * 0.3)))
                );
              }
            }}
          />
          <Label htmlFor="register-deposit">Registrar seña al crear</Label>
        </div>

        {registerDeposit ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="depositAmount">Importe de la seña</Label>
              <Input
                id="depositAmount"
                name="depositAmount"
                type="number"
                min="0"
                step="0.01"
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                aria-describedby="deposit-amount-error"
              />
              <FieldErrorDisplay
                id="deposit-amount-error"
                errors={state.errors?.depositAmount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depositMethod">Método</Label>
              <select
                id="depositMethod"
                name="depositMethod"
                value={depositMethod}
                onChange={(event) => setDepositMethod(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                aria-describedby="deposit-method-error"
              >
                {ORDER_PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FieldErrorDisplay
                id="deposit-method-error"
                errors={state.errors?.depositMethod}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="depositNotes">Notas del pago</Label>
              <Input
                id="depositNotes"
                name="depositNotes"
                defaultValue=""
                placeholder="Opcional"
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold">Archivos adjuntos</h2>
        <p className="text-sm text-muted-foreground">
          Opcional. STL, PDF u otros archivos del trabajo.
        </p>
        <FileAttachmentPicker
          id="order-create-attachments"
          label="Adjuntar archivos"
          files={files}
          onFilesChange={setFiles}
          disabled={isPending}
          allowedExtensions={ALLOWED_EXTENSIONS}
          allowedMimeTypes={ALLOWED_MIME_TYPES}
          maxSizeBytes={MAX_FILE_ATTACHMENT_SIZE_BYTES}
          validationErrors={fileValidationErrors}
          onValidationErrorsChange={setFileValidationErrors}
          formatHint={`STL, OBJ, 3MF, PDF, JPG, PNG y WEBP. Máximo ${formatFileSize(MAX_FILE_ATTACHMENT_SIZE_BYTES)} por archivo.`}
        />
        <FieldErrorDisplay
          id="attachments-error"
          errors={state.errors?.attachments}
        />
      </section>

      {state.message ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Total del pedido:{' '}
          <span className="font-semibold tabular-nums text-foreground">
            {formatCurrency(totalCents)}
          </span>
        </p>
        <div className="flex flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending || fileValidationErrors.length > 0}
          >
            {isPending ? 'Guardando...' : 'Crear pedido'}
          </Button>
        </div>
      </div>
    </form>
  );
}
