import type { Metadata } from 'next';
import CategoryForm from '../_components/category-form';

export const metadata: Metadata = {
  title: 'Nueva categoría',
};

export default function CreateCategoryPage() {
  return <CategoryForm mode="create" />;
}
