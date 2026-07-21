import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchStoreCategoryById } from '@/lib/data/store-category-data';
import CategoryForm from '../../_components/category-form';

export const metadata: Metadata = {
  title: 'Editar categoría',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await fetchStoreCategoryById(id);

  if (!category) {
    notFound();
  }

  return <CategoryForm mode="edit" category={category} />;
}
