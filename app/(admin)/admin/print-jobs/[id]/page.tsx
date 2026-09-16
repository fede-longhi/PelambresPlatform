import { notFound } from "next/navigation";
import { PrintJobModelFile, PrintJobWithGcode } from "@/types/definitions";
import { fetchPrintJob } from "@/lib/data/print-job-data";
import Breadcrumbs from "@/app/(admin)/admin/_components/breadcrumbs";
import { lusitana } from "@/app/fonts";
import { FinishPrintJob, StartPrintJob } from "@/app/(admin)/admin/print-jobs/_components/buttons";
import PrintJobStatusField from "@/app/(admin)/admin/print-jobs/_components/status-field";
import { fetchPrintJobModels } from "@/lib/data/print-job-models-data";
import Link from "next/link";
import { Box, Download, FileBox } from "lucide-react";
import { secondsToTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {STLViewer} from "@/app/(admin)/admin/print-jobs/_components/model-viewer";


export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const [printJob, models] = await Promise.all([
        fetchPrintJob(id),
        fetchPrintJobModels(id)
    ]);

    if (!printJob) {
        notFound();
    }

    const breadcrumbs = [
        { label: 'Trabajos', href: '/admin/print-jobs' },
        {
            label: printJob.name || id,
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
                    <CardTitle>Información general</CardTitle>
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
                        {job.order_id ? (
                            <li>
                                <Link href={`/admin/orders/${job.order_id}`} className="text-primary hover:underline">
                                    Ver pedido
                                </Link>
                            </li>
                        ) : null}
                        {job.gcode_filename ? (
                            <li><strong>Nombre:</strong> {job.gcode_filename}</li>
                        ) : (
                            <li className="text-muted-foreground">Sin archivo G-code.</li>
                        )}
                        {job.gcode_size != null ? (
                            <li><strong>Tamaño:</strong> {(job.gcode_size / 1024).toFixed(2)} KB</li>
                        ) : null}
                        {job.estimated_printing_time != null ? (
                            <li><strong>Tiempo de impresión:</strong> {secondsToTime(job.estimated_printing_time)}</li>
                        ) : null}
                        {job.gcode_uploaded_at ? (
                            <li><strong>Subido:</strong> {new Date(job.gcode_uploaded_at).toLocaleString()}</li>
                        ) : null}
                    </ul>
                </CardContent>
            </Card>
    
            {job.gcode_filename && job.gcode_path ? (
            <section>
                <h2 className="text-lg font-medium">G-code</h2>
                <div className="flex items-center bg-primary/20 p-2 rounded space-x-4">
                    <FileBox />
                    <span>
                        {job.gcode_filename}
                        {job.gcode_size != null ? ` (${(job.gcode_size / 1024).toFixed(2)} KB)` : ''}
                    </span>
                    <Link href={job.gcode_path} className="flex flex-row items-center rounded p-2 bg-yellow-200 text-secondary-foreground">Descargar<Download className="ml-2" /></Link>
                </div>
            </section>
            ) : null}

            <section>
                <h2 className="text-lg font-medium">Modelos</h2>
                {models.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay modelos asociados.</p>
                ) : (
                <div className="flex flex-col space-y-2 w-fit">
                    {
                        models.map((model) => (
                            <div key={model.id}>
                                <div className="flex items-center bg-primary/20 p-2 rounded">
                                    <Box className="mr-2"/>
                                    {model.filename}
                                </div>
                                {model.path ? <STLViewer modelUrl={model.path}/> : null}
                            </div>
                        ))
                    }

                </div>
                )}
            </section>
        </div>
    );
  }