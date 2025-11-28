'use client';

import { createQuote, QuoteFormState } from '@/app/lib/quote-actions';
import { useRef, useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AddIcon from '@mui/icons-material/Add';
import ErrorIcon from '@mui/icons-material/Error';
import { Upload, FileText, X } from 'lucide-react';

export default function Form() {
    const [attachments, setAttachments] = useState<Array<File>>([]);
    const initialState: QuoteFormState = { message: null, errors: {}};
    const [state, formAction, isPending] = useActionState(createQuote, initialState);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

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
                <Label htmlFor="file-upload">Adjuntar Archivos</Label> {/* Use Label for consistency */}
                
                {/* Hidden File Input */}
                {/* We remove the 'id' and 'name' attributes from the input to prevent it from auto-submitting */}
                <input 
                id="file-upload" // Keep the ID for the label
                type='file' 
                name='file-upload' // Keep a name, but it's mainly for ref/state
                multiple // IMPORTANT: Keep this since you handle multiple files
                className='sr-only'
                ref={fileInputRef}
                onChange={handleFileChange}
                />
                
                {/* === DRAG AND DROP AREA === */}
                {attachments.length === 0 && (
                    <div
                        className={`mt-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer
                            ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()} // Click anywhere to open file dialog
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

                {/* === FILE LIST DISPLAY (Updated Styling) === */}
                <ul className="space-y-2 mt-4">
                    {attachments.map((attachment, i) => (
                        <li 
                            key={i} 
                            className="flex items-center justify-between p-3 border rounded-md bg-white shadow-sm"
                        >
                            <div className='flex items-center space-x-3'>
                                <FileText className="w-5 h-5 text-primary"/> {/* Using Lucide Icon */}
                                <div>
                                    <p className='text-sm font-medium truncate max-w-xs'>{attachment.name}</p>
                                    <p className='text-xs text-muted-foreground'>{formatFileSize(attachment.size)}</p>
                                </div>
                            </div>
                            {/* Use shadcn Button for consistent styling */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                type="button" 
                                onClick={() => removeFile(i)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4 text-red-500" /> {/* Using Lucide Icon */}
                                <span className="sr-only">Eliminar archivo</span>
                            </Button>
                        </li>
                    ))}
                    
                    {/* Button to add more files, visible once files are added */}
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
