'use client';

import React, {
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type SimpleCalculatorResults = {
    baseCost: number;
    gain: number;
    totalMaterialCost: number;
    totalPrintTimeCost: number;
    totalCost: number;
    discountValue: number;
    discountPercentage: number;
    totalPriceAfterDiscount: number;
};

export interface SimpleCalculatorHandle {
    getResults: () => SimpleCalculatorResults;
    reset: () => void;
}

type SimpleCalculatorProps = {
    onResultsChange?: (results: SimpleCalculatorResults) => void;
    defaultMaterialCost?: number;
    defaultPrintTimeValue?: number;
    defaultMarkup?: number;
};

const SimpleCalculator = forwardRef<SimpleCalculatorHandle, SimpleCalculatorProps>(
({
    onResultsChange,
    defaultMaterialCost,
    defaultPrintTimeValue,
    defaultMarkup 
}: SimpleCalculatorProps, ref) => {
    const [materialCost, setMaterialCost] = useState(defaultMaterialCost?.toString() || '20000');
    const [partWeight, setPartWeight] = useState('0');
    const [printTimeValue, setPrintTimeValue] = useState(defaultPrintTimeValue?.toString() || '500');
    const [printTime, setPrintTime] = useState('0');
    const [extraMaterialCost, setExtraMaterialCost] = useState('0');
    const [extraHandwork, setExtraHandwork] = useState('0');
    const [markup, setMarkup] = useState(defaultMarkup?.toString() || '150');
    const [itemDiscount, setItemDiscount] = useState('0');

    const results = useMemo(() => {
        const materialCostNum = parseFloat(materialCost) || 0;
        const partWeightNum = parseFloat(partWeight) || 0;
        const printTimeNum = parseFloat(printTime) || 0;
        const printTimeValueNum = parseFloat(printTimeValue) || 0;
        const extraMaterialCostNum = parseFloat(extraMaterialCost) || 0;
        const extraHandworkNum = parseFloat(extraHandwork) || 0;
        const markupNum = parseFloat(markup) || 0;
        const itemDiscountNum = parseFloat(itemDiscount) || 0;

        const totalMaterialCost = (materialCostNum / 1000) * partWeightNum;
        const totalPrintTimeCost = printTimeNum * printTimeValueNum;
        const baseCost = totalMaterialCost + totalPrintTimeCost + extraMaterialCostNum + extraHandworkNum;
        const totalCost = baseCost * (1 + markupNum / 100);
        const gain = totalCost - baseCost;
        const discountValue = totalCost * (itemDiscountNum / 100);
        const totalPriceAfterDiscount = totalCost - discountValue;

        return {
            baseCost,
            gain,
            totalMaterialCost,
            totalPrintTimeCost,
            totalCost,
            discountValue,
            discountPercentage: itemDiscountNum,
            totalPriceAfterDiscount,
        };
    }, [
        materialCost,
        partWeight,
        printTime,
        printTimeValue,
        extraMaterialCost,
        extraHandwork,
        markup,
        itemDiscount,
    ]);
    
    useEffect(() => {
        if (onResultsChange) onResultsChange(results);
    }, [results, onResultsChange]);

    useImperativeHandle(
        ref,
        () => ({
        getResults: () => results,
        reset: () => {
            setMaterialCost('20000');
            setPartWeight('0');
            setPrintTimeValue('500');
            setPrintTime('0');
            setExtraMaterialCost('0');
            setExtraHandwork('0');
            setMarkup('150');
            setItemDiscount('0');
        },
        }),
        [results]
    );

    const {
        baseCost,
        gain,
        totalMaterialCost,
        totalPrintTimeCost,
        totalCost,
        discountValue,
        totalPriceAfterDiscount,
    } = results;

    return (
        <div>

            <div className="space-y-2">
                <div>
                    <div className="flex flex-row gap-2">
                        <div className="flex flex-col justify-end gap-2">
                            <Label htmlFor="materialCost">Costo filamento por kilo ($)</Label>
                            <Input
                                type="number"
                                id="materialCost"
                                name="materialCost"
                                value={materialCost}
                                onChange={(e) => setMaterialCost(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col justify-end gap-2">
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
                                Costo de material: {totalMaterialCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                            </p>
                        }
                    </div>
                </div>
                
                <div>
                    <div className="flex flex-row gap-2">
                        <div className="flex flex-col justify-end gap-2">
                            <Label htmlFor="printValue">Costo hora de impresión</Label>
                            <Input
                                type="number"
                                id="printValue"
                                name="printValue"
                                value={printTimeValue}
                                onChange={(e) => setPrintTimeValue(e.target.value)}
                            />

                        </div>
                        <div className="flex flex-col justify-end gap-2">
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
                                Costo de tiempo de impresora: {totalPrintTimeCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                            </p>
                        }
                    </div>
                </div>
                <div>
                    <Label htmlFor="extraMaterial">Costo extra materiales ($)</Label>
                    <Input
                        type="number"
                        id="extraMaterial"
                        name="extraMaterial"
                        value={extraMaterialCost}
                        onChange={(e) => setExtraMaterialCost(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="extraHandwork">Costo extra trabajo ($)</Label>
                    <Input
                        type="number"
                        id="extraHandwork"
                        name="extraHandwork"
                        value={extraHandwork}
                        onChange={(e) => setExtraHandwork(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="markup">Margen de ganancia (%)</Label>
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
                    <p className="font-medium text-gray-900">${baseCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div className="flex justify-between items-center text-sm mb-2">
                    <p className="font-medium text-gray-700">Ganancia:</p>
                    <p className="font-medium text-gray-900">${gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div className="flex justify-between items-center text-sm mb-1 border-t border-gray-200 pt-2">
                    <p className="font-medium text-gray-700">Total:</p>
                    <p className="font-bold text-gray-900">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                {
                    discountValue > 0 &&
                    <div className="flex justify-between items-center text-sm">
                        <p className="font-medium text-gray-700">Descuento:</p>
                        <p className="font-semibold text-red-500">- ${discountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                }

                <p className="text-sm font-medium text-gray-700 mt-4">Valor total:</p>
                <p className="mt-1 text-4xl font-extrabold text-primary mb-4">
                    ${totalPriceAfterDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    );
});

SimpleCalculator.displayName = "SimpleCalculator";

export default SimpleCalculator;