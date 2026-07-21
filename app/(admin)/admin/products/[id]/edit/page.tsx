import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchAllStoreCategories } from '@/lib/data/store-category-data';
import { fetchStoreProductById } from '@/lib/data/store-product-data';
import ProductForm from '../../_components/product-form';

export const metadata: Metadata = {
  title: 'Editar artículo',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    fetchStoreProductById(id),
    fetchAllStoreCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductForm mode="edit" product={product} categories={categories} />;
}
