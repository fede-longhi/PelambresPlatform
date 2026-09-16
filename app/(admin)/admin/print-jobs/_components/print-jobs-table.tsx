import Link from 'next/link';
import { fetchFilteredPrintJobs } from '@/lib/data/print-job-data';
import type { PrintJobListFilter } from '@/lib/consts/print-job-consts';
import { secondsToTime } from '@/lib/utils';
import PrintJobStatusField from './status-field';

export default async function PrintJobsTable({
  query,
  currentPage,
  filter,
}: {
  query: string;
  currentPage: number;
  filter: PrintJobListFilter;
}) {
  const printJobs = await fetchFilteredPrintJobs(query, currentPage, filter);

  if (printJobs.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center text-sm text-muted-foreground">
        {filter === 'active'
          ? 'No hay trabajos activos.'
          : 'No se encontraron trabajos con esos filtros.'}
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {printJobs.map((job) => (
              <Link
                key={job.id}
                href={`/admin/print-jobs/${job.id}`}
                className="mb-2 block w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3 border-b pb-4">
                  <p className="font-medium">{job.name}</p>
                  <PrintJobStatusField status={job.status} />
                </div>
                <div className="pt-4 text-sm text-muted-foreground">
                  <p>{job.tracking_code ? `Pedido ${job.tracking_code}` : 'Sin pedido'}</p>
                  {job.customer_name ? <p>{job.customer_name}</p> : null}
                  {job.estimated_printing_time ? (
                    <p>Tiempo: {secondsToTime(job.estimated_printing_time)}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Trabajo
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Pedido
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Cliente
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Tiempo
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {printJobs.map((job) => (
                <tr
                  key={job.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <Link
                      href={`/admin/print-jobs/${job.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {job.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {job.order_id ? (
                      <Link
                        href={`/admin/orders/${job.order_id}`}
                        className="hover:underline"
                      >
                        {job.tracking_code ?? 'Ver pedido'}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {job.customer_name || '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {job.estimated_printing_time
                      ? secondsToTime(job.estimated_printing_time)
                      : '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <PrintJobStatusField status={job.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
