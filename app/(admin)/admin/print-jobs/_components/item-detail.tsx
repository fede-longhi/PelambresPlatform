import { PrintJob } from '@/types/definitions';
import {
  DeletePrintJob,
  FailPrintJob,
  FinishPrintJob,
  StartPrintJob,
} from './buttons';
import PrintJobStatusField from './status-field';
import Link from 'next/link';

export function PrintJobItemDetail({ printJob }: { printJob: PrintJob }) {
  return (
    <li className="flex flex-col gap-2 rounded-md bg-muted p-3 text-sm sm:flex-row sm:items-center sm:gap-3">
      <Link
        href={`/admin/print-jobs/${printJob.id}`}
        className="min-w-0 truncate font-medium text-primary hover:underline"
      >
        {printJob.name}
      </Link>

      <PrintJobStatusField status={printJob.status} />

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {printJob.status === 'pending' ? (
          <StartPrintJob
            id={printJob.id}
            revalidatePath={`/admin/orders/${printJob.order_id}`}
          />
        ) : null}
        {printJob.status !== 'pending' &&
        printJob.status !== 'finished' &&
        printJob.status !== 'failed' ? (
          <FinishPrintJob
            id={printJob.id}
            revalidatePath={`/admin/orders/${printJob.order_id}`}
          />
        ) : null}
        {printJob.status !== 'failed' ? (
          <FailPrintJob
            id={printJob.id}
            revalidatePath={`/admin/orders/${printJob.order_id}`}
          />
        ) : null}
        <DeletePrintJob
          id={printJob.id}
          revalidatePath={`/admin/orders/${printJob.order_id}`}
        />
      </div>
    </li>
  );
}
