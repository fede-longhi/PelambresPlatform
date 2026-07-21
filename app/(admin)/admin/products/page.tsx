import { Suspense } from 'react';
import type { Metadata } from 'next';
import Search from '@/app/(admin)/admin/_components/search';
import Pagination from '@/components/ui/pagination';
import PageHeader from '@/components/ui/page-header';
import { fetchStoreProductPages } from '@/lib/data/store-product-data';
import { CreateProductButton } from './_components/buttons';
import ProductsTable from './_components/products-table';

export const metadata: Metadata = {
  title: 'Productos',
};

export default async function ProductsPage(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchStoreProductPages(query);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Productos" />
        <CreateProductButton />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Catálogo de la tienda: productos y diseños.
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar productos..." />
      </div>
      <Suspense key={query + currentPage} fallback={null}>
        <ProductsTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
