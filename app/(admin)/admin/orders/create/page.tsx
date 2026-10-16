import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import CreateForm from '@/app/(admin)/admin/orders/_components/create-form';
import { fetchCustomerById } from '@/lib/data/customer-data';
import { getCustomerName } from '@/lib/utils';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PageProps = {
  searchParams?: Promise<{
    customerId?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawCustomerId = params?.customerId;
  const customerId =
    rawCustomerId && UUID_PATTERN.test(rawCustomerId)
      ? rawCustomerId
      : undefined;
  const customer = customerId ? await fetchCustomerById(customerId) : undefined;

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Pedidos', href: '/admin/orders' },
          {
            label: 'Nuevo pedido',
            href: '/admin/orders/create',
            active: true,
          },
        ]}
      />
      <div className="w-full max-w-xl">
        <CreateForm
          defaultCustomer={
            customer
              ? {
                  value: customer.id,
                  label: getCustomerName(customer),
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}
