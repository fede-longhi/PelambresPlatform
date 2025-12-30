import { PrintJob } from "@/types/definitions";
import { DeletePrintJob, FailPrintJob, FinishPrintJob, StartPrintJob } from "./buttons";
import PrintJobStatusField from "./status-field";
import Link from "next/link";

export function PrintJobItemDetail({printJob} : {printJob: PrintJob}) {
    return (
        <li className="flex flex-row space-x-2 bg-gray-100 rounded-md p-1 px-4 text-sm items-center min-h-10">
            <span className="w-[100]">
                <Link href={`/admin/print-jobs/${printJob.id}`}>
                    {printJob.name}
                </Link>
            </span>
            
            <span className="w-[100]"><PrintJobStatusField status={printJob.status} /></span>
            
            {
                printJob.status === 'pending' &&
                <StartPrintJob id={printJob.id} revalidatePath={`/admin/orders/${printJob.order_id}`}/>
            }
            {
                (printJob.status !== 'pending' && printJob.status !== 'finished' && printJob.status !== 'failed') &&
                <FinishPrintJob id={printJob.id} revalidatePath={`/admin/orders/${printJob.order_id}`}/>
            }
            <span className="flex-1"/>
            {
                printJob.status !== 'failed' &&
                <FailPrintJob id={printJob.id} revalidatePath={`/admin/orders/${printJob.order_id}`}/>
            }
            <DeletePrintJob id={printJob.id} revalidatePath={`/admin/orders/${printJob.order_id}`}/>
        </li>
    )
}