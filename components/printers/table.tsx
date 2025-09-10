import { fetchFilteredPrinters } from "@/app/lib/printer-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export default async function PrintersTable({
    query,
    currentPage
}:
{
    query: string,
    currentPage: number
}){
    const printers = await fetchFilteredPrinters(query, currentPage);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="w-[200px]">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    printers.map((printer) => {
                        return (
                            <TableRow key={printer.id}>
                                <TableCell>{printer.name}</TableCell>
                                <TableCell>{printer.status}</TableCell>
                            </TableRow>
                        );
                    })
                }
            </TableBody>
        </Table>
    );
}