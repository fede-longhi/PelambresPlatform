'use client';

import { GCodeInfo } from "@/types/definitions";
import { createPrintJob, PrintJobFormState } from "@/app/lib/print-job-actions";
import { Button } from "@/components/ui/button";
import FileDropZone from "@/components/ui/drop-files";
import FieldErrorDisplay from "@/components/ui/field-error-display";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { secondsToTime, getGcodeInfo } from "@/lib/utils";
import { CircleX, File, Plus, Trash } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { FILAMENT_TYPES } from "@/lib/consts";

interface PrintJobCreateForm {
    orderId?:string,
    handleCancel?: ()=>void
}

export default function PrintJobCreateForm({ orderId, handleCancel } : PrintJobCreateForm) {
    const initialState: PrintJobFormState = { message: null, errors: {}, success: false };
    const [state, formAction, isPending] = useActionState(createPrintJob, initialState);
    const [models, setModels] = useState<Array<File>>([]);
    const [gcodeFile, setGcodeFile] = useState<File | undefined>();
    const [gcodeInfo, setGcodeInfo] = useState<GCodeInfo>({hotendTemps: [], bedTemps: []});
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (state.success) {
        toast({
            title: 'Éxito',
            description: 'Print job creado correctamente.',
            variant: 'success'
        });
        }
    }, [state.success, toast]);

    const addFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files != null && event.target.files[0] != null) {
            setModels([...models, event.target.files[0]]);
        }
    }

    const openFileExplorer = () => {
        if (fileInputRef != null) {
            fileInputRef.current?.click();
        }
    }

    const removeFile = (index: number) => {
        setModels(models.filter((_, i) => (i!=index)));
    }

    const handleSubmit = async (formData: FormData) => {
        models.forEach((file, i) => {
            formData.append(`file-${i}`, file);
        });
        formData.append('filesCount', String(models.length));
        if (gcodeFile) {
            formData.append('gcodeFile', gcodeFile);
        }
        if (gcodeInfo.estimatedTimeSec) {
            formData.append('estimated_printing_time', gcodeInfo.estimatedTimeSec.toString());
        }
        formAction(formData);
    }

    return (
        <form action={handleSubmit}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {state.message && !state.success && (
                <div className="flex items-center text-sm text-red-500 border bg-slate-100 rounded-md p-2">
                    <CircleX className="mr-2" />
                    <p>{state.message}</p>
                </div>
                )}

                <div className="flex flex-col space-y-2 w-fit">
                    {
                        orderId &&
                        <input type="hidden" name="order_id" value={orderId} />
                    }

                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={state.payload?.get('name') as string || ''}
                            placeholder="Enter name"
                            aria-describedby="name-error"
                        />
                        <div id="name-error" aria-live="polite">
                            {state.errors?.name?.map(err => <p key={err} className="text-xs text-red-500">{err}</p>)}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="gcode_file">Gcode</Label>
                        {
                            gcodeFile ? 
                            <div className="flex flex-row items-center rounded border p-1 text-xs bg-white">
                                <File className="mr-2"/>
                                    <p>{gcodeFile.name}</p>
                                    <span className="flex-1"/>
                                    <Button className="rounded-full" variant="ghost" size="icon" type="button" onClick={() => setGcodeFile(undefined)}>
                                        <Trash />
                                    </Button>
                            </div>
                            :
                            <div>
                                <FileDropZone onFilesDropped={async (files) => {
                                    if (files && files[0]) {
                                        setGcodeFile(files[0]);
                                        const gcodeInfo = await getGcodeInfo(files[0]);
                                        setGcodeInfo(gcodeInfo);
                                    }
                                }} />
                                <FieldErrorDisplay errors={state.errors?.gcode_file} id="gcode-file-error"/>
                            </div>
                            
                        }
                    </div>
                    
                    {
                        gcodeInfo.estimatedTimeSec &&
                        <div className="flex flex-col">
                            <Label>Estimated printing time</Label>
                            <span className="font-gra text-sm border rounded-md m-2 p-2 w-fit">{secondsToTime(gcodeInfo.estimatedTimeSec)}</span>
                        </div>
                    }


                    <div className="flex flex-col">
                        <Label htmlFor="model-file" className="mb-2">Models</Label>
                        <Input type="file" name="model-file" className="hidden" ref={fileInputRef} onChange={addFile}/>
                        <div>
                            {
                                models.length > 0 ?
                                <ul className="space-y-2 mb-2">
                                    {
                                        models.map(
                                            (model, i) => {
                                                return (
                                                    <li key={i} className="flex flex-row items-center rounded border p-1 text-xs bg-white">
                                                        <File className="mr-2"/>
                                                        <p>{model.name}</p>
                                                        <span className="flex-1"/>
                                                        <Button className="rounded-full" variant="ghost" size="icon" type="button" onClick={() => removeFile(i)}>
                                                            <Trash />
                                                        </Button>
                                                    </li>
                                                )
                                            }
                                        )
                                    }
                                </ul>
                                :
                                <FileDropZone onFilesDropped={(files) => {
                                    if (files && files[0]) {
                                        setModels([...models, files[0]]);
                                    }
                                }} />
                            }
                            <Button
                            className="bg-secondary text-secondary-foreground hover:text-primary-foreground w-auto mt-2"
                            type="button"
                            aria-label="Adjuntar archivo"
                            onClick={openFileExplorer}>
                                <Plus />Agregar archivo
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="filament">Filament</Label>
                        <Select name="filament"> 
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select a filament" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    FILAMENT_TYPES.map((filament) => (
                                        <SelectItem key={filament.name} value={filament.name}>{filament.label}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                        
                        <FieldErrorDisplay id="filament-error" errors={state.errors?.estimated_printing_time} />
                    </div>
                </div>

                <div className="flex justify-center pt-8 space-x-2">
                    <Button type="button" disabled={isPending} variant="outline" onClick={()=>{handleCancel?.()}}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground">
                        {isPending ? 'Creando...' : 'Crear Print Job'}
                    </Button>
                </div>
            </div>
        </form>
    );
}