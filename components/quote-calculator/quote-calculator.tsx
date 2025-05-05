"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuoteCalculatorProps {
    pricePerKg: number;
    pricePerHour: number;
    className?: string;
}

export default function QuoteCalculator({pricePerKg, pricePerHour, className } : QuoteCalculatorProps) {
  const [weight, setWeight] = useState(0);
  const [hoursDuration, setHoursDuration] = useState(0); 
  const [minutesDuration, setMinutesDuration] = useState(0);
  const [cost, setCost] = useState<number | null>(null);

  const calcularPrecio = () => {
    const totalDuration = hoursDuration + (minutesDuration / 60);
    const total = weight * pricePerKg / 1000 + totalDuration * pricePerHour;
    setCost(total);
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
        <div className="flex flex-row items-center text-center">
            <Input
                className="w-12"
                id="hours"
                name="amount"
                type="number"
                defaultValue={hoursDuration}
                onChange={(e)=>{setHoursDuration(Number(e.target.value))}}
                placeholder="00"
                aria-describedby="amount-error"
            />
            <span className="mx-2">
                :
            </span>
            <Input
                className="w-12"
                id="minutes"
                name="minutes"
                type="number"
                defaultValue={minutesDuration}
                onChange={(e)=>(setMinutesDuration(Number(e.target.value)))}
                placeholder="00"
                aria-describedby="amount-error"
            />
        </div>
        <div className="flex flex-row items-end">
            <Input
                className="w-12"
                id="weight"
                name="weight"
                type="number"
                defaultValue={weight}
                onChange={(e) => (setWeight(Number(e.target.value)))}
                placeholder="0"
            />
            <span className="ml-2">g</span>
        </div>
        <Button
            className="w-fit"
            onClick={calcularPrecio}
        >
          Calcular
        </Button>

        {cost !== null && (
          <div className="text-lg font-semibold">
            Precio estimado: ${cost.toFixed(2)}
          </div>
        )}

    </div>
    
  );
}
