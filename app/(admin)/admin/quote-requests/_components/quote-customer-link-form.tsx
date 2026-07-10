'use client';

import { useActionState, useEffect } from 'react';
import {
  linkQuoteRequestToCustomer,
  type LinkQuoteCustomerFormState,
} from '@/lib/actions/quote-actions';
import CustomerSelectField, {
  type CustomerField,
} from '@/components/shared/customer-select-field';
import { Button } from '@/components/ui/button';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import { useToast } from '@/hooks/use-toast';
import { splitPersonName } from '@/lib/utils';

type QuoteCustomerLinkFormProps = {
  quoteRequestId: string;
  quoteName: string;
  quoteEmail: string;
  quotePhone: string;
  defaultCustomer?: CustomerField;
};

export default function QuoteCustomerLinkForm({
  quoteRequestId,
  quoteName,
  quoteEmail,
  quotePhone,
  defaultCustomer,
}: QuoteCustomerLinkFormProps) {
  const initialState: LinkQuoteCustomerFormState = {
    message: null,
    success: false,
  };
  const boundAction = linkQuoteRequestToCustomer.bind(null, quoteRequestId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const { toast } = useToast();
  const nameParts = splitPersonName(quoteName);

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: 'Cliente asociado',
        description: 'La solicitud quedó vinculada al cliente.',
        variant: 'success',
      });
    }
  }, [state.message, toast]);

  return (
    <form action={formAction} className="space-y-4">
      {!state.success && state.message && state.message !== 'success' && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      <CustomerSelectField
        defaultValue={defaultCustomer}
        defaultEmail={quoteEmail}
        defaultFirstName={nameParts.firstName}
        defaultLastName={nameParts.lastName}
        defaultBusinessName={quoteName}
      />
      <FieldErrorDisplay id="quote-customer-id-error" errors={state.errors?.customerId} />

      <p className="text-xs text-muted-foreground">
        Podés elegir un cliente existente o crear uno nuevo con los datos de la solicitud
        {quotePhone ? ` (teléfono: ${quotePhone})` : ''}.
      </p>

      <Button type="submit" disabled={isPending}>
        {isPending
          ? 'Asociando...'
          : defaultCustomer?.value
            ? 'Actualizar cliente'
            : 'Asociar cliente'}
      </Button>
    </form>
  );
}
