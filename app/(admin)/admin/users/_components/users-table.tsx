import { fetchFilteredUsers } from '@/lib/data/user-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { DeleteUserButton, EditUserButton } from './buttons';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types/user-definitions';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  customer: 'Cliente',
};

export default async function UsersTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const users = await fetchFilteredUsers(query, currentPage);

  if (users.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
        No se encontraron usuarios.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
      <Table className="min-w-full text-secondary-foreground">
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="border-0">
            <TableHead className="px-4 py-5 font-medium">Nombre</TableHead>
            <TableHead className="px-4 py-5 font-medium">Usuario</TableHead>
            <TableHead className="px-4 py-5 font-medium">Email</TableHead>
            <TableHead className="px-4 py-5 font-medium">Rol</TableHead>
            <TableHead className="px-4 py-5 font-medium">Estado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="w-full border-b text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
            >
              <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                <Link href={`/admin/users/${user.id}/edit`} className="hover:underline">
                  {user.name}
                </Link>
              </TableCell>
              <TableCell className="p-3">{user.username}</TableCell>
              <TableCell className="p-3">{user.email}</TableCell>
              <TableCell className="p-3">{ROLE_LABELS[user.role]}</TableCell>
              <TableCell className="p-3">
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="flex flex-row space-x-4">
                <EditUserButton id={user.id} />
                <DeleteUserButton id={user.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
