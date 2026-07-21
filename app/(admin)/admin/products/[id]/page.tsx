import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchStoreProductById } from '@/lib/data/store-product-data';
import { DeleteProductButton } from '../_components/buttons';
import { ProductDetailsCard } from '../_components/product-details-card';

export const metadata: Metadata = {
  title: 'Detalle de artículo',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await fetchStoreProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 md:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/admin/products">
            <Button variant="outline" size="icon" className="shrink-0">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
              {product.isPublished ? (
                <Badge>Publicado</Badge>
              ) : (
                <Badge variant="secondary">Borrador</Badge>
              )}
              {product.isFeatured && <Badge variant="outline">Destacado</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 self-end sm:self-start">
          <DeleteProductButton
            productId={product.id}
            productName={product.name}
          />
        </div>
      </div>

      {product.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.name}
          className="max-h-72 w-full rounded-xl object-cover"
        />
      )}

      <ProductDetailsCard product={product} />
    </div>
  );
}
