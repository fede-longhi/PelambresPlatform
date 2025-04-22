import { PrintJobModelFile, PrintJobWithGcode } from "@/app/lib/definitions";
import { fetchPrintJob } from "@/app/lib/print-job-data";
import Breadcrumbs from "@/app/ui/breadcrumbs";
import { lusitana } from "@/app/ui/fonts";
import { FinishPrintJob, StartPrintJob } from "@/app/ui/print-jobs/buttons";
import { PrintJobModels } from "@/app/ui/print-jobs/model-details";
import PrintJobStatusField from "@/app/ui/print-jobs/status-field";
import { fetchPrintJobModels } from "@/app/lib/print-job-models-data";
import Link from "next/link";
import { Box, Download, FileBox } from "lucide-react";
import { secondsToTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {STLViewer} from "@/app/ui/models/model-viewer";


export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const [printJob, models] = await Promise.all([
        fetchPrintJob(id),
        fetchPrintJobModels(id)
    ]);

    const breadcrumbs = [
        { label: 'Print Jobs', href: '/admin/print-jobs' },
        {
            label: `${id}`,
            href: `/admin/print-jobs/${id}`,
            active: true,
        },
    ];

    return (
        <div>
            <Breadcrumbs breadcrumbs={breadcrumbs} /> 
            <PrintJobDetail job={printJob} models={models}/>
        </div>
    );
}

 function PrintJobDetail({ job, models }: { job: PrintJobWithGcode, models: PrintJobModelFile[] }) {
    return (
        <div className="space-y-6">
            <h1 className={`${lusitana.className} text-2xl font-semibold my-6`}>Detalle del trabajo: {job.name}</h1>
    
            <div className="flex flex-row space-x-2">
                <PrintJobStatusField status={job.status} />
                {
                    job.status === 'pending' &&
                    <StartPrintJob id={job.id} revalidatePath={`/admin/orders/${job.order_id}`}/>
                }
                {
                    (job.status !== 'pending' && job.status !== 'finished') &&
                    <FinishPrintJob id={job.id} revalidatePath={`/admin/orders/${job.order_id}`}/>
                }
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="text-sm text-gray-700 space-y-1">
                        {
                            job.started_at &&
                            <li><strong>Empezado:</strong> {new Date(job.started_at).toLocaleString()}</li>
                        }
                        {
                            job.finished_at &&
                            <li><strong>Terminado:</strong> {new Date(job.finished_at).toLocaleString()}</li>
                        }
                        <li><Link href={`/admin/orders/${job.order_id}`}>ORDER</Link></li>
                        <li><strong>Nombre:</strong> {job.gcode_filename}</li>
                        <li><strong>Tamaño:</strong> {(job.gcode_size / 1024).toFixed(2)} KB</li>
                        <li><strong>Tiempo de impresión:</strong> {secondsToTime(job.estimated_printing_time)}</li>
                        <li><strong>Subido:</strong> {new Date(job.gcode_uploaded_at).toLocaleString()}</li>
                    </ul>
                </CardContent>
            </Card>
    
            {job.gcode_filename && (
            <section>
                <h2 className="text-lg font-medium">G-code</h2>
                <div className="flex items-center bg-primary/20 p-2 rounded space-x-4">
                    <FileBox />
                    <span>{job.gcode_filename} ({(job.gcode_size / 1024).toFixed(2)} KB)</span>
                    <Link href={job.gcode_path} className="flex flex-row items-center rounded p-2 bg-yellow-200 text-secondary-foreground">Descargar<Download className="ml-2" /></Link>
                </div>
            </section>
            )}

            <section>
                <h2 className="text-lg font-medium">Models</h2>
                <div className="flex flex-col space-y-2 w-fit">
                    {
                        models.map((model) => (
                            <div key={model.id}>
                                <div className="flex items-center bg-primary/20 p-2 rounded">
                                    <Box className="mr-2"/>
                                    {model.filename}
                                </div>
                                <STLViewer modelUrl={model.path}/>
                            </div>
                        ))
                    }

                </div>
            </section>
        </div>
    );
  }