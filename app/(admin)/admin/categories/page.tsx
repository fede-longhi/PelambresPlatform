import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/page-header';
import { fetchStoreCategoriesByType } from '@/lib/data/store-category-data';
import { CategorySortableList } from './_components/category-sortable-list';

export const metadata: Metadata = {
  title: 'Categorías',
};

export default async function CategoriesPage() {
  const [productCategories, designCategories] = await Promise.all([
    fetchStoreCategoriesByType('product'),
    fetchStoreCategoriesByType('design'),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader title="Categorías" />
          <p className="mt-2 text-sm text-muted-foreground">
            Arrastrá para ordenar. El orden se usa en los filtros de cada
            subtienda.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/create">
            <Plus className="mr-2 size-4" />
            Nueva categoría
          </Link>
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <CategorySortableList
          productType="product"
          initialCategories={productCategories}
        />
        <CategorySortableList
          productType="design"
          initialCategories={designCategories}
        />
      </div>
    </div>
  );
}
