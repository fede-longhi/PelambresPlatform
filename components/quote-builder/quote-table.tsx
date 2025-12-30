
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Delete } from '@mui/icons-material';
import { BudgetItem } from '@/types/definitions';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from "react";

type QuoteTableProps = {
    items?: BudgetItem[];
    isEditable?: boolean;
    onRemoveItem?: (id: string) => void;
};

const QuoteTable = ({
    items,
    isEditable,
    onRemoveItem = () => {}
}: QuoteTableProps) => {

    const [showDiscountColumn, setShowDiscountColumn] = useState(true);

    const budgetTotal = items ? items.reduce((sum, item) => sum + (item.individualPrice * item.quantity * (1 - item.discount/100)), 0) : 0;

    const getColSpan = () => {
        return showDiscountColumn ? 3 : 2;
    }

    if (!items || items.length < 1) {
        return <p className="text-muted-foreground">Agregá items al presupuesto</p>
    }

    return (
        <div>
            {
                isEditable &&
                <div className="flex flex-row items-center space-x-2 justify-end mb-2">
                    <Label htmlFor="toggle-discount-column" className="">Mostrar columna de descuento</Label>
                    <Switch
                        id="toggle-discount-column"
                        checked={showDiscountColumn}
                        onCheckedChange={() => setShowDiscountColumn(!showDiscountColumn)}
                    />
                </div>
            }
            <Table>
                <TableHeader>
                    <TableRow className="">
                        <TableHead className="w-[100px]">Descripción</TableHead>
                        <TableHead className="text-right">Precio unitario</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        {
                            showDiscountColumn &&
                            <TableHead className="text-right">Descuento</TableHead>
                        }
                        <TableHead className="text-right">Precio Total</TableHead>
                        {
                            isEditable &&
                            <TableHead className="w-[40px]">Action</TableHead>
                        }
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items && items.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="pl-2">{item.name}</TableCell>
                            <TableCell className="text-right">${item.individualPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            {
                                showDiscountColumn &&
                                <TableCell className="text-right">${(item.individualPrice * item.quantity * (item.discount/100)).toFixed(2)} ({item.discount.toFixed(2)}%)</TableCell>
                            }
                            <TableCell className="text-right">${(item.individualPrice * item.quantity * (1 - item.discount/100)).toFixed(2)}</TableCell>
                            {
                                isEditable &&
                                <TableCell>
                                    <Button
                                        onClick={() => onRemoveItem(item.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                    >
                                        <Delete className="w-5 h-5" />
                                    </Button>
                                </TableCell>
                            }
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={getColSpan()}></TableCell>
                        <TableCell className="font-semibold text-right">Total</TableCell>
                        <TableCell className="text-right text-primary font-bold">${budgetTotal.toFixed(2)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}

export default QuoteTable;