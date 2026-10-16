import { Customer } from '@/types/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Mail, Phone } from 'lucide-react';

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  );
}

export default function CustomerDetailCard({
  customer,
  className,
}: {
  customer: Customer;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Datos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {customer.type === 'business' ? (
          <DetailField label="Nombre">{customer.name || '—'}</DetailField>
        ) : (
          <>
            <DetailField label="Nombre">{customer.first_name || '—'}</DetailField>
            <DetailField label="Apellido">{customer.last_name || '—'}</DetailField>
          </>
        )}

        <DetailField label="Email">
          {customer.email ? (
            <a
              href={`mailto:${customer.email}`}
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              {customer.email}
            </a>
          ) : (
            '—'
          )}
        </DetailField>

        <DetailField label="Teléfono">
          {customer.phone ? (
            <a
              href={`tel:${customer.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              <Phone className="size-3.5 shrink-0" aria-hidden="true" />
              {customer.phone}
            </a>
          ) : (
            '—'
          )}
        </DetailField>

        <DetailField label="Dirección">
          {customer.address ? (
            <span className="inline-flex items-start gap-1.5">
              <MapPin
                className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              {customer.address}
            </span>
          ) : (
            '—'
          )}
        </DetailField>
      </CardContent>
    </Card>
  );
}
