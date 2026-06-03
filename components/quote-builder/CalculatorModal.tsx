import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ItemPriceCalculator, { ItemPriceCalculatorHandle } from '@/components/calculator/ItemPriceCalculator';

type CalculatorModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onApply: (calculatedPrice: number) => void;
};

export function CalculatorModal({ isOpen, onClose, onApply }: CalculatorModalProps) {
    const calculatorRef = useRef<ItemPriceCalculatorHandle>(null);

    const handleApply = () => {
        if (calculatorRef.current) {
            const results = calculatorRef.current.getResults();
            onApply(results.totalCost);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Calculadora de Costos 3D</DialogTitle>
                </DialogHeader>
                
                <div className="py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <ItemPriceCalculator 
                        ref={calculatorRef} 
                        showDiscount={false}
                    />
                </div>
                
                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleApply}>
                        Aplicar al Ítem
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}