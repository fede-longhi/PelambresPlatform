'use client';

import { useRef, useState } from "react";
import SimpleCalculator, { SimpleCalculatorHandle } from "@/components/simple-calculator/simple-calculator";
import QuoteBuilder from "@/components/quote-builder/quote-builder";
import { Add, Close, Calculate, PostAdd } from '@mui/icons-material';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BudgetItem } from '@/app/lib/definitions';

export default function Page(){
    const simpleCalculatorRef = useRef<SimpleCalculatorHandle>(null);
    const [isCalculatorVisible, setIsCalculatorVisible] = useState(true);
    const [isItemFormVisible, setIsItemFormVisible] = useState(false);
    const [item, setItem] = useState<BudgetItem>({ id: "", name: "", quantity: 1, individualPrice: 0, discount: 0, totalPrice: 0 });
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

    const addItemToBudget = () => {
        const simpleCalculator = simpleCalculatorRef.current;
        if (simpleCalculator) {
            const results = simpleCalculator.getResults();
            item.id = budgetItems.length.toString();
            if (!item.name) {
                item.name = `item ${(budgetItems.length + 1).toString()}`;
            }
            item.individualPrice = results.totalCost;
            item.discount = results.discountPercentage || 0;
            item.totalPrice = (item.individualPrice * item.quantity) * (1 - item.discount / 100);
        }
        setBudgetItems([...budgetItems, item]);
        setItem({ id: "", name: "", quantity: 1, individualPrice: 0, discount: 0, totalPrice: 0 });
    }

    return(
        <div className="flex flex-col md:flex-row justify-center w-full space-y-2 md:space-x-8 md:m-8">
            <ToolBox
                isCalculatorVisible={isCalculatorVisible}
                isItemFormVisible={isItemFormVisible} 
                setIsCalculatorVisible={setIsCalculatorVisible}
                setIsItemFormVisible={setIsItemFormVisible}
            />
            {
                isCalculatorVisible &&
                <div className="flex-1 bg-white p-4 md:p-8 rounded-2xl shadow-lg md:max-w-[600px]">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-xl md:text-3xl font-bold text-center text-primary mb-6">Calculadora de Costo</h1>
                        <div className="flex justify-end mb-4 text-primary">
                            <Button
                                className="rounded-full font-extrabold"
                                size="icon"
                                variant="ghost"
                                onClick={() => {setIsCalculatorVisible(false)}}
                            >
                                <Close sx={{fontSize: 40}}/>
                            </Button>
                        </div>
                    </div>

                    <SimpleCalculator ref={simpleCalculatorRef} />

                    <div className="flex flex-row justify-between items-end mt-6 space-x-2 bg-gray-100 p-4 rounded-lg">
                        {/* Contenedor del nombre del ítem */}
                        <div className="flex-grow">
                            <Label htmlFor="itemName">Nombre del ítem</Label>
                            <Input
                                type="text"
                                id="itemName"
                                value={item.name}
                                onChange={(e) => setItem({...item, name: e.target.value})}
                                placeholder="Nombre del ítem"
                                className="bg-white"
                            />
                        </div>
                        {/* Contenedor de la cantidad */}
                        <div className="w-32">
                            <Label htmlFor="itemQuantity">Cantidad</Label>
                            <Input
                                type="text"
                                id="itemQuantity"
                                value={item.quantity}
                                onChange={(e) => setItem({...item, quantity: Number(e.target.value)})}
                                placeholder="Cantidad"
                                className="bg-white"
                            />
                        </div>
                        <Button
                            onClick={addItemToBudget}
                            className="w-32 text-wrap h-full"
                        >
                            <Add sx={{fontSize: 20}} />
                            Agregar al presupuesto
                        </Button>
                    </div>
                </div>
            }
            {
                isItemFormVisible &&
                <div className="flex-1 bg-white p-8 rounded-2xl shadow-lg max-w-[600px]">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-3xl font-bold text-center text-primary mb-6">Nuevo Ítem</h1>
                        <div className="flex justify-end mb-4 text-primary">
                            <Button
                                className="rounded-full font-extrabold"
                                size="icon"
                                variant="ghost"
                                onClick={() => {setIsItemFormVisible(false)}}
                            >
                                <Close sx={{fontSize: 40}}/>
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <div>
                            <Label htmlFor="itemName">Nombre del ítem</Label>
                            <Input
                                type="text"
                                id="itemName"
                                value={item.name}
                                onChange={(e) => setItem({...item, name: e.target.value})}
                                placeholder="Nombre del ítem"
                                className="bg-white"
                            />
                        </div>
                        <div>
                            <Label htmlFor="itemQuantity">Cantidad</Label>
                            <Input
                                type="text"
                                id="itemQuantity"
                                value={item.quantity}
                                onChange={(e) => setItem({...item, quantity: Number(e.target.value)})}
                                placeholder="Cantidad"
                                className="bg-white"
                            />
                        </div>
                        <div>
                            <Label htmlFor="itemPrice">Precio Individual ($)</Label>
                            <Input
                                type="text"
                                id="itemPrice"
                                value={item.individualPrice}
                                onChange={(e) => setItem({...item, individualPrice: Number(e.target.value)})}
                                placeholder="Precio"
                                className="bg-white"
                            />
                        </div>
                        <div>
                            <Label htmlFor="itemDiscount">Descuento (%)</Label>
                            <Input
                                type="text"
                                id="itemDiscount"
                                value={item.discount}
                                onChange={(e) => setItem({...item, discount: Number(e.target.value)})}
                                placeholder="Precio"
                                className="bg-white"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={addItemToBudget}
                        className="w-full mt-6 text-wrap"
                    >
                        <Add sx={{fontSize: 20}} />
                        Agregar al presupuesto
                    </Button>
                </div>
            }
            <div id="budget-panel" className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">Presupuesto</h2>
                <QuoteBuilder
                    items={budgetItems}
                    onClearBudget={() => setBudgetItems([])}
                    onRemoveItem={(id) => setBudgetItems(budgetItems.filter(item => item.id !== id))}
                    defaultSender={{}}
                />
            </div>
        </div>
    )
}

const ToolBox = ({
    isCalculatorVisible,
    isItemFormVisible,
    setIsCalculatorVisible,
    setIsItemFormVisible,
    className
} : {
    isCalculatorVisible: boolean,
    isItemFormVisible: boolean,
    setIsCalculatorVisible: (value: boolean) => void,
    setIsItemFormVisible: (value: boolean) => void,
    className?: string
}) => {
    return (
        <div className={`flex flex-row md:flex-col justify-center md:justify-start mt-4 md:mt-0 space-x-16 md:space-x-0 md:space-y-4 ${className}`}>
            {
                !isCalculatorVisible &&
                <div className="flex flex-col items-center w-8">
                    <Calculate  
                        className="text-primary cursor-pointer"
                        sx={{ fontSize: 40 }}
                        onClick={() => { setIsCalculatorVisible(true); setIsItemFormVisible(false) }}
                    />
                    <span className="text-sm text-center text-muted-foreground">Abrir calculadora</span>
                </div>
            }
            {
                !isItemFormVisible &&
                <div className="flex flex-col items-center w-8">
                    <PostAdd
                        className="text-primary cursor-pointer"
                        sx={{fontSize: 40}}
                        onClick={() => {setIsItemFormVisible(true); setIsCalculatorVisible(false)}}
                    />
                    <span className="text-sm text-center text-muted-foreground">Abrir formulario de ítem</span>
                </div>
            }
        </div>
    );
}