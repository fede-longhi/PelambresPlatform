import Link from 'next/link';
import { fetchFilteredStoreProducts } from '@/lib/data/store-product-data';
import {
  formatStoreDiscountLabel,
  formatStorePrice,
  getStoreFinalPriceCents,
  getStoreProductTypeLabel,
  hasStoreDiscount,
} from '@/lib/consts/store-consts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DeleteProductButton,
  EditProductButton,
} from './buttons';

export default async function ProductsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const products = await fetchFilteredStoreProducts(query, currentPage);

  if (products.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
        No hay artículos todavía. Creá el primero para armar el catálogo.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
      <Table className="min-w-full text-secondary-foreground">
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="border-0">
            <TableHead className="px-4 py-5 font-medium">Nombre</TableHead>
            <TableHead className="px-4 py-5 font-medium">Tipo</TableHead>
            <TableHead className="px-4 py-5 font-medium">Categorías</TableHead>
            <TableHead className="px-4 py-5 font-medium">Precio</TableHead>
            <TableHead className="px-4 py-5 font-medium">Estado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="w-full border-b text-sm last-of-type:border-none"
            >
              <TableCell className="px-4 py-4">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="font-medium hover:underline"
                >
                  {product.name}
                </Link>
              </TableCell>
              <TableCell className="px-4 py-4">
                {getStoreProductTypeLabel(product.productType)}
              </TableCell>
              <TableCell className="px-4 py-4">
                {product.categories.length > 0
                  ? product.categories.map((category) => category.name).join(', ')
                  : '—'}
              </TableCell>
              <TableCell className="px-4 py-4">
                {hasStoreDiscount(product.discountPercent) ? (
                  <div className="space-y-0.5">
                    <p className="font-medium">
                      {formatStorePrice(
                        getStoreFinalPriceCents(
                          product.priceCents,
                          product.discountPercent
                        ),
                        product.currency
                      )}
                      <span className="ml-2 rounded-full bg-secondary px-1.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {formatStoreDiscountLabel(product.discountPercent!)}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 line-through">
                      {formatStorePrice(product.priceCents, product.currency)}
                    </p>
                  </div>
                ) : (
                  formatStorePrice(product.priceCents, product.currency)
                )}
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="flex flex-wrap gap-1">
                  {product.isPublished ? (
                    <Badge>Publicado</Badge>
                  ) : (
                    <Badge variant="secondary">Borrador</Badge>
                  )}
                  {product.isFeatured && (
                    <Badge variant="outline">Destacado</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="px-4 py-4">
                <div className="flex justify-end gap-1">
                  <EditProductButton productId={product.id} />
                  <DeleteProductButton
                    productId={product.id}
                    productName={product.name}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
