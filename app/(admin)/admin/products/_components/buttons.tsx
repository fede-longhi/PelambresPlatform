'use client';

import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { deleteStoreProduct } from '@/lib/actions/store-product-actions';

export function CreateProductButton() {
  return (
    <Button asChild>
      <Link href="/admin/products/create">
        <Plus className="mr-2 size-4" aria-hidden="true" />
        Nuevo artículo
      </Link>
    </Button>
  );
}

export function EditProductButton({ productId }: { productId: string }) {
  return (
    <Button variant="ghost" size="icon" asChild className="size-11 md:size-9">
      <Link href={`/admin/products/${productId}/edit`} aria-label="Editar producto">
        <Pencil size={18} aria-hidden="true" />
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
  return (
    <ConfirmDeleteButton
      variant="ghost"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      ariaLabel={`Eliminar producto ${productName}`}
      title="Eliminar producto"
      description={`Se eliminará "${productName}" del catálogo.`}
      onConfirm={() => deleteStoreProduct(productId)}
      icon={<Trash2 className="size-4" aria-hidden="true" />}
    />
  );
}
