'use client';

import { useState } from 'react';
import { PrintJob } from '@/types/definitions';
import PrintJobCreateForm from '@/app/(admin)/admin/print-jobs/_components/create-form';
import PrintJobList from '@/app/(admin)/admin/print-jobs/_components/print-job-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function OrderPrintJobsDetail({
  orderId,
  printJobs,
}: {
  orderId: string;
  printJobs?: PrintJob[];
}) {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const jobs = printJobs ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          Trabajos de impresión
          <span className="flex-1" />
          {!isCreateFormOpen ? (
            <Button
              type="button"
              size="icon"
              className="size-11 md:size-9"
              aria-label="Agregar trabajo de impresión"
              onClick={() => {
                setIsCreateFormOpen(true);
              }}
            >
              <Plus size={20} aria-hidden="true" />
            </Button>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCreateFormOpen ? (
          <PrintJobCreateForm
            orderId={orderId}
            handleCancel={() => {
              setIsCreateFormOpen(false);
            }}
          />
        ) : jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este pedido todavía no tiene trabajos de impresión.
          </p>
        ) : (
          <PrintJobList printJobs={jobs} />
        )}
      </CardContent>
    </Card>
  );
}
