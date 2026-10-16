import { notFound } from 'next/navigation';
import {
  fetchCustomerById,
  fetchCustomerStats,
} from '@/lib/data/customer-data';
import Breadcrumbs from '@/app/(admin)/admin/_components/breadcrumbs';
import CustomerDetailCard from '@/app/(admin)/admin/customers/_components/detail-card';
import CustomerStatsCards from '@/app/(admin)/admin/customers/_components/customer-stats';
import {
  CreateOrderForCustomerButton,
  CreateQuoteForCustomerButton,
  EditCustomerButton,
} from '@/app/(admin)/admin/customers/_components/buttons';
import CustomerLastOrders from '@/app/(admin)/admin/orders/_components/customer-last-orders';
import CustomerLastQuotes from '@/app/(admin)/admin/quotes/_components/customer-last-quotes';
import CustomerTypeField from '@/app/(admin)/admin/customers/_components/type-field';
import { CardSkeleton } from '@/components/shared/skeletons';
import { getCustomerName } from '@/lib/utils';
import { lusitana } from '@/app/fonts';
import { Suspense } from 'react';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id: customerId } = await params;
  const customer = await fetchCustomerById(customerId);

  if (!customer) {
    notFound();
  }

  const stats = await fetchCustomerStats(customerId);
  const customerName = getCustomerName(customer);

  return (
    <div className="w-full max-w-5xl">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Clientes', href: '/admin/customers' },
          {
            label: customerName,
            href: `/admin/customers/${customerId}`,
            active: true,
          },
        ]}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className={`${lusitana.className} text-2xl`}>{customerName}</h1>
          <CustomerTypeField type={customer.type} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <CreateOrderForCustomerButton id={customerId} />
          <CreateQuoteForCustomerButton id={customerId} />
          <EditCustomerButton id={customerId} label="Editar" />
        </div>
      </div>

      <div className="mb-4">
        <CustomerStatsCards stats={stats} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex grow lg:max-w-sm">
            <CustomerDetailCard customer={customer} className="grow" />
          </div>
          <div className="flex min-w-0 grow">
            <Suspense fallback={<CardSkeleton />}>
              <CustomerLastOrders id={customerId} className="grow" />
            </Suspense>
          </div>
        </div>
        <Suspense fallback={<CardSkeleton />}>
          <CustomerLastQuotes id={customerId} />
        </Suspense>
      </div>
    </div>
  );
}
