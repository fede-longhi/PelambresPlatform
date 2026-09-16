import { fetchFilteredPrinters } from "@/lib/data/printer-data";
import { getPrinterStatusLabel } from "@/lib/consts/printer-consts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function PrintersTable({
    query,
    currentPage
}:
{
    query: string,
    currentPage: number
}){
    const printers = await fetchFilteredPrinters(query, currentPage);

    if (printers.length === 0) {
        return (
            <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
                No se encontraron impresoras.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[200px]">Nombre</TableHead>
                    <TableHead className="w-[200px]">Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    printers.map((printer) => {
                        return (
                            <TableRow key={printer.id}>
                                <TableCell>{printer.name}</TableCell>
                                <TableCell>{getPrinterStatusLabel(printer.status)}</TableCell>
                            </TableRow>
                        );
                    })
                }
            </TableBody>
        </Table>
    );
}