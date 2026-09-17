import { Section, Text } from '@react-email/components';
import { BaseLayout } from '../base-layout';

type OrderStatusEmailProps = {
  clientName: string;
  trackingCode: string;
  statusLabel: string;
  estimatedDate?: string;
  body: string;
};

export function OrderStatusEmail({
  clientName,
  trackingCode,
  statusLabel,
  estimatedDate,
  body,
}: OrderStatusEmailProps) {
  return (
    <BaseLayout previewText={`Pedido ${trackingCode} — ${statusLabel}`}>
      <Section>
        <Text className="mx-0 my-[24px] p-0 text-center text-[22px] font-normal text-slate-800">
          Hola <strong>{clientName}</strong>
        </Text>
        <Text className="text-[14px] leading-[24px] text-slate-700">{body}</Text>
        <Text className="text-[14px] leading-[24px] text-slate-700">
          Código de seguimiento: <strong>{trackingCode}</strong>
        </Text>
        {estimatedDate ? (
          <Text className="text-[14px] leading-[24px] text-slate-700">
            Fecha estimada: {estimatedDate}
          </Text>
        ) : null}
      </Section>
    </BaseLayout>
  );
}
