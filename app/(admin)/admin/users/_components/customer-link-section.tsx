'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [linkMode, setLinkMode] = useState<CustomerLinkMode>(
    defaultCustomer?.value ? 'existing' : 'existing'
  );
  const [customerType, setCustomerType] = useState<'person' | 'business'>('person');
  const [suggestedCustomer, setSuggestedCustomer] = useState<CustomerField | null>(null);
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

  useEffect(() => {
    const trimmedEmail = userEmail.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setSuggestedCustomer(null);
      return;
    }

    let cancelled = false;
    setIsLookingUpEmail(true);

    fetchCustomerByEmail(trimmedEmail)
      .then((customer) => {
        if (cancelled) {
          return;
        }

        if (customer) {
          setSuggestedCustomer({
            value: customer.id,
            label: getCustomerName(customer),
          });
        } else {
          setSuggestedCustomer(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLookingUpEmail(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  return (
    <fieldset className="space-y-4 rounded-md border border-gray-200 bg-white p-4">
      <legend className="px-1 text-sm font-medium">Vinculación con cliente</legend>

      <p className="text-xs text-muted-foreground">
        Varios usuarios pueden vincularse al mismo cliente empresa. El email del usuario no tiene
        que coincidir con el del cliente.
      </p>

      <input type="hidden" name="customer-link-mode" value={linkMode} />

      {isLookingUpEmail && (
        <p className="text-xs text-muted-foreground">Buscando cliente por email...</p>
      )}

      {!isLookingUpEmail && suggestedCustomer && linkMode === 'existing' && (
        <p className="text-xs text-slate-600">
          Sugerencia: existe un cliente con el mismo email ({suggestedCustomer.label}). Podés
          buscarlo en el selector o elegir otro cliente.
        </p>
      )}

      {!isLookingUpEmail && !suggestedCustomer && userEmail.includes('@') && linkMode === 'create' && (
        <p className="text-xs text-amber-700">
          No hay un cliente con este email. Completamos los datos del nuevo cliente con la
          información del usuario.
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
            key={defaultCustomer?.value ?? 'no-customer'}
            defaultValue={defaultCustomer}
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
                <FieldErrorDisplay
                  id="customer-first-name-error"
                  errors={errors?.customerFirstName}
                />
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
