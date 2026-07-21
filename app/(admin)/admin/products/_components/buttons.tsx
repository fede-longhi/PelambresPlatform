'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteStoreProduct } from '@/lib/actions/store-product-actions';

export function CreateProductButton() {
  return (
    <Button asChild>
      <Link href="/admin/products/create">
        <Plus className="mr-2 size-4" />
        Nuevo artículo
      </Link>
    </Button>
  );
}

export function EditProductButton({ productId }: { productId: string }) {
  return (
    <Button variant="ghost" size="icon" asChild title="Editar producto">
      <Link href={`/admin/products/${productId}/edit`}>
        <Pencil size={18} />
      </Link>
    </Button>
  );
}

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que querés eliminar el producto "${productName}"?`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteStoreProduct(productId);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al eliminar el producto.');
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
      title="Eliminar producto"
      type="button"
    >
      <Trash2 size={18} />
    </Button>
  );
}
