'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import CustomerSelectField, {
  type CustomerField,
} from '@/components/shared/customer-select-field';
import { fetchCustomerByEmail } from '@/lib/data/customer-data';
import { getCustomerName, splitPersonName } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import FieldErrorDisplay from '@/components/ui/field-error-display';
import { Business, Person } from '@mui/icons-material';

type CustomerLinkMode = 'existing' | 'create';

export default function CustomerLinkSection({
  userEmail,
  userName,
  defaultCustomer,
  errors,
}: {
  userEmail: string;
  userName: string;
  defaultCustomer?: CustomerField;
  errors?: {
    customerId?: string[];
    customerPhone?: string[];
    customerFirstName?: string[];
    customerLastName?: string[];
    customerName?: string[];
  };
}) {
  const [linkMode, setLinkMode] = useState<CustomerLinkMode>('existing');
  const [customerType, setCustomerType] = useState<'person' | 'business'>('person');
  const [emailMatch, setEmailMatch] = useState<CustomerField | null>(
    defaultCustomer?.value ? defaultCustomer : null
  );
  const [isLookingUpEmail, setIsLookingUpEmail] = useState(false);

  const nameParts = useMemo(() => splitPersonName(userName), [userName]);
  const [firstName, setFirstName] = useState(nameParts.firstName);
  const [lastName, setLastName] = useState(nameParts.lastName);
  const [businessName, setBusinessName] = useState(userName.trim());
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (linkMode === 'create') {
      setFirstName(nameParts.firstName);
      setLastName(nameParts.lastName);
      setBusinessName(userName.trim());
    }
  }, [linkMode, nameParts, userName]);

  const lookupCustomerByEmail = useDebouncedCallback(async (email: string) => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setEmailMatch(defaultCustomer?.value ? defaultCustomer : null);
      return;
    }

    setIsLookingUpEmail(true);

    try {
      const customer = await fetchCustomerByEmail(trimmedEmail);

      if (customer) {
        setEmailMatch({
          value: customer.id,
          label: getCustomerName(customer),
        });
        setLinkMode('existing');
      } else {
        setEmailMatch(defaultCustomer?.value ? defaultCustomer : null);
        if (!defaultCustomer?.value) {
          setLinkMode('create');
        }
      }
    } finally {
      setIsLookingUpEmail(false);
    }
  }, 400);

  useEffect(() => {
    lookupCustomerByEmail(userEmail);
  }, [userEmail, lookupCustomerByEmail]);

  const selectedCustomer = emailMatch ?? defaultCustomer;

  return (
    <fieldset className="space-y-4 rounded-md border border-gray-200 bg-white p-4">
      <legend className="px-1 text-sm font-medium">Vinculación con cliente</legend>

      <input type="hidden" name="customer-link-mode" value={linkMode} />

      {isLookingUpEmail && (
        <p className="text-xs text-muted-foreground">Buscando cliente por email...</p>
      )}

      {!isLookingUpEmail && emailMatch && linkMode === 'existing' && (
        <p className="text-xs text-green-700">
          Cliente encontrado por email: <span className="font-medium">{emailMatch.label}</span>
        </p>
      )}

      {!isLookingUpEmail && !emailMatch && userEmail.includes('@') && linkMode === 'create' && (
        <p className="text-xs text-amber-700">
          No hay un cliente con este email. Completamos los datos del nuevo cliente con la información del usuario.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="customer-link-mode-radio"
            checked={linkMode === 'existing'}
            onChange={() => setLinkMode('existing')}
          />
          Vincular a cliente existente
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="customer-link-mode-radio"
            checked={linkMode === 'create'}
            onChange={() => setLinkMode('create')}
          />
          Crear nuevo cliente
        </label>
      </div>

      {linkMode === 'existing' ? (
        <div>
          <CustomerSelectField
            key={selectedCustomer?.value ?? 'no-customer'}
            defaultValue={selectedCustomer}
            defaultEmail={userEmail}
            defaultFirstName={nameParts.firstName}
            defaultLastName={nameParts.lastName}
            defaultBusinessName={userName.trim()}
          />
          <FieldErrorDisplay id="customer-id-error" errors={errors?.customerId} />
        </div>
      ) : (
        <div className="space-y-4">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium">Tipo de cliente</legend>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="customer-type"
                  value="person"
                  checked={customerType === 'person'}
                  onChange={() => setCustomerType('person')}
                />
                <Person className="h-4 w-4" /> Persona
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="customer-type"
                  value="business"
                  checked={customerType === 'business'}
                  onChange={() => setCustomerType('business')}
                />
                <Business className="h-4 w-4" /> Empresa
              </label>
            </div>
          </fieldset>

          {customerType === 'business' ? (
            <div>
              <Label htmlFor="customer-name">Nombre de la empresa</Label>
              <Input
                id="customer-name"
                name="customer-name"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
              />
              <FieldErrorDisplay id="customer-name-error" errors={errors?.customerName} />
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="customer-first-name">Nombre</Label>
                <Input
                  id="customer-first-name"
                  name="customer-first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
                <FieldErrorDisplay id="customer-first-name-error" errors={errors?.customerFirstName} />
              </div>
              <div>
                <Label htmlFor="customer-last-name">Apellido</Label>
                <Input
                  id="customer-last-name"
                  name="customer-last-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
                <FieldErrorDisplay id="customer-last-name-error" errors={errors?.customerLastName} />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="customer-phone">Teléfono</Label>
            <Input
              id="customer-phone"
              name="customer-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              aria-describedby="customer-phone-error"
            />
            <FieldErrorDisplay id="customer-phone-error" errors={errors?.customerPhone} />
          </div>

          <p className="text-xs text-muted-foreground">
            El email del cliente será el mismo que el del usuario ({userEmail || 'completar arriba'}).
          </p>
        </div>
      )}
    </fieldset>
  );
}
