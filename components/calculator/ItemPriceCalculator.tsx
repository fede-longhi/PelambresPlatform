'use client';

import React, { useMemo, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Printer, User, Box, TrendingUp, PackagePlus } from 'lucide-react';
import { QuoteItemCalculatorParams } from '@/types/quote';

export type ItemPriceCalculatorResults = {
    totalMaterialCost: number;
    totalMachineCost: number;
    totalLaborCost: number;
    totalExtraCost: number;
    baseCost: number;
    gain: number;
    totalCost: number; 
    discountValue: number;
    discountPercentage: number;
    totalPriceAfterDiscount: number;
};

export type ItemPriceCalculatorParams = QuoteItemCalculatorParams;

export interface ItemPriceCalculatorHandle {
    getResults: () => ItemPriceCalculatorResults;
    getParams: () => ItemPriceCalculatorParams;
    reset: () => void;
}

type ItemPriceCalculatorProps = {
    onResultsChange?: (results: ItemPriceCalculatorResults) => void;
    showDiscount?: boolean;
    defaultMaterialCost?: number;
    defaultMachineCostPerHour?: number;
    defaultLaborCostPerHour?: number;
    defaultMarkup?: number;
    initialValues?: Partial<ItemPriceCalculatorParams>;
};

const parseCalculatorNumber = (value: string) => parseFloat(value) || 0;

const buildDefaultParams = ({
    defaultMaterialCost,
    defaultMachineCostPerHour,
    defaultLaborCostPerHour,
    defaultMarkup,
    initialValues,
}: {
    defaultMaterialCost: number;
    defaultMachineCostPerHour: number;
    defaultLaborCostPerHour: number;
    defaultMarkup: number;
    initialValues?: Partial<ItemPriceCalculatorParams>;
}): ItemPriceCalculatorParams => ({
    materialCostPerKg: initialValues?.materialCostPerKg ?? defaultMaterialCost,
    partWeightGrams: initialValues?.partWeightGrams ?? 0,
    machineCostPerHour: initialValues?.machineCostPerHour ?? defaultMachineCostPerHour,
    printTimeH: initialValues?.printTimeH ?? 0,
    printTimeM: initialValues?.printTimeM ?? 0,
    laborCostPerHour: initialValues?.laborCostPerHour ?? defaultLaborCostPerHour,
    laborTimeH: initialValues?.laborTimeH ?? 0,
    laborTimeM: initialValues?.laborTimeM ?? 0,
    extraMaterialsCost: initialValues?.extraMaterialsCost ?? 0,
    markupPercentage: initialValues?.markupPercentage ?? defaultMarkup,
    discountPercentage: initialValues?.discountPercentage ?? 0,
});

const ItemPriceCalculator = forwardRef<ItemPriceCalculatorHandle, ItemPriceCalculatorProps>(
    ({
        onResultsChange,
        showDiscount = true,
        defaultMaterialCost = 20000,
        defaultMachineCostPerHour = 500, 
        defaultLaborCostPerHour = 5000,  
        defaultMarkup = 150,
        initialValues,
    }: ItemPriceCalculatorProps, ref) => {
        const defaultParams = buildDefaultParams({
            defaultMaterialCost,
            defaultMachineCostPerHour,
            defaultLaborCostPerHour,
            defaultMarkup,
            initialValues,
        });
        
        // 1. MATERIAL
        const [materialCostPerKg, setMaterialCostPerKg] = useState(defaultParams.materialCostPerKg.toString());
        const [partWeightGrams, setPartWeightGrams] = useState(defaultParams.partWeightGrams.toString());
        
        // 2. MÁQUINA
        const [machineCostPerHour, setMachineCostPerHour] = useState(defaultParams.machineCostPerHour.toString());
        const [printTimeH, setPrintTimeH] = useState(defaultParams.printTimeH.toString());
        const [printTimeM, setPrintTimeM] = useState(defaultParams.printTimeM.toString());
        
        // 3. MANO DE OBRA
        const [laborCostPerHour, setLaborCostPerHour] = useState(defaultParams.laborCostPerHour.toString());
        const [laborTimeH, setLaborTimeH] = useState(defaultParams.laborTimeH.toString()); 
        const [laborTimeM, setLaborTimeM] = useState(defaultParams.laborTimeM.toString()); 

        // 4. EXTRAS
        const [extraMaterialsCost, setExtraMaterialsCost] = useState(defaultParams.extraMaterialsCost.toString());
        
        // 5. NEGOCIO
        const [markupPercentage, setMarkupPercentage] = useState(defaultParams.markupPercentage.toString());
        const [discountPercentage, setDiscountPercentage] = useState(defaultParams.discountPercentage.toString());

        const currentParams = useMemo<ItemPriceCalculatorParams>(() => ({
            materialCostPerKg: parseCalculatorNumber(materialCostPerKg),
            partWeightGrams: parseCalculatorNumber(partWeightGrams),
            machineCostPerHour: parseCalculatorNumber(machineCostPerHour),
            printTimeH: parseCalculatorNumber(printTimeH),
            printTimeM: parseCalculatorNumber(printTimeM),
            laborCostPerHour: parseCalculatorNumber(laborCostPerHour),
            laborTimeH: parseCalculatorNumber(laborTimeH),
            laborTimeM: parseCalculatorNumber(laborTimeM),
            extraMaterialsCost: parseCalculatorNumber(extraMaterialsCost),
            markupPercentage: parseCalculatorNumber(markupPercentage),
            discountPercentage: parseCalculatorNumber(discountPercentage),
        }), [
            materialCostPerKg, partWeightGrams, machineCostPerHour,
            printTimeH, printTimeM, laborCostPerHour, laborTimeH, laborTimeM,
            extraMaterialsCost, markupPercentage, discountPercentage,
        ]);

        const results = useMemo(() => {
            const totalPrintTimeDecimal = currentParams.printTimeH + (currentParams.printTimeM / 60);
            const totalLaborTimeDecimal = currentParams.laborTimeH + (currentParams.laborTimeM / 60);

            const materialCost = (currentParams.materialCostPerKg / 1000) * currentParams.partWeightGrams;
            const machineCost = currentParams.machineCostPerHour * totalPrintTimeDecimal;
            const laborCost = currentParams.laborCostPerHour * totalLaborTimeDecimal;
            const extraCost = currentParams.extraMaterialsCost;

            const baseCost = materialCost + machineCost + laborCost + extraCost;
            
            const totalCost = baseCost * (1 + currentParams.markupPercentage / 100);
            const gain = totalCost - baseCost;
            
            const discountValue = showDiscount ? totalCost * (currentParams.discountPercentage / 100) : 0;
            const totalPriceAfterDiscount = totalCost - discountValue;

            return {
                totalMaterialCost: materialCost,
                totalMachineCost: machineCost,
                totalLaborCost: laborCost,
                totalExtraCost: extraCost,
                baseCost,
                gain,
                totalCost,
                discountValue,
                discountPercentage: showDiscount ? currentParams.discountPercentage : 0,
                totalPriceAfterDiscount,
            };
        }, [currentParams, showDiscount]);
        
        useEffect(() => {
            if (onResultsChange) onResultsChange(results);
        }, [results, onResultsChange]);

        useImperativeHandle(
            ref,
            () => ({
                getResults: () => results,
                getParams: () => currentParams,
                reset: () => {
                    const resetParams = buildDefaultParams({
                        defaultMaterialCost,
                        defaultMachineCostPerHour,
                        defaultLaborCostPerHour,
                        defaultMarkup,
                    });
                    setMaterialCostPerKg(resetParams.materialCostPerKg.toString());
                    setPartWeightGrams(resetParams.partWeightGrams.toString());
                    setMachineCostPerHour(resetParams.machineCostPerHour.toString());
                    setPrintTimeH(resetParams.printTimeH.toString());
                    setPrintTimeM(resetParams.printTimeM.toString());
                    setLaborCostPerHour(resetParams.laborCostPerHour.toString());
                    setLaborTimeH(resetParams.laborTimeH.toString());
                    setLaborTimeM(resetParams.laborTimeM.toString());
                    setExtraMaterialsCost(resetParams.extraMaterialsCost.toString());
                    setMarkupPercentage(resetParams.markupPercentage.toString());
                    setDiscountPercentage(resetParams.discountPercentage.toString());
                },
            }),
            [results, currentParams, defaultMaterialCost, defaultMachineCostPerHour, defaultLaborCostPerHour, defaultMarkup]
        );

        const { 
            totalMaterialCost, totalMachineCost, totalLaborCost, totalExtraCost,
            baseCost, gain, totalCost, discountValue, totalPriceAfterDiscount 
        } = results;

        return (
            <div className="flex flex-col gap-6">
                
                {/* 1. SECCIÓN MATERIAL */}
                <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Box size={14} /> Material
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="materialCost" className="text-xs text-slate-600">Costo Kilo ($)</Label>
                            <Input type="number" min="0" id="materialCost" value={materialCostPerKg} onChange={(e) => setMaterialCostPerKg(e.target.value)} className="mt-1 h-9" />
                        </div>
                        <div>
                            <Label htmlFor="partWeight" className="text-xs text-slate-600">Peso Pieza (g)</Label>
                            <Input type="number" min="0" id="partWeight" value={partWeightGrams} onChange={(e) => setPartWeightGrams(e.target.value)} className="mt-1 h-9" />
                        </div>
                    </div>
                    {totalMaterialCost > 0 && (
                        <p className="text-right text-sm font-medium text-slate-600">Subtotal: ${totalMaterialCost.toFixed(2)}</p>
                    )}
                </div>

                {/* 2. SECCIÓN MÁQUINA */}
                <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Printer size={14} /> Impresión (Luz y Desgaste)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="machineCost" className="text-xs text-slate-600">Costo Hora ($)</Label>
                            <Input type="number" min="0" id="machineCost" value={machineCostPerHour} onChange={(e) => setMachineCostPerHour(e.target.value)} className="mt-1 h-9" />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-600">Tiempo de Impresión</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="relative w-1/2">
                                    <Input type="number" min="0" value={printTimeH} onChange={(e) => setPrintTimeH(e.target.value)} className="h-9 pr-6" />
                                    <span className="absolute right-2 top-[10px] text-xs text-slate-400 font-medium">h</span>
                                </div>
                                <div className="relative w-1/2">
                                    <Input type="number" min="0" max="59" value={printTimeM} onChange={(e) => setPrintTimeM(e.target.value)} className="h-9 pr-7" />
                                    <span className="absolute right-2 top-[10px] text-xs text-slate-400 font-medium">m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {totalMachineCost > 0 && (
                        <p className="text-right text-sm font-medium text-slate-600">Subtotal: ${totalMachineCost.toFixed(2)}</p>
                    )}
                </div>

                {/* 3. SECCIÓN MANO DE OBRA */}
                <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <User size={14} /> Mano de Obra (Tu tiempo)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="laborCost" className="text-xs text-slate-600">Valor de tu Hora ($)</Label>
                            <Input type="number" min="0" id="laborCost" value={laborCostPerHour} onChange={(e) => setLaborCostPerHour(e.target.value)} className="mt-1 h-9" />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-600">Tiempo Invertido</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="relative w-1/2">
                                    <Input type="number" min="0" value={laborTimeH} onChange={(e) => setLaborTimeH(e.target.value)} className="h-9 pr-6" />
                                    <span className="absolute right-2 top-[10px] text-xs text-slate-400 font-medium">h</span>
                                </div>
                                <div className="relative w-1/2">
                                    <Input type="number" min="0" max="59" value={laborTimeM} onChange={(e) => setLaborTimeM(e.target.value)} className="h-9 pr-7" />
                                    <span className="absolute right-2 top-[10px] text-xs text-slate-400 font-medium">m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {totalLaborCost > 0 && (
                        <p className="text-right text-sm font-medium text-slate-600">Subtotal: ${totalLaborCost.toFixed(2)}</p>
                    )}
                </div>

                {/* 4. SECCIÓN EXTRAS */}
                <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <PackagePlus size={14} /> Costos Extra
                    </h4>
                    <div>
                        <Label htmlFor="extraCosts" className="text-xs text-slate-600">Materiales adicionales (imanes, insertos, etc.) ($)</Label>
                        <Input type="number" min="0" id="extraCosts" value={extraMaterialsCost} onChange={(e) => setExtraMaterialsCost(e.target.value)} className="mt-1 h-9 w-full" />
                    </div>
                    {totalExtraCost > 0 && (
                        <p className="text-right text-sm font-medium text-slate-600">Subtotal: ${totalExtraCost.toFixed(2)}</p>
                    )}
                </div>

                {/* 5. SECCIÓN NEGOCIO */}
                <div className="space-y-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp size={14} /> Rentabilidad
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="markup" className="text-xs text-slate-600">Margen Ganancia (%)</Label>
                            <Input type="number" min="0" id="markup" value={markupPercentage} onChange={(e) => setMarkupPercentage(e.target.value)} className="mt-1 h-9" />
                        </div>
                        {showDiscount && (
                            <div>
                                <Label htmlFor="discount" className="text-xs text-slate-600">Descuento (%)</Label>
                                <Input type="number" min="0" max="100" id="discount" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} className="mt-1 h-9" />
                            </div>
                        )}
                    </div>
                </div>
                
                {/* --- SECCIÓN DE RESULTADOS --- */}
                <div className="mt-2 bg-slate-800 text-white p-5 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center text-sm mb-2 text-slate-300">
                        <p>Costo base (Sin ganancia):</p>
                        <p>${baseCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>

                    <div className="flex justify-between items-center text-sm mb-4 text-slate-300">
                        <p>Ganancia neta:</p>
                        <p>${gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>

                    {showDiscount ? (
                        <>
                            <div className="flex justify-between items-center text-sm border-t border-slate-600 pt-3">
                                <p className="text-slate-300">Total Bruto:</p>
                                <p>${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            {discountValue > 0 && (
                                <div className="flex justify-between items-center text-sm mt-1">
                                    <p className="text-slate-300">Descuento:</p>
                                    <p className="text-red-400">- ${discountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                            )}
                            <div className="flex justify-between items-end border-t border-slate-600 pt-3 mt-3">
                                <p className="text-sm text-slate-300">Total Final:</p>
                                <p className="text-3xl font-extrabold text-emerald-400">
                                    ${totalPriceAfterDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-between items-end border-t border-slate-600 pt-3 mt-2">
                            <p className="text-sm text-slate-300">Precio de Venta:</p>
                            <p className="text-3xl font-extrabold text-emerald-400">
                                ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

ItemPriceCalculator.displayName = "ItemPriceCalculator";

export default ItemPriceCalculator;