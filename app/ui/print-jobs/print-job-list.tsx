import { PrintJob } from "@/types/definitions";
import { PrintJobItemDetail } from "./item-detail";

export default function PrintJobList({printJobs} : {printJobs?: PrintJob[]}) {

    return (
        <div className="w-fit">
            <ul className="space-y-2 mb-4">
                {
                    printJobs &&
                    printJobs.map((printJob) => (
                        <PrintJobItemDetail key={printJob.id} printJob={printJob} />
                    ))
                }
            </ul>
        </div>
    )
}