'use client';

import { useState } from 'react';
import ColumnActionButton from '@/components/shared/column-action-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type {
  OrderPayment,
  OrderPaymentStatus,
  OrderStatus,
} from '@/types/order-definitions';
import OrderPaymentBadge from './order-payment-badge';
import OrderPaymentPanel from './order-payment-panel';
import OrderStatusForm from './order-status-form';

export function OrderStatusAction({
  orderId,
  status,
  customerEmail,
}: {
  orderId: string;
  status: OrderStatus;
  customerEmail: string | null;
}) {
  return (
    <OrderStatusForm
      inline
      orderId={orderId}
      status={status}
      customerEmail={customerEmail}
    />
  );
}

export function OrderPaymentAction({
  orderId,
  trackingCode,
  amountCents,
  paidAmountCents,
  paymentStatus,
  paidAt,
  payments,
}: {
  orderId: string;
  trackingCode: string;
  amountCents: number;
  paidAmountCents: number;
  paymentStatus: OrderPaymentStatus;
  paidAt: string | null;
  payments: OrderPayment[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ColumnActionButton
        label="Registrar pago"
        onClick={() => setOpen(true)}
      >
        <OrderPaymentBadge status={paymentStatus} />
      </ColumnActionButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
            <DialogDescription>Pedido {trackingCode}.</DialogDescription>
          </DialogHeader>
          {open ? (
            <OrderPaymentPanel
              key={`${paymentStatus}-${paidAmountCents}-${payments.length}`}
              orderId={orderId}
              amountCents={amountCents}
              paidAmountCents={paidAmountCents}
              paymentStatus={paymentStatus}
              paidAt={paidAt}
              payments={payments}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
