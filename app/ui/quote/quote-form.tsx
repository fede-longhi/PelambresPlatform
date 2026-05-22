'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { AlertTriangle, CheckCircle, Clock, FileText, Upload, X } from 'lucide-react';

import { createQuote, QuoteFormState } from '@/app/lib/quote-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { calculateFileHash, formatFileSize } from '@/lib/utils';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_ATTACHMENT_SIZE_BYTES } from '@/lib/consts';

import { getFileData, insertFileData } from '@/app/lib/file-strorage';

const INITIAL_STATE: QuoteFormState = { message: null, errors: {} };

type FieldErrorsProps = {
    id: string;
    errors?: string[];
};

const MOCK_DATA = {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '555-1234',
    detail: 'Estoy interesado en imprimir un modelo 3D de un prototipo que diseñé. El archivo STL tiene aproximadamente 50MB y me gustaría saber cuánto costaría imprimirlo en PLA con un acabado de alta calidad. Además, ¿cuánto tiempo tomaría el proceso de impresión? Gracias.',
}

function FieldErrors({ id, errors }: FieldErrorsProps) {
    if (!errors?.length) {
        return <div id={id} aria-live="polite" aria-atomic="true" />;
    }

    return (
        <div id={id} aria-live="polite" aria-atomic="true">
            {errors.map((error) => (
                <p className="mt-2 text-xs text-red-500" key={error}>
                    {error}
                </p>
            ))}
        </div>
    );
}

type QuoteFormProps = {
    showBackToHomeButton?: boolean;
};

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
    stl: 'model/stl',
    obj: 'model/obj',
    '3mf': 'model/3mf',
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};

export default function Form({ showBackToHomeButton = true }: QuoteFormProps) {
    const router = useRouter();
    const [attachments, setAttachments] = useState<Array<File>>([]);
    const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
    const [state, formAction, isPending] = useActionState(createQuote, INITIAL_STATE);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const isProcessing = isPending || isUploadingFiles;

    useEffect(() => {
        if (state.status === 'success') {
            toast({
                title: 'Solicitud de cotización enviada',
                description:
                    'Nos pondremos en contacto a la brevedad, generalmente dentro de las 24 horas. ¡Gracias por tu solicitud!',
                variant: 'default',
            });

            setAttachments([]);
            setIsSubmitted(true);
        } else if (state.status === 'error') {
            toast({
                title: 'Error al enviar la solicitud',
                description:
                    'Hubo un problema al enviar tu solicitud de cotización. Por favor, intenta nuevamente más tarde.',
                variant: 'destructive',
            });
            setIsSubmitted(true);
        }
    }, [state, toast]);

    const getFileExtension = (fileName: string) => {
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex < 0) return '';
        return fileName.slice(lastDotIndex + 1).toLowerCase();
    };

    const getResolvedMimeType = (file: File): string => {
        if (file.type && file.type.trim().length > 0) {
            return file.type;
        }

        const extension = getFileExtension(file.name);
        return MIME_TYPE_BY_EXTENSION[extension] || 'application/octet-stream';
    };

    const getUploadErrorMessage = (error: unknown) => {
        const fallback = 'Hubo un problema al subir tus archivos. Intenta nuevamente.';
        if (!(error instanceof Error)) return fallback;

        const errorText = error.message.toLowerCase();
        if (errorText.includes('size') || errorText.includes('too large') || errorText.includes('maximum')) {
            return `Uno o más archivos superan el tamaño máximo permitido (${formatFileSize(MAX_FILE_ATTACHMENT_SIZE_BYTES)}).`;
        }

        if (
            errorText.includes('content type') ||
            errorText.includes('mime') ||
            errorText.includes('unsupported') ||
            errorText.includes('not allowed')
        ) {
            return 'Uno o más archivos no tienen un tipo soportado. Revisa los formatos permitidos.';
        }

        return fallback;
    };

    const validateIncomingFiles = (files: FileList | null): { validFiles: File[]; errors: string[] } => {
        if (!files) return { validFiles: [], errors: [] };

        const validFiles: File[] = [];
        const errors: string[] = [];

        Array.from(files).forEach((file) => {
            if (file.size > MAX_FILE_ATTACHMENT_SIZE_BYTES) {
                errors.push(
                    `${file.name}: supera el tamaño máximo de ${formatFileSize(MAX_FILE_ATTACHMENT_SIZE_BYTES)} (${formatFileSize(file.size)}).`
                );
                return;
            }

            const extension = getFileExtension(file.name);
            const isMimeAllowed = ALLOWED_MIME_TYPES.has(file.type);
            const canValidateByExtension = file.type === '' || file.type === 'application/octet-stream';
            const isExtensionAllowed = ALLOWED_EXTENSIONS.has(extension);

            if (!isMimeAllowed && !(canValidateByExtension && isExtensionAllowed)) {
                errors.push(`${file.name}: tipo de archivo no soportado.`);
                return;
            }

            validFiles.push(file);
        });

        return { validFiles, errors };
    };

    const addFiles = (files: FileList | null) => {
        const { validFiles, errors } = validateIncomingFiles(files);

        if (errors.length > 0) {
            setFileValidationErrors(errors);
            toast({
                title: 'Algunos archivos no se pudieron agregar',
                description: errors[0],
                variant: 'destructive',
            });
        } else {
            setFileValidationErrors([]);
        }

        if (validFiles.length > 0) {
            setAttachments((prevAttachments) => [...prevAttachments, ...validFiles]);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(event.target.files);
        if (event.target.files) {
            event.target.value = '';
        }
    };

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
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const refresh = () => {
        setAttachments([]);
        setFileValidationErrors([]);
        setIsSubmitted(false);
    };

    const goToHome = () => {
        router.push('/');
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        setIsUploadingFiles(true);
        setUploadProgress(0);

        const hashesList = await Promise.all(
            attachments.map(async (file) => ({
                file,
                hash: await calculateFileHash(file),
            }))
        );

        attachments.forEach((file, index) => {
            console.log(`Archivo: "${file.name}", type: ${file.type}`);
        });

        console.log('Calculated hashes for attachments:', hashesList);
        const resp = await getFileData(hashesList.map(item => item.hash));    
        console.log('Respuesta de verificación de archivos existentes:', resp);

        
        try {
            const totalBytes = attachments.reduce((acc, file) => acc + file.size, 0);
            const loadedBytesPerFile: Record<string, number> = {};
            const uploadedBlobs = await Promise.all(
                hashesList.filter((attachment) => !resp[attachment.hash]?.exists).map(async (attachment) => {
                    const blob = upload(attachment.file.name, attachment.file, {
                        access: 'public',
                        handleUploadUrl: '/api/upload',
                        onUploadProgress: (progressEvent) => {
                            loadedBytesPerFile[attachment.file.name] = progressEvent.loaded;
                            
                            const totalLoaded = Object.values(loadedBytesPerFile).reduce((acc, val) => acc + val, 0);

                            const percentage = Math.round((totalLoaded / totalBytes) * 100);
                            setUploadProgress(percentage);
                        },
                    });
                    return blob;
                })
            );

            await insertFileData(
                hashesList.filter(item => !resp[item.hash]?.exists).map(item => ({
                    filename: item.file.name,
                    hash: item.hash,
                    type: getResolvedMimeType(item.file),
                    size: item.file.size,
                    url: uploadedBlobs.find(blob => blob.pathname === item.file.name)?.downloadUrl,
                }))
            );

            const blobList = uploadedBlobs.map((blob) => ({
                        pathname: blob.pathname,
                        downloadUrl: blob.downloadUrl,
                    }))
                    .concat(...hashesList.filter(item => resp[item.hash]?.exists).map(item => ({
                        pathname: item.file.name,
                        downloadUrl: resp[item.hash]?.existingFile?.path || '',
                    })));
            formData.append('filesCount', String(attachments.length));
            formData.append(
                'attachments',
                JSON.stringify(
                    blobList
                )
            );
            setIsUploadingFiles(false);

            startTransition(() => {
                formAction(formData);
            });

        } catch (error) {
            console.log(error);
            toast({
                title: 'Error subiendo archivos',
                description: getUploadErrorMessage(error),
                variant: 'destructive'
            });
        } finally {
            setIsUploadingFiles(false);
        }
    };

    if (isSubmitted) {
        return (
            <SubmissionSuccessMessage
                showBackToHomeButton={showBackToHomeButton}
                onBackToHome={goToHome}
                onNewRequest={refresh}
            />
        );
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-2">
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
                        defaultValue={(state.payload?.get('name') || MOCK_DATA.name) as string}
                        placeholder="Ingresa tu nombre completo"
                        aria-describedby="name-error"
                        disabled={isProcessing}
                    />
                    <FieldErrors id="name-error" errors={state.errors?.name} />
                </div>
                <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        className="bg-white"
                        defaultValue={(state.payload?.get('email') || MOCK_DATA.email) as string}
                        placeholder="Ingresa tu email"
                        aria-describedby="email-error"
                        disabled={isProcessing}
                    />
                    <FieldErrors id="email-error" errors={state.errors?.email} />
                </div>
            </div>
            <div>
                <Label htmlFor="phone">Teléfono de contacto</Label>
                <Input
                    id="phone"
                    type="text"
                    name="phone"
                    className="bg-white"
                    defaultValue={(state.payload?.get('phone') || MOCK_DATA.phone) as string}
                    placeholder="Teléfono"
                    aria-describedby="phone-error"
                    disabled={isProcessing}
                />
                <FieldErrors id="phone-error" errors={state.errors?.phone} />
            </div>
            <div>
                <Label htmlFor="detail">Detalles del Proyecto</Label>
                <Textarea
                    id="detail"
                    className="bg-white"
                    name="detail"
                    rows={4}
                    defaultValue={(state.payload?.get('detail') || MOCK_DATA.detail) as string}
                    aria-describedby="detail-error"
                    disabled={isProcessing}
                />
                <FieldErrors id="detail-error" errors={state.errors?.detail} />
            </div>
            <div>
                <Label htmlFor="file-upload">Adjuntar Archivos</Label>

                <input 
                    id="file-upload"
                    type='file' 
                    name='file-upload'
                    multiple
                    accept=".stl,.obj,.3mf,.pdf,.jpg,.jpeg,.png,.webp"
                    className='sr-only'
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isProcessing} // 🔒 Bloqueamos el input oculto
                />

                {fileValidationErrors.length > 0 && (
                    <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600" aria-live="polite">
                        <p className="font-medium">Revisa los archivos adjuntos:</p>
                        <ul className="mt-1 list-disc pl-5">
                            {fileValidationErrors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {attachments.length === 0 && (
                    <div
                        className={`mt-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors
                            ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'}
                            ${isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        // Solo permitimos el clic si no está procesando
                        onClick={() => !isProcessing && fileInputRef.current?.click()}
                    >
                        <Upload className='w-8 h-8 text-muted-foreground' />
                        <div className="space-y-1 text-center mt-2">
                            <p className='text-sm font-medium'>
                                Arrastra y suelta aquí, o <span className='text-primary font-semibold'>haz click para buscar</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                STL, OBJ, 3MF, PDF, JPG, PNG y WEBP. Máximo {formatFileSize(MAX_FILE_ATTACHMENT_SIZE_BYTES)} por archivo.
                            </p>
                        </div>
                    </div>
                )}

                <ul className="space-y-2 mt-4">
                    {attachments.map((attachment, i) => (
                        <li 
                            key={i} 
                            className={`flex items-center justify-between p-3 border rounded-md bg-white shadow-sm transition-opacity ${isProcessing ? 'opacity-60' : ''}`}
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
                                disabled={isProcessing} // 🔒 Evitamos que borre el archivo mientras se sube
                            >
                                <X className={`w-4 h-4 ${isProcessing ? 'text-gray-400' : 'text-red-500'}`} />
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
                            disabled={isProcessing} // 🔒 Evitamos que agregue más
                        >
                            <AddIcon className="mr-2 h-4 w-4" /> Agregar otro archivo
                        </Button>
                    )}
                </ul>
            </div>
            {isUploadingFiles && (
                <div className="sm:col-span-2 mt-4 max-w-md mx-auto w-full">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-primary">Subiendo archivos...</span>
                        <span className="text-sm font-medium text-primary">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                        <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <div className="sm:col-span-2 text-center">
                <Button
                    type="submit"
                    disabled={isPending || isUploadingFiles}
                    className="h-12 w-full bg-primary text-primary-foreground sm:w-auto rounded-full text-base font-medium px-8 py-4">
                    {isUploadingFiles ? 'Subiendo archivos...' : isPending ? 'Enviando Cotización...' : 'Enviar Solicitud'}
                </Button>
            </div>
        </form>
    );
}

type SubmissionSuccessMessageProps = {
    showBackToHomeButton: boolean;
    onBackToHome: () => void;
    onNewRequest: () => void;
};


const SubmissionSuccessMessage = ({
    showBackToHomeButton,
    onBackToHome,
    onNewRequest,
}: SubmissionSuccessMessageProps) => (
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

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            {showBackToHomeButton && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onBackToHome}
                >
                    Volver al inicio
                </Button>
            )}
            <Button
                type="button"
                className="w-full"
                onClick={onNewRequest}
            >
                Nueva solicitud
            </Button>
        </div>
    </div>
);