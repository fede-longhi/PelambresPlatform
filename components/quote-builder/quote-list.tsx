import { BudgetItem } from "@/app/lib/definitions";
import { Delete } from "@mui/icons-material";
import { Button } from "@/components/ui/button";

type QuoteListProps = {
    items?: BudgetItem[];
    isEditable?: boolean;
    onRemoveItem?: (id: string) => void;
};


export const QuoteList = ({
    items,
    isEditable,
    onRemoveItem = () => {}
}: QuoteListProps ) => {
    const budgetTotal = items ? items.reduce((sum, item) => sum + (item.individualPrice * item.quantity * (1 - item.discount/100)), 0) : 0;

    if (!items || items.length < 1) {
        return <p className="text-muted-foreground">Agregá items al presupuesto</p>
    }

    return (
        <div>
            <ul className="list-disc list-inside space-y-2">
                {
                    items.map((item) => (
                        <li key={item.id} className="flex justify-between bg-primary/10 rounded-lg p-2">
                            <div className="flex flex-col w-full">
                                <div className="flex flex-row justify-between items-center">
                                    <span className="font-bold text-secondary-foreground">{item.name}</span>
                                    {isEditable && (
                                        <Button
                                            onClick={() => onRemoveItem(item.id)}
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                        >
                                            <Delete className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>
                                <div className="flex flex-row mt-1 items-end justify-between">
                                    <div className="text-sm text-muted-foreground flex flex-col">
                                        <span className="font-semibold">Precio unitario</span>
                                        <span className="">${item.individualPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground flex flex-col">
                                        <span className="font-semibold">Unidades</span>
                                        <span className="text-center">{item.quantity}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground flex flex-col">
                                        <span className="font-semibold">Descuento</span>
                                        <span className="">${(item.individualPrice * item.quantity * (item.discount / 100)).toFixed(2)} ({item.discount}%)</span>
                                    </div>
                                </div>
                                <div className="text-muted-foreground flex flex-row space-x-2 mt-1 items-end font-semibold justify-end">
                                    <span>Precio total</span>
                                    <span className="">${(item.individualPrice * item.quantity * (1 - item.discount / 100)).toFixed(2)}</span>
                                </div>
                            </div>
                        </li>
                    ))
                }
            </ul>
            {
                budgetTotal > 0 &&
                <div className="flex flex-row justify-end mt-4 space-x-2 font-semibold text-lg">
                    <span>Total:</span>
                    <span className="">${budgetTotal.toFixed(2)}</span>
                </div>
            }
        </div>
    );
};