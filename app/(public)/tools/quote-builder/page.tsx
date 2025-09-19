'use client';

import { useRef, useState } from "react";
import SimpleCalculator from "@/components/simple-calculator/simple-calculator";
import QuoteBuilder from "@/components/quote-builder/quote-builder";
import { Add, Close, Calculate, PostAdd } from '@mui/icons-material';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BudgetItem } from '@/app/lib/definitions';

export default function Page(){
    const simpleCalculatorRef = useRef<typeof SimpleCalculator>(null);
    const [isCalculatorVisible, setIsCalculatorVisible] = useState(true);
    const [isItemFormVisible, setIsItemFormVisible] = useState(false);
    const [item, setItem] = useState<BudgetItem>({ id: "", name: "", quantity: 1, individualPrice: 0, discount: 0, totalPrice: 0 });
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

    const addItemToBudget = () => {
        item.id = budgetItems.length.toString();
        if (!item.name) {
            item.name = `item ${(budgetItems.length + 1).toString()}`;
        }
        item.totalPrice = (item.individualPrice * item.quantity) * (1 - item.discount / 100);
        setBudgetItems([...budgetItems, item]);
        setItem({ id: "", name: "", quantity: 1, individualPrice: 0, discount: 0, totalPrice: 0 });
    }

    return(
        <div className="flex flex-row justify-center w-full space-x-8 m-8">
            <div className="flex flex-col space-y-4">
                {
                    !isCalculatorVisible &&
                    <Calculate  
                        className="text-primary cursor-pointer"
                        sx={{ fontSize: 40}}
                        onClick={() => {setIsCalculatorVisible(true); setIsItemFormVisible(false)}}
                    />
                }
                {
                    !isItemFormVisible &&
                    <PostAdd
                        className="text-primary cursor-pointer"
                        sx={{fontSize: 40}}
                        onClick={() => {setIsItemFormVisible(true); setIsCalculatorVisible(false)}}
                    />
                }
            </div>
            {
                isCalculatorVisible &&
                <div className="flex-1 bg-white p-8 rounded-2xl shadow-lg max-w-[600px]">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-3xl font-bold text-center text-primary mb-6">Calculadora de Costo</h1>
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
            <div id="budget-panel" className="flex-1 bg-white p-8 rounded-2xl shadow-lg">
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