'use client';

import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AddIcon from '@mui/icons-material/Add';
import QuotePreview from './quote-preview';
import { BudgetItem } from '@/app/lib/definitions';

export default function SimpleCalculator() {
    const [materialCost, setMaterialCost] = useState('20000');
    const [partWeight, setPartWeight] = useState('0');
    const [printTimeValue, setPrintTimeValue] = useState('500');
    const [printTime, setPrintTime] = useState('0');
    const [extraMaterialCost, setExtraMaterialCost] = useState('0');
    const [extraHandwork, setExtraHandwork] = useState('0');
    const [markup, setMarkup] = useState('150');
    const [itemDiscount, setItemDiscount] = useState('0');

    const [totalMaterialCost, setTotalMaterialCost] = useState(0);
    const [totalPrintTimeCost, setTotalPrintTimeCost] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [baseCost, setBaseCost] = useState(0);
    const [gain, setGain] = useState(0);
    const [discountValue, setDiscountValue] = useState(0);
    const [totalPriceAfterDiscount, setTotalPriceAfterDiscount] = useState(0);

    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState("1");

    const calculateCost = () => {
        const materialCostNum = parseFloat(materialCost) || 0;
        const partWeightNum = parseFloat(partWeight) || 0;
        const printTimeNum = parseFloat(printTime) || 0;
        const printTimeValueNum = parseFloat(printTimeValue) || 0;
        const extraMaterialCostNum = parseFloat(extraMaterialCost) || 0;
        const extraHandworkNum = parseFloat(extraHandwork) || 0;
        const markupNum = parseFloat(markup) || 0;
        const itemDiscountNum = parseFloat(itemDiscount) || 0;

        const calculatedMaterialCost = materialCostNum / 1000 * partWeightNum;
        const calculatedPrintTimeCost = printTimeNum * printTimeValueNum;
        const calculatedBaseCost = calculatedMaterialCost + calculatedPrintTimeCost + extraMaterialCostNum + extraHandworkNum;
        const finalCost = calculatedBaseCost * (1 + markupNum / 100);
        const gain = finalCost - calculatedBaseCost;
        const calculatedDiscountValue = finalCost * (itemDiscountNum / 100);
        const calculatedTotalPriceAfterDiscount = finalCost * (1 - itemDiscountNum / 100);

        setBaseCost(calculatedBaseCost);
        setGain(gain);
        setTotalMaterialCost(calculatedMaterialCost);
        setTotalPrintTimeCost(calculatedPrintTimeCost);
        setTotalCost(finalCost);
        setDiscountValue(calculatedDiscountValue);
        setTotalPriceAfterDiscount(calculatedTotalPriceAfterDiscount);
    };

    const handleAddToBudget = () => {
        if (!itemName) {
            return;
        }

        const individualPrice = parseFloat(totalCost.toFixed(2));
        const newItem = {
            id: crypto.randomUUID(),
            name: itemName,
            individualPrice: individualPrice,
            totalPrice: individualPrice * parseFloat(itemQuantity),
            quantity: parseFloat(itemQuantity),
            discount: parseFloat(itemDiscount),
        };

        setBudgetItems(prevItems => [...prevItems, newItem]);
        setItemName('');
    };

    const handleRemoveItem = (id: string) => {
        setBudgetItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    useEffect(() => {
        calculateCost();
    }, [materialCost, partWeight, printTime, printTimeValue, extraMaterialCost, extraHandwork, markup, itemDiscount, calculateCost]);

    return (
        <div className="bg-gray-100 min-h-screen p-8 flex items-start">
            <div className="flex flex-col lg:flex-row gap-8 w-full">
                <div className="flex-1 bg-white p-8 rounded-2xl shadow-lg max-w-[600px]">
                    <h1 className="text-3xl font-bold text-center text-primary mb-6">Calculadora de Costo</h1>
                    <p className="text-center text-gray-500 mb-8">
                        Calcula un precio estimado para tus impresiones 3D.
                    </p>
                    <div className="space-y-6">
                        <div>
                            <div className="flex flex-row gap-2">
                                <div>
                                    <Label htmlFor="materialCost">Costo filamento por kilo ($)</Label>
                                    <Input
                                        type="number"
                                        id="materialCost"
                                        name="materialCost"
                                        value={materialCost}
                                        onChange={(e) => setMaterialCost(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="partWeight">Peso de la pieza (gramos)</Label>
                                    <Input
                                        type="number"
                                        id="partWeight"
                                        name="partWeight"
                                        value={partWeight}
                                        onChange={(e) => setPartWeight(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mt-1">
                                { totalMaterialCost > 0 && 
                                    <p className="text-primary font-bold text-sm text-right">
                                        Costo de material: {totalMaterialCost}
                                    </p>
                                }
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex flex-row gap-2">
                                <div>
                                    <Label htmlFor="printTime">Precio hora de impresión</Label>
                                    <Input
                                        type="number"
                                        id="printValue"
                                        name="printValue"
                                        value={printTimeValue}
                                        onChange={(e) => setPrintTimeValue(e.target.value)}
                                    />

                                </div>
                                <div>
                                    <Label htmlFor="printTime">Tiempo de impresión (horas)</Label>
                                    <Input
                                        type="number"
                                        id="printTime"
                                        name="printTime"
                                        value={printTime}
                                        onChange={(e) => setPrintTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mt-1">
                                { totalPrintTimeCost > 0 && 
                                    <p className="text-primary font-bold text-sm text-right">
                                        Costo de tiempo de impresora: {totalPrintTimeCost}
                                    </p>
                                }
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="extraMaterial" className="block text-sm font-medium text-gray-700">Costo extra materiales ($)</Label>
                            <Input
                                type="number"
                                id="extraMaterial"
                                name="extraMaterial"
                                value={extraMaterialCost}
                                onChange={(e) => setExtraMaterialCost(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="extraHandwork" className="block text-sm font-medium text-gray-700">Costo extra trabajo ($)</Label>
                            <Input
                                type="number"
                                id="extraHandwork"
                                name="extraHandwork"
                                value={extraHandwork}
                                onChange={(e) => setExtraHandwork(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="markup" className="block text-sm font-medium text-gray-700">Margen de ganancia (%)</Label>
                            <Input
                                type="number"
                                id="markup"
                                name="markup"
                                value={markup}
                                onChange={(e) => setMarkup(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="itemDiscount">Descuento (%)</Label>
                            <Input
                                id="itemDiscount"
                                name="itemDiscount"
                                type="number"
                                placeholder="Descuento"
                                value={itemDiscount}
                                onChange={(e) => setItemDiscount(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm mb-1">
                            <p className="font-medium text-gray-700">Costo base:</p>
                            <p className="font-medium text-gray-900">${baseCost.toFixed(2)}</p>
                        </div>

                        <div className="flex justify-between items-center text-sm mb-2">
                            <p className="font-medium text-gray-700">Ganancia:</p>
                            <p className="font-medium text-gray-900">${gain.toFixed(2)}</p>
                        </div>

                        <div className="flex justify-between items-center text-sm mb-1 border-t border-gray-200 pt-2">
                            <p className="font-medium text-gray-700">Total:</p>
                            <p className="font-bold text-gray-900">${totalCost.toFixed(2)}</p>
                        </div>
                        {
                            discountValue > 0 &&
                            <div className="flex justify-between items-center text-sm">
                                <p className="font-medium text-gray-700">Descuento:</p>
                                <p className="font-semibold text-red-500">- ${discountValue.toFixed(2)}</p>
                            </div>
                        }

                        <p className="text-sm font-medium text-gray-700 mt-4">Valor total:</p>
                        <p className="mt-1 text-4xl font-extrabold text-primary mb-4">
                            ${totalPriceAfterDiscount.toFixed(2)}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <div className="flex-1">
                                <Label htmlFor="itemName">Nombre</Label>
                                <Input
                                    id="itemName"
                                    name="itemName"
                                    type="text"
                                    placeholder="Nombre del ítem (ej: prototipo)"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                            </div>
                            <div className="w-28">
                                <Label htmlFor="itemQuantity">Cantidad</Label>
                                <Input
                                    id="itemQuantity"
                                    name="itemQuantity"
                                    type="number"
                                    placeholder="Cantidad"
                                    value={itemQuantity}
                                    onChange={(e) => setItemQuantity(e.target.value)}
                                />
                            </div>
                            
                            
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button
                                onClick={handleAddToBudget}
                            >
                                <AddIcon className="w-4 h-4 mr-2" />
                                Agregar al presupuesto
                            </Button>
                        </div>
                    </div>
                </div>

                <div id="budget-panel" className="flex-1 bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-3xl font-bold text-center text-primary mb-6">Presupuesto</h2>
                    <QuotePreview
                        items={budgetItems}
                        onRemoveItem={handleRemoveItem}
                        onClearBudget={() => setBudgetItems([])}>
                    </QuotePreview>
                </div>
            </div>
        </div>
    );
}