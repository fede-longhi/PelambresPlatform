import { PrintJob } from '@/types/definitions';
import { PrintJobItemDetail } from './item-detail';

export default function PrintJobList({
  printJobs,
}: {
  printJobs?: PrintJob[];
}) {
  if (!printJobs || printJobs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este pedido todavía no tiene trabajos de impresión.
      </p>
    );
  }

  return (
    <ul className="mb-4 space-y-2">
      {printJobs.map((printJob) => (
        <PrintJobItemDetail key={printJob.id} printJob={printJob} />
      ))}
    </ul>
  );
}
