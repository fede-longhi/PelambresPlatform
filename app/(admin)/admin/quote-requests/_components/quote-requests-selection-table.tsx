'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { formatDateToLocal } from '@/lib/utils';
import {
  QUOTE_REQUEST_STATUSES,
  getQuoteRequestStatusLabel,
} from '@/lib/consts/quote-request-consts';
import {
  deleteQuoteRequests,
  updateQuoteRequestsStatus,
} from '@/lib/actions/quote-actions';
import type { QuoteTable } from '@/types/definitions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import QuoteRequestCustomerAction from './quote-request-customer-action';
import QuoteRequestRowActions from './quote-request-row-actions';
import QuoteRequestStatusAction from './quote-request-status-action';
import QuoteRequestStatusBadge from './quote-request-status-badge';

function quoteDisplayName(quote: {
  first_name: string | null;
  last_name: string | null;
  name: string;
}) {
  if (quote.first_name || quote.last_name) {
    return [quote.last_name, quote.first_name].filter(Boolean).join(', ');
  }
  return quote.name || 'Sin nombre';
}

function quoteCustomer(quote: QuoteTable) {
  if (!quote.customer_id) {
    return null;
  }

  const label = quote.customer_name?.replace(/^,\s*|,\s*$/g, '').trim();

  return {
    id: quote.customer_id,
    label: label || 'Cliente',
  };
}

function selectionLabel(count: number) {
  return count === 1
    ? '1 solicitud seleccionada'
    : `${count} solicitudes seleccionadas`;
}

export default function QuoteRequestsSelectionTable({
  quotes,
}: {
  quotes: QuoteTable[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusPickerKey, setStatusPickerKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const visibleIds = quotes.map((quote) => quote.id);
  const selectedVisibleIds = visibleIds.filter((id) => selectedIds.includes(id));
  const selectedCount = selectedVisibleIds.length;
  const allSelected = quotes.length > 0 && selectedCount === quotes.length;
  const headerChecked = allSelected
    ? true
    : selectedCount > 0
      ? 'indeterminate'
      : false;

  function setAllSelected(checked: boolean) {
    setSelectedIds(checked ? visibleIds : []);
  }

  function toggleQuote(quoteId: string, checked: boolean) {
    setSelectedIds((current) => {
      const visible = new Set(visibleIds);
      const next = current.filter((id) => visible.has(id) && id !== quoteId);

      if (checked) {
        next.push(quoteId);
      }

      return next;
    });
  }

  function resetStatusPicker() {
    setPendingStatus(null);
    setStatusPickerKey((current) => current + 1);
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteQuoteRequests(selectedVisibleIds);

      if (!result.success) {
        toast({
          title: 'No se pudo borrar',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      setSelectedIds([]);
      setDeleteOpen(false);
      toast({
        title: 'Solicitudes borradas',
        description: result.message,
        variant: 'success',
      });
    });
  }

  function handleStatusChange() {
    if (!pendingStatus) {
      return;
    }

    const nextStatus = pendingStatus;

    startTransition(async () => {
      const result = await updateQuoteRequestsStatus(
        selectedVisibleIds,
        nextStatus
      );

      if (!result.success) {
        toast({
          title: 'No se pudo cambiar el estado',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      setSelectedIds([]);
      resetStatusPicker();
      toast({
        title: 'Estado actualizado',
        description: result.message,
        variant: 'success',
      });
    });
  }

  return (
    <div className="mt-6 flow-root">
      {selectedCount > 0 ? (
        <div className="mb-3 flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">{selectionLabel(selectedCount)}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              key={statusPickerKey}
              disabled={isPending}
              onValueChange={setPendingStatus}
            >
              <SelectTrigger className="h-8 w-[180px]" aria-label="Cambiar estado">
                <SelectValue placeholder="Cambiar estado" />
              </SelectTrigger>
              <SelectContent align="end">
                {QUOTE_REQUEST_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    <QuoteRequestStatusBadge status={status} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => setDeleteOpen(true)}
            >
              Borrar
            </Button>
          </div>
        </div>
      ) : null}

      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg md:overflow-hidden md:border md:border-border md:bg-card md:shadow-sm">
          <div className="md:hidden">
            <div className="mb-2 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <Checkbox
                id="quote-requests-select-all"
                checked={headerChecked}
                onCheckedChange={(checked) => setAllSelected(checked === true)}
                aria-label="Seleccionar todas las solicitudes de esta página"
              />
              <label htmlFor="quote-requests-select-all" className="text-sm">
                Seleccionar todas
              </label>
            </div>
            {quotes.map((quote) => {
              const displayName = quoteDisplayName(quote);
              const selected = selectedVisibleIds.includes(quote.id);

              return (
                <div
                  key={quote.id}
                  className="mb-2 w-full rounded-lg border border-border bg-card p-4 shadow-sm data-[selected=true]:bg-muted/50"
                  data-selected={selected}
                >
                  <div className="flex items-start justify-between gap-3 border-b pb-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <Checkbox
                        className="mt-1"
                        checked={selected}
                        onCheckedChange={(checked) =>
                          toggleQuote(quote.id, checked === true)
                        }
                        aria-label={`Seleccionar ${displayName}`}
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/admin/quote-requests/${quote.id}`}
                          className="mb-2 block font-medium hover:underline"
                        >
                          {displayName}
                        </Link>
                        <p className="text-sm text-gray-500">{quote.email}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <QuoteRequestStatusAction
                        quoteRequestId={quote.id}
                        status={quote.status}
                      />
                      <QuoteRequestRowActions
                        quoteRequestId={quote.id}
                        quoteName={quote.name || displayName}
                      />
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <p className="text-sm">{formatDateToLocal(quote.date)}</p>
                    <QuoteRequestCustomerAction
                      quoteRequestId={quote.id}
                      quoteName={quote.name || displayName}
                      quoteEmail={quote.email}
                      quotePhone={quote.phone || ''}
                      customer={quoteCustomer(quote)}
                      compactLabel
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="bg-muted/60 text-left text-sm font-normal">
              <tr>
                <th scope="col" className="w-px px-4 py-5 sm:pl-6">
                  <Checkbox
                    checked={headerChecked}
                    onCheckedChange={(checked) => setAllSelected(checked === true)}
                    aria-label="Seleccionar todas las solicitudes de esta página"
                  />
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Nombre
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Teléfono
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Cliente
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {quotes.map((quote) => {
                const displayName = quoteDisplayName(quote);
                const selected = selectedVisibleIds.includes(quote.id);

                return (
                  <tr
                    key={quote.id}
                    data-selected={selected}
                    className="w-full border-b py-3 text-sm last-of-type:border-none data-[selected=true]:bg-muted/50 [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="w-px whitespace-nowrap py-3 pl-6 pr-3">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(checked) =>
                          toggleQuote(quote.id, checked === true)
                        }
                        aria-label={`Seleccionar ${displayName}`}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <Link
                        href={`/admin/quote-requests/${quote.id}`}
                        className="hover:underline"
                      >
                        {displayName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{quote.email}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {quote.phone || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {formatDateToLocal(quote.date)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <QuoteRequestStatusAction
                        quoteRequestId={quote.id}
                        status={quote.status}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <QuoteRequestCustomerAction
                        quoteRequestId={quote.id}
                        quoteName={quote.name || displayName}
                        quoteEmail={quote.email}
                        quotePhone={quote.phone || ''}
                        customer={quoteCustomer(quote)}
                      />
                    </td>
                    <td className="w-px whitespace-nowrap px-2 py-3 pr-4">
                      <QuoteRequestRowActions
                        quoteRequestId={quote.id}
                        quoteName={quote.name || displayName}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) {
            resetStatusPicker();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar el estado?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCount === 1
                ? 'La solicitud seleccionada'
                : `Las ${selectedCount} solicitudes seleccionadas`}{' '}
              van a pasar a{' '}
              {pendingStatus
                ? getQuoteRequestStatusLabel(pendingStatus).toLowerCase()
                : 'el estado elegido'}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <Button type="button" disabled={isPending} onClick={handleStatusChange}>
              {isPending ? 'Guardando...' : 'Cambiar estado'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!isPending) {
            setDeleteOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCount === 1
                ? '¿Borrar esta solicitud?'
                : `¿Borrar ${selectedCount} solicitudes?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminan de forma definitiva, junto con sus archivos. Los
              presupuestos ya creados se conservan, pero dejan de estar
              vinculados a estas solicitudes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? 'Borrando...' : 'Borrar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
