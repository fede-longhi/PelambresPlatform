'use client';

import { createQuote, QuoteFormState } from '@/app/lib/quote-actions';
import { useRef, useActionState, useState } from 'react';
import { put } from '@vercel/blob';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';

export default function Form() {
    const [attachments, setAttachments] = useState<Array<File>>([]);
    const initialState: QuoteFormState = { message: null, errors: {}};
    const [state, formAction, isPending] = useActionState(createQuote, initialState);
    let fileInputRef = useRef<any>(null);

    const addFile = async (event: any) => {
        if (event.target.files[0] != null) {
            setAttachments([...attachments, event.target.files[0]]);
        }
    }

    const openFileExplorer = () => {
        if (fileInputRef != null) {
            fileInputRef.current?.click();
        }
    }

    const removeFile = (index: number) => {
        setAttachments(attachments.filter((_, i) => (i!=index)));
    }

    const handleSubmit = async (formData: FormData) => {
        let filesUrl:Array<string> = [];
        attachments.forEach((file, i) => {
            formData.append(`file-${i}`, file);
        });
        formData.append('filesCount', String(attachments.length));
        formAction(formData);
    };
    
    return (
        <form action={handleSubmit} className="space-y-2">
            <div aria-live="polite" aria-atomic="true">
                {state.message ? (
                    <div className="flex flex-row items-center mt-2 text-sm text-red-500 border bg-slate-100 rounded-md p-2">
                        <ErrorIcon className="mr-2"/>
                        <p >{state.message}</p>
                    </div>
                ) : null}
            </div>
            <div>
                <Label htmlFor="firstName">Tu nombre</Label>
                <Input
                    id="firstName"
                    type="text"
                    name="firstName"
                    defaultValue={(state.payload?.get("firstName") || "") as string}
                    placeholder="Ingresa tu nombre"
                    aria-describedby="name-error"
                />
                <div id="firstName-error" aria-live="polite" aria-atomic="true">
                    {state.errors?.firstName &&
                    state.errors.firstName.map((error: string) => (
                        <p className="mt-2 text-xs text-red-500" key={error}>
                        {error}
                        </p>
                    ))}
                </div>
            </div>
            <div>
                <Label htmlFor="lastName">Tu apellido</Label>
                <Input
                    id="lastName"
                    type="text"
                    name="lastName"
                    defaultValue={(state.payload?.get("lastName") || "") as string}
                    placeholder="Ingresa tu nombre"
                    aria-describedby="lastName-error"
                />
                <div id="lastName-error" aria-live="polite" aria-atomic="true">
                    {state.errors?.lastName &&
                    state.errors.lastName.map((error: string) => (
                        <p className="mt-2 text-xs text-red-500" key={error}>
                        {error}
                        </p>
                    ))}
                </div>
            </div>
            <div>
                <Label htmlFor="email">Email de contacto</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    defaultValue={(state.payload?.get("email") || "") as string}
                    placeholder="Ingresa tu email"
                    aria-describedby="email-error"
                />
                <div id="email-error" aria-live="polite" aria-atomic="true">
                    {state.errors?.email &&
                    state.errors.email.map((error: string) => (
                        <p className="mt-2 text-xs text-red-500" key={error}>
                        {error}
                        </p>
                    ))}
                </div>
            </div>
            <div>
                <Label htmlFor="phone">Telefono de contacto</Label>
                <Input
                    id="phone"
                    type="text"
                    name="phone"
                    defaultValue={(state.payload?.get("phone") || "") as string}
                    placeholder="Teléfono"
                    aria-describedby="phone-error"
                />
                <div id="phone-error" aria-live="polite" aria-atomic="true">
                    {state.errors?.phone &&
                    state.errors.phone.map((error: string) => (
                        <p className="mt-2 text-xs text-red-500" key={error}>
                        {error}
                        </p>
                    ))}
                </div>
            </div>
            <div>
                <Label htmlFor="detail">Detalle</Label>
                <Textarea
                    id="detail"
                    className="bg-white"
                    name="detail"
                    defaultValue={(state.payload?.get("detail") || "") as string}
                    aria-describedby="detail-error"
                />
                <div id="detail-error" aria-live="polite" aria-atomic="true">
                    {state.errors?.detail &&
                    state.errors.detail.map((error: string) => (
                        <p className="mt-2 text-xs text-red-500" key={error}>
                        {error}
                        </p>
                    ))}
                </div>
            </div>
            <div>
                <h1 className="text-sm font-medium mb-2">Adjuntar archivos</h1>
                <div className="flex mb-2">
                    <Input type="file" name="file" className="hidden" ref={fileInputRef} onChange={addFile}/>  
                    <Button className="bg-secondary text-secondary-foreground hover:text-primary-foreground" type="button" onClick={openFileExplorer}><AddIcon />Agregar archivo</Button>
                </div>
                <ul className="space-y-2 mb-2">
                    {
                        attachments.map(
                            (attachment, i) => {
                                return (
                                    <li key={i} className="flex flex-row items-center rounded border p-1 text-xs bg-white">
                                        <AttachFileIcon className="mr-2"/>
                                        <p>{attachment.name}</p>
                                        <span className="flex-1"/>
                                        <Button className="rounded-full" variant="ghost" size="icon" type="button" onClick={() => removeFile(i)}>
                                            <DeleteIcon />
                                        </Button>
                                    </li>
                                )
                            }
                        )
                    }
                </ul>
            </div>
            
            <div className="flex justify-center pt-8">
                <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground">{isPending ? 'Esperando...' : 'Enviar'}</Button>
            </div>
        </form>
    )
}
