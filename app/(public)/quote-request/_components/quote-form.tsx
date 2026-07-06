'use client';

import { startTransition, useActionState, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

import { createQuote, QuoteFormState } from '@/lib/actions/quote-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { calculateFileHash, formatFileSize } from '@/lib/utils';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MIME_TYPE_BY_EXTENSION, MAX_FILE_ATTACHMENT_SIZE_BYTES } from '@/lib/consts';
import { FileAttachmentPicker } from '@/components/shared/file-attachment-picker';

import { getFileData, insertFileData } from '@/lib/actions/file-storage';

const INITIAL_STATE: QuoteFormState = { message: null, errors: {} };

type FieldErrorsProps = {
    id: string;
    errors?: string[];
};

// const MOCK_DATA = {
//     name: 'Juan Pérez',
//     email: 'juan.perez@example.com',
//     phone: '555-1234',
//     detail: 'Estoy interesado en imprimir un modelo 3D de un prototipo que diseñé. El archivo STL tiene aproximadamente 50MB y me gustaría saber cuánto costaría imprimirlo en PLA con un acabado de alta calidad. Además, ¿cuánto tiempo tomaría el proceso de impresión? Gracias.',
// }

const MOCK_DATA = {
    name: '',
    email: '',
    phone: '',
    detail: '',
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

export default function Form({ showBackToHomeButton = true }: QuoteFormProps) {
    const router = useRouter();
    const [attachments, setAttachments] = useState<Array<File>>([]);
    const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
    const [state, formAction, isPending] = useActionState(createQuote, INITIAL_STATE);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

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

    const getResolvedMimeType = (file: File): string => {
        if (file.type && file.type.trim().length > 0) {
            return file.type;
        }

        const lastDotIndex = file.name.lastIndexOf('.');
        const extension = lastDotIndex < 0 ? '' : file.name.slice(lastDotIndex + 1).toLowerCase();
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
            const filesToUpload = hashesList.filter(item => !resp[item.hash]?.exists);
            const existingFiles = hashesList.filter(item => resp[item.hash]?.exists);

            const totalBytesToUpload = filesToUpload.reduce((acc, item) => acc + item.file.size, 0);
            const loadedBytesPerFile: Record<string, number> = {};
            
            if (totalBytesToUpload === 0) {
                setUploadProgress(100);
            }

            const uploadedBlobs = await Promise.all(
                filesToUpload.map(async (attachment) => {
                    const blob = await upload(attachment.file.name, attachment.file, {
                        access: 'public',
                        handleUploadUrl: '/api/upload',
                        onUploadProgress: (progressEvent) => {
                            loadedBytesPerFile[attachment.hash] = progressEvent.loaded;
                            
                            const totalLoaded = Object.values(loadedBytesPerFile).reduce((acc, val) => acc + val, 0);
                            
                            if (totalBytesToUpload > 0) {
                                const percentage = Math.round((totalLoaded / totalBytesToUpload) * 100);
                                setUploadProgress(percentage);
                            }
                        },
                    });
                    return { ...blob, originalHash: attachment.hash };
                })
            );

            if (filesToUpload.length > 0) {
                await insertFileData(
                    filesToUpload.map(item => ({
                        filename: item.file.name,
                        hash: item.hash,
                        type: getResolvedMimeType(item.file),
                        size: item.file.size,
                        url: uploadedBlobs.find(blob => blob.originalHash === item.hash)?.downloadUrl,
                    }))
                );
            }

            const blobList = [
                ...uploadedBlobs.map((blob) => ({
                    pathname: blob.pathname,
                    downloadUrl: blob.downloadUrl,
                })),
                ...existingFiles.map((item) => ({
                    pathname: item.file.name,
                    downloadUrl: resp[item.hash]?.existingFile?.path || '',
                }))
            ];

            formData.append('filesCount', String(attachments.length));
            formData.append('attachments', JSON.stringify(blobList));
            
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
            <FileAttachmentPicker
                id="file-upload"
                label="Adjuntar Archivos"
                files={attachments}
                onFilesChange={setAttachments}
                disabled={isProcessing}
                allowedExtensions={ALLOWED_EXTENSIONS}
                allowedMimeTypes={ALLOWED_MIME_TYPES}
                maxSizeBytes={MAX_FILE_ATTACHMENT_SIZE_BYTES}
                validationErrors={fileValidationErrors}
                onValidationErrorsChange={(errors) => {
                    setFileValidationErrors(errors);
                    if (errors.length > 0) {
                        toast({
                            title: 'Algunos archivos no se pudieron agregar',
                            description: errors[0],
                            variant: 'destructive',
                        });
                    }
                }}
                formatHint={`STL, OBJ, 3MF, PDF, JPG, PNG y WEBP. Máximo ${formatFileSize(MAX_FILE_ATTACHMENT_SIZE_BYTES)} por archivo.`}
            />
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