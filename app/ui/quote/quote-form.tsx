'use client';

import { createQuote, QuoteFormState } from '@/app/lib/quote-actions';
import { useRef, useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AddIcon from '@mui/icons-material/Add';
import { Upload, FileText, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Form() {
    const [attachments, setAttachments] = useState<Array<File>>([]);
    const initialState: QuoteFormState = { message: null, errors: {} };
    const [state, formAction, isPending] = useActionState(createQuote, initialState);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {

        if (state.status === 'success') {
            toast({
                title: 'Solicitud de cotización enviada',
                description: "Nos pondremos en contacto a la brevedad, generalmente dentro de las 24 horas. ¡Gracias por tu solicitud!",
                variant: "default",
            });

            // formRef.current?.reset();
            setAttachments([]);
            setIsSubmitted(true);
        }
        
        else if (state.status === 'error') {
            toast({
                title: "Error al enviar la solicitud",
                description: "Hubo un problema al enviar tu solicitud de cotización. Por favor, intenta nuevamente más tarde.",
                variant: "destructive", 
            });
            setIsSubmitted(true);
        }
    }, [state, toast]);

    const addFiles = (files: FileList | null) => {
        if (files) {    
            const newFiles = Array.from(files);
            setAttachments(prevAttachments => [...prevAttachments, ...newFiles]);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(event.target.files);
        if (event.target.files) {
            event.target.value = ''; 
        }
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        addFiles(event.dataTransfer.files);
    };

    const removeFile = (index: number) => {
        setAttachments(attachments.filter((_, i) => (i!=index)));
    }

    const handleSubmit = async (formData: FormData) => {
        attachments.forEach((file, i) => {
            formData.append(`file-${i}`, file);
        });
        formData.append('filesCount', String(attachments.length));
        formAction(formData);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isSubmitted) {
        return <SubmissionSuccessMessage />;
    }
    
    return (
        <form action={handleSubmit} className="space-y-2">
            <div aria-live="polite" aria-atomic="true">
                {state.message && (
                    <div className="flex flex-row items-center mt-2 text-sm text-red-500 border border-red-200 bg-red-50 rounded-md p-3">
                        <AlertTriangle className="mr-3 h-5 w-5"/>
                        <p className="font-medium">{state.message}</p>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                <div>
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                        id="name"
                        type="text"
                        name="name"
                        className="py-3 px-4 bg-white text-lg"
                        defaultValue={(state.payload?.get("name") || "") as string}
                        placeholder="Ingresa tu nombre completo"
                        aria-describedby="name-error"
                    />
                    <div id="name-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.name &&
                        state.errors.name.map((error: string) => (
                            <p className="mt-2 text-xs text-red-500" key={error}>
                            {error}
                            </p>
                        ))}
                    </div>
                </div>
                
                <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        className="bg-white"
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
            </div>
            <div>
                <Label htmlFor="phone">Teléfono de contacto</Label>
                <Input
                    id="phone"
                    type="text"
                    name="phone"
                    className="bg-white"
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
                <Label htmlFor="detail">Detalles del Proyecto</Label>
                <Textarea
                    id="detail"
                    className="bg-white"
                    name="detail"
                    rows={4}
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
                <Label htmlFor="file-upload">Adjuntar Archivos</Label>
                
                <input 
                id="file-upload"
                type='file' 
                name='file-upload'
                multiple
                className='sr-only'
                ref={fileInputRef}
                onChange={handleFileChange}
                />
                
                {attachments.length === 0 && (
                    <div
                        className={`mt-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer
                            ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className='w-8 h-8 text-muted-foreground' />
                        <div className="space-y-1 text-center mt-2">
                            <p className='text-sm font-medium'>
                                Arrastra y suelta aquí, o <span className='text-primary font-semibold'>haz click para buscar</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                STL, OBJ, y más. Hasta 10MB por archivo.
                            </p>
                        </div>
                    </div>
                )}

                <ul className="space-y-2 mt-4">
                    {attachments.map((attachment, i) => (
                        <li 
                            key={i} 
                            className="flex items-center justify-between p-3 border rounded-md bg-white shadow-sm"
                        >
                            <div className='flex items-center space-x-3'>
                                <FileText className="w-5 h-5 text-primary"/>
                                <div>
                                    <p className='text-sm font-medium truncate max-w-xs'>{attachment.name}</p>
                                    <p className='text-xs text-muted-foreground'>{formatFileSize(attachment.size)}</p>
                                </div>
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                type="button" 
                                onClick={() => removeFile(i)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4 text-red-500" />
                                <span className="sr-only">Eliminar archivo</span>
                            </Button>
                        </li>
                    ))}
                    
                    {attachments.length > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <AddIcon className="mr-2 h-4 w-4" /> Agregar otro archivo
                        </Button>
                    )}
                </ul>
            </div>
            
            <div className="sm:col-span-2 text-center">
                <Button
                    type="submit"
                    disabled={isPending}
                    
                    className="h-12 w-full bg-primary text-primary-foreground sm:w-auto rounded-full text-base font-medium px-8 py-4">
                        {isPending ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
            </div>
        </form>
    )
}


const SubmissionSuccessMessage = () => (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-xl text-center">
        <CheckCircle className="w-16 h-16 text-primary mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Solicitud Recibida con Éxito!
        </h2>
        <p className="text-xl text-muted-foreground max-w-lg mb-4">
            Hemos recibido tus archivos y detalles del proyecto.
        </p>

        <div className="inline-flex items-center p-4 bg-primary/10 rounded-lg text-primary font-semibold text-lg mb-8">
            <Clock className="w-8 h-8 mx-3" />
            Nos pondremos en contacto contigo dentro de las próximas 24 horas con tu cotización personalizada.
        </div>
    </div>
);