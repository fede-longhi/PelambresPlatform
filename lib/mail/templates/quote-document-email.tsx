import { Column, Row, Section, Text } from '@react-email/components';
import { BaseLayout } from '../base-layout';

type QuoteDocumentEmailItem = {
  description: string;
  quantity: string;
  lineTotal: string;
};

type QuoteDocumentEmailProps = {
  clientName: string;
  quoteNumber: string;
  quoteDate: string;
  items: QuoteDocumentEmailItem[];
  subtotal: string;
  taxes: string;
  total: string;
  notes?: string;
};

export function QuoteDocumentEmail({
  clientName,
  quoteNumber,
  quoteDate,
  items,
  subtotal,
  taxes,
  total,
  notes,
}: QuoteDocumentEmailProps) {
  return (
    <BaseLayout previewText={`Presupuesto ${quoteNumber} — Pelambres 3D`}>
      <Section>
        <Text className="mx-0 my-[24px] p-0 text-center text-[22px] font-normal text-slate-800">
          Hola <strong>{clientName}</strong>
        </Text>
        <Text className="text-[14px] leading-[24px] text-slate-700">
          Te enviamos el presupuesto <strong>Nº {quoteNumber}</strong> de Pelambres
          3D ({quoteDate}).
        </Text>
      </Section>

      <Section className="mt-[16px] rounded-md border border-solid border-slate-200 p-[12px]">
        {items.length === 0 ? (
          <Text className="text-[14px] text-slate-600">Sin ítems.</Text>
        ) : (
          items.map((item) => (
            <Row key={`${item.description}-${item.quantity}`} className="mb-[8px]">
              <Column>
                <Text className="m-0 text-[14px] text-slate-800">
                  {item.description || 'Ítem'}
                </Text>
                <Text className="m-0 text-[12px] text-slate-500">
                  Cant. {item.quantity}
                </Text>
              </Column>
              <Column align="right">
                <Text className="m-0 text-[14px] text-slate-800">
                  {item.lineTotal}
                </Text>
              </Column>
            </Row>
          ))
        )}
      </Section>

      <Section className="mt-[16px]">
        <Text className="m-0 text-[14px] text-slate-600">Subtotal: {subtotal}</Text>
        <Text className="m-0 text-[14px] text-slate-600">Impuestos: {taxes}</Text>
        <Text className="mt-[8px] text-[16px] font-semibold text-slate-800">
          Total: {total}
        </Text>
      </Section>

      {notes ? (
        <Section className="mt-[16px]">
          <Text className="m-0 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
            Notas
          </Text>
          <Text className="whitespace-pre-wrap text-[14px] leading-[22px] text-slate-700">
            {notes}
          </Text>
        </Section>
      ) : null}

      <Text className="mt-[24px] text-[14px] leading-[24px] text-slate-700">
        Si tenés dudas, escribinos a contacto@pelambres.com.ar.
      </Text>
    </BaseLayout>
  );
}
