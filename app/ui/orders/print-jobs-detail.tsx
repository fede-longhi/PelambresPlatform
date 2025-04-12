'use client';

import { useState } from "react";
import { PrintJob } from "@/app/lib/definitions";
import PrintJobCreateForm from "@/app/ui/print-jobs/create-form";
import PrintJobList from "@/app/ui/print-jobs/print-job-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function OrderPrintJobsDetail({orderId, printJobs} : {orderId: string, printJobs?:PrintJob[]}) {
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex ">
                    Print jobs
                    <span className="flex-1" />
                    {
                        !isCreateFormOpen &&
                        <Button size="icon" onClick={() => {setIsCreateFormOpen(true)}}>
                            <Plus size={24}/>
                        </Button>
                    }
                </CardTitle>
            </CardHeader>
            <CardContent>
                {
                    isCreateFormOpen ?
                    <PrintJobCreateForm orderId={orderId} handleCancel={()=>{setIsCreateFormOpen(false)}}/>
                    :
                    <PrintJobList printJobs={printJobs} />
                }

            </CardContent>
        </Card>
    )
}