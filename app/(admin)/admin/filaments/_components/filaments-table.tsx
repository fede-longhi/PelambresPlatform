import { fetchFilteredFilaments } from '@/lib/data/filaments-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeleteFilamentButton, EditFilamentButton } from './buttons';

function formatFilamentPrice(pricePerKg: number) {
  return Number(pricePerKg).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });
}

export default async function FilamentsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const filaments = await fetchFilteredFilaments(query, currentPage);

  if (filaments.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
        No hay filamentos todavía. Use Nuevo filamento para agregar el primero.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
      <div className="md:hidden">
        {filaments.map((filament) => (
          <div key={filament.id} className="mb-2 rounded-md bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{filament.brand}</p>
                <p className="text-sm text-muted-foreground">{filament.type}</p>
                <p className="mt-2 text-sm">
                  {formatFilamentPrice(filament.price_per_kg)} / kg
                </p>
              </div>
              <div className="flex">
                <EditFilamentButton filament={filament} />
                <DeleteFilamentButton filament={filament} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <Table className="min-w-full text-secondary-foreground">
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="border-0">
            <TableHead className="px-4 py-5 font-medium">Marca</TableHead>
            <TableHead className="px-4 py-5 font-medium">Tipo</TableHead>
            <TableHead className="px-4 py-5 font-medium">Precio / kg</TableHead>
            <TableHead className="px-4 py-5 font-medium">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {filaments.map((filament) => (
            <TableRow key={filament.id} className="border-0">
              <TableCell className="px-4 py-4">{filament.brand}</TableCell>
              <TableCell className="px-4 py-4">{filament.type}</TableCell>
              <TableCell className="px-4 py-4">
                {formatFilamentPrice(filament.price_per_kg)}
              </TableCell>
              <TableCell className="px-4 py-4 text-right">
                <div className="flex justify-end">
                  <EditFilamentButton filament={filament} />
                  <DeleteFilamentButton filament={filament} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>
    </div>
  );
}
