'use client';

import React, { useMemo, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Printer, User, Box, TrendingUp, PackagePlus } from 'lucide-react'; 

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

export interface ItemPriceCalculatorHandle {
    getResults: () => ItemPriceCalculatorResults;
    reset: () => void;
}

type ItemPriceCalculatorProps = {
    onResultsChange?: (results: ItemPriceCalculatorResults) => void;
    showDiscount?: boolean;
    defaultMaterialCost?: number;
    defaultMachineCostPerHour?: number;
    defaultLaborCostPerHour?: number;
    defaultMarkup?: number;
};

const ItemPriceCalculator = forwardRef<ItemPriceCalculatorHandle, ItemPriceCalculatorProps>(
    ({
        onResultsChange,
        showDiscount = true,
        defaultMaterialCost = 20000,
        defaultMachineCostPerHour = 500, 
        defaultLaborCostPerHour = 5000,  
        defaultMarkup = 150
    }: ItemPriceCalculatorProps, ref) => {
        
        // 1. MATERIAL
        const [materialCostPerKg, setMaterialCostPerKg] = useState(defaultMaterialCost.toString());
        const [partWeightGrams, setPartWeightGrams] = useState('0');
        
        // 2. MÁQUINA
        const [machineCostPerHour, setMachineCostPerHour] = useState(defaultMachineCostPerHour.toString());
        const [printTimeH, setPrintTimeH] = useState('0');
        const [printTimeM, setPrintTimeM] = useState('0');
        
        // 3. MANO DE OBRA
        const [laborCostPerHour, setLaborCostPerHour] = useState(defaultLaborCostPerHour.toString());
        const [laborTimeH, setLaborTimeH] = useState('0'); 
        const [laborTimeM, setLaborTimeM] = useState('0'); 

        // 4. EXTRAS
        const [extraMaterialsCost, setExtraMaterialsCost] = useState('0');
        
        // 5. NEGOCIO
        const [markupPercentage, setMarkupPercentage] = useState(defaultMarkup.toString());
        const [discountPercentage, setDiscountPercentage] = useState('0');

        const results = useMemo(() => {
            const val = (str: string) => parseFloat(str) || 0;

            const totalPrintTimeDecimal = val(printTimeH) + (val(printTimeM) / 60);
            const totalLaborTimeDecimal = val(laborTimeH) + (val(laborTimeM) / 60);

            const materialCost = (val(materialCostPerKg) / 1000) * val(partWeightGrams);
            const machineCost = val(machineCostPerHour) * totalPrintTimeDecimal;
            const laborCost = val(laborCostPerHour) * totalLaborTimeDecimal;
            const extraCost = val(extraMaterialsCost);

            const baseCost = materialCost + machineCost + laborCost + extraCost;
            
            const totalCost = baseCost * (1 + val(markupPercentage) / 100);
            const gain = totalCost - baseCost;
            
            const discountValue = showDiscount ? totalCost * (val(discountPercentage) / 100) : 0;
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
                discountPercentage: showDiscount ? val(discountPercentage) : 0,
                totalPriceAfterDiscount,
            };
        }, [
            materialCostPerKg, partWeightGrams, machineCostPerHour, 
            printTimeH, printTimeM, 
            laborCostPerHour, 
            laborTimeH, laborTimeM, 
            extraMaterialsCost, markupPercentage, discountPercentage, showDiscount
        ]);
        
        useEffect(() => {
            if (onResultsChange) onResultsChange(results);
        }, [results, onResultsChange]);

        useImperativeHandle(
            ref,
            () => ({
                getResults: () => results,
                reset: () => {
                    setMaterialCostPerKg(defaultMaterialCost.toString());
                    setPartWeightGrams('0');
                    setMachineCostPerHour(defaultMachineCostPerHour.toString());
                    setPrintTimeH('0');
                    setPrintTimeM('0');
                    setLaborCostPerHour(defaultLaborCostPerHour.toString());
                    setLaborTimeH('0');
                    setLaborTimeM('0');
                    setExtraMaterialsCost('0');
                    setMarkupPercentage(defaultMarkup.toString());
                    setDiscountPercentage('0');
                },
            }),
            [results, defaultMaterialCost, defaultMachineCostPerHour, defaultLaborCostPerHour, defaultMarkup]
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