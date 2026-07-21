import type { Metadata } from 'next';
import { fetchAllStoreCategories } from '@/lib/data/store-category-data';
import ProductForm from '../_components/product-form';

export const metadata: Metadata = {
  title: 'Nuevo artículo',
};

export default async function CreateProductPage() {
  const categories = await fetchAllStoreCategories();
  return <ProductForm mode="create" categories={categories} />;
}
