export const REGISTRATION_STATUSES = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'cancelled', label: 'Cancelado' }
] as const;

export const PAYMENT_STATUSES = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'partial', label: 'Señado (Parcial)' },
    { value: 'paid', label: 'Pagado' },
    { value: 'refunded', label: 'Devuelto' }
] as const;

export const PAYMENT_METHODS = [
    { value: 'transfer', label: 'Transferencia Bancaria' },
    { value: 'mercadopago', label: 'Mercado Pago' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'other', label: 'Otro' }
] as const;