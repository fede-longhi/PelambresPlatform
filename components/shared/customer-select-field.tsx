'use client';

import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Business, Person, Search, UnfoldMore } from '@mui/icons-material';
import { Add } from '@mui/icons-material';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import CustomerForm from '@/app/(admin)/admin/customers/_components/create-form';
import { fetchFilteredCustomers } from '@/lib/data/customer-data';
import { getCustomerName } from '@/lib/utils';
import type { Customer } from '@/types/definitions';

export type CustomerField = {
  value: string;
  label: string;
};

export default function CustomerSelectField({
  defaultValue,
  defaultEmail,
  defaultFirstName,
  defaultLastName,
  defaultBusinessName,
}: {
  defaultValue?: CustomerField;
  defaultEmail?: string;
  defaultFirstName?: string;
  defaultLastName?: string;
  defaultBusinessName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerField>(
    defaultValue ?? { value: '', label: '' }
  );
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  useEffect(() => {
    const loadCustomers = async () => {
      setIsSearchingCustomers(true);
      const customers = await fetchFilteredCustomers(defaultValue?.label ?? '', 1);
      setFilteredCustomers(customers);
      setIsSearchingCustomers(false);
    };

    loadCustomers();
  }, [defaultValue]);

  useEffect(() => {
    if (defaultValue?.value) {
      setSelectedCustomer(defaultValue);
    }
  }, [defaultValue]);

  const handleCustomerSearch = useDebouncedCallback(async (term: string) => {
    setIsSearchingCustomers(true);
    const customers = await fetchFilteredCustomers(term, 1);
    setFilteredCustomers(customers);
    setIsSearchingCustomers(false);
  }, 300);

  return (
    <div className="flex flex-col">
      <Label htmlFor="customerId" className="mb-2">
        Cliente
      </Label>
      <input type="hidden" name="customerId" value={selectedCustomer.value} />
      <div className="flex flex-col gap-2 md:flex-row">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between overflow-hidden md:w-[240px]"
              type="button"
            >
              <span className="max-w-[200px] truncate whitespace-nowrap">
                {selectedCustomer.value !== '' ? selectedCustomer.label : 'Seleccionar cliente...'}
              </span>
              <UnfoldMore className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0">
            <div className="flex items-center px-3 shadow-sm">
              <Search className="mr-2 h-4 w-4 shrink-0 text-primary opacity-50" fontSize="small" />
              <input
                className="flex h-10 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus:shadow-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Buscar cliente..."
                onChange={(event) => {
                  handleCustomerSearch(event.target.value);
                }}
              />
            </div>
            {isSearchingCustomers ? (
              <div className="flex justify-center p-6">
                <Spinner />
              </div>
            ) : (
              <ul className="max-h-[200px] overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <li
                    key={customer.id}
                    className="flex cursor-pointer items-center border-t p-2 text-xs"
                    onClick={() => {
                      setSelectedCustomer({
                        value: customer.id,
                        label: getCustomerName(customer),
                      });
                      setOpen(false);
                    }}
                  >
                    {customer.type === 'person' ? (
                      <Person className="mr-2" />
                    ) : (
                      <Business className="mr-2" />
                    )}
                    {getCustomerName(customer)}
                  </li>
                ))}
              </ul>
            )}
          </PopoverContent>
        </Popover>

        <Popover open={customerFormOpen} onOpenChange={setCustomerFormOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="bg-primary text-primary-foreground"
            >
              <Add /> Crear cliente
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex w-auto max-w-md">
            <CustomerForm
              key={`${defaultEmail ?? ''}-${defaultFirstName ?? ''}-${defaultLastName ?? ''}-${defaultBusinessName ?? ''}`}
              defaultEmail={defaultEmail}
              defaultFirstName={defaultFirstName}
              defaultLastName={defaultLastName}
              defaultBusinessName={defaultBusinessName}
              onSuccess={(customer?: Customer) => {
                setCustomerFormOpen(false);
                if (customer) {
                  setSelectedCustomer({
                    value: customer.id,
                    label: getCustomerName(customer),
                  });
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
