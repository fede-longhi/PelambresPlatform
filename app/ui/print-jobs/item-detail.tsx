import { PrintJob } from "@/app/lib/definitions";
import { DeletePrintJob, FinishPrintJob, StartPrintJob } from "./buttons";
import PrintJobStatusField from "./status-field";
import Link from "next/link";

export function PrintJobItemDetail({printJob} : {printJob: PrintJob}) {
    return (
        <li className="flex flex-row space-x-2 bg-gray-100 rounded-md p-1 px-4 justify-between text-sm items-center min-h-10">
            <span className="w-[100]">
                <Link href={`/admin/print-jobs/${printJob.id}`}>
                    {printJob.name}
                </Link>
            </span>
            <span className="w-[100]"><PrintJobStatusField status={printJob.status} /></span>
            <span className="w-[100]">
                {
                    printJob.status === 'pending' &&
                    <StartPrintJob id={printJob.id} revalidatePath={`/admin/orders/${printJob.order_id}`}/>
                }
                {
                    (printJob.status !== 'pending' && printJob.status !== 'finished') &&
                    <FinishPrintJob id={printJob.id} revalidatePath={`/admin/orders/${printJob.order_id}`}/>
                }
            </span>
            <span className="w-[100]">
                <DeletePrintJob id={printJob.id} revalidatePath={`/admin/orders/${printJob.order_id}`}/>
            </span>
        </li>
    )
}