import { fetchFilteredCustomers } from "@/app/lib/customer-data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { DeleteCustomerButton, EditCustomerButton } from "./buttons";
import { Building2, User } from "lucide-react";

export default async function CustomersTable ({
    query,
    currentPage,
}: {
    query: string;
    currentPage: number;
}) {
    const customers = await fetchFilteredCustomers(query, currentPage);

    return (
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <Table className="min-w-full text-secondary-foreground">
                <TableHeader className="[&_tr]:border-0">
                    <TableRow className="border-0">
                        <TableHead className="px-4 py-5 font-medium text-secondary-foreground">Name</TableHead>
                        <TableHead className="px-4 py-5 font-medium text-secondary-foreground">Type</TableHead>
                        <TableHead className="px-4 py-5 font-medium text-secondary-foreground">Email</TableHead>
                        <TableHead className="px-4 py-5 font-medium text-secondary-foreground">Phone</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                    {
                        customers.map(customer => (
                            <TableRow key={customer.id} className="w-full border-b text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                                <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                                    <Link href={`/admin/customers/${customer.id}`}>
                                        {
                                            customer.type === 'person' ? 
                                            <span className="flex flex-row items-center"><User className="mr-2"/> {customer.last_name + ", " + customer.first_name}</span>
                                            :
                                            <span className="flex flex-row items-center"><Building2 className="mr-2"/> {customer.name}</span>
                                        }
                                    </Link>
                                </TableCell>
                                <TableCell className="p-3">{customer.type}</TableCell>
                                <TableCell className="p-3">{customer.email}</TableCell>
                                <TableCell className="p-3">{customer.phone}</TableCell>
                                <TableCell className="flex flex-row space-x-4">
                                    <EditCustomerButton id={customer.id} />
                                    <DeleteCustomerButton id={customer.id} path='/admin/customers' />
                                </TableCell>
                            </TableRow>
                        ))
                    }
                        
                </TableBody>
            </Table>
        </div>
    )
}