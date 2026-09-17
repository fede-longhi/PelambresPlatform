import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-muted-foreground" aria-hidden="true" />
      <h2 className="text-xl font-semibold">Pedido no encontrado</h2>
      <p className="text-sm text-muted-foreground">
        No existe un pedido con esa dirección.
      </p>
      <Button asChild className="mt-4">
        <Link href="/admin/orders">Volver a pedidos</Link>
      </Button>
    </main>
  );
}
