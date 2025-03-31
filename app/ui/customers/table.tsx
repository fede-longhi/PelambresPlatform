import { fetchFilteredCustomers } from "@/app/lib/customer-data";
import { Customer } from "@/app/lib/definitions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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
                    </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                    {
                        customers.map(customer => (
                            <TableRow key={customer.id} className="w-full border-b text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                                <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                                    {
                                        customer.type === 'person' ? 
                                        customer.last_name + ", " + customer.first_name
                                        :
                                        customer.name
                                    }
                                </TableCell>
                                <TableCell className="p-3">{customer.type}</TableCell>
                                <TableCell className="p-3">{customer.email}</TableCell>
                                <TableCell className="p-3">{customer.phone}</TableCell>
                            </TableRow>
                        ))
                    }
                        
                </TableBody>
            </Table>
            {/* <ul>
                {
                    customers.map(customer => (
                        <li key={customer.id}>{
                            customer.type == 'person' ?
                            customer.last_name + ", " + customer.first_name 
                            :
                            customer.name
                        }</li>
                    ))
                }
            </ul> */}
        </div>
    )
}