import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ItemPriceCalculator, { ItemPriceCalculatorHandle } from '@/components/calculator/ItemPriceCalculator';
import { QuoteItemCalculatorParams } from '@/types/quote';

type CalculatorModalProps = {
    isOpen: boolean;
    itemId?: string | null;
    initialParams?: QuoteItemCalculatorParams;
    onClose: () => void;
    onApply: (calculatedPrice: number, params: QuoteItemCalculatorParams) => void;
};

export function CalculatorModal({ isOpen, itemId, initialParams, onClose, onApply }: CalculatorModalProps) {
    const calculatorRef = useRef<ItemPriceCalculatorHandle>(null);

    const handleApply = () => {
        if (calculatorRef.current) {
            const results = calculatorRef.current.getResults();
            const params = calculatorRef.current.getParams();
            onApply(results.totalCost, params);
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
                    {isOpen && (
                        <ItemPriceCalculator 
                            key={itemId ?? 'calculator'}
                            ref={calculatorRef} 
                            showDiscount={false}
                            initialValues={initialParams}
                        />
                    )}
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
