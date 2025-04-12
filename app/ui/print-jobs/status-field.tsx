import { PrintJobStatus } from "@/app/lib/definitions";

export default function PrintJobStatusField({status} : {status: PrintJobStatus }) {

    const statusStyles: Record<PrintJobStatus, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        printing: 'bg-blue-100 text-blue-800 border-blue-300',
        postprocess: 'bg-purple-100 text-purple-800 border-purple-300',
        finished: 'bg-green-100 text-green-800 border-green-300',
        failed: 'bg-red-100 text-red-800 border-red-300',
    };
      
    const statusLabels: Record<PrintJobStatus, string> = {
        pending: 'Pendiente',
        printing: 'Imprimiendo',
        postprocess: 'Post-procesado',
        finished: 'Finalizado',
        failed: 'Fallido',
    };

    return(
        <span
            className={`text-xs font-medium px-2 py-1 rounded-full border ${statusStyles[status]}`}
        >
            {statusLabels[status]}
        </span>
    )
}