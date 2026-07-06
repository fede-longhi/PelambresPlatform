'use client';

import { useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { FileText, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MIME_TYPE_BY_EXTENSION } from '@/lib/consts';
import { formatFileSize } from '@/lib/utils';

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex < 0) {
    return '';
  }
  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

function validateIncomingFiles(
  files: FileList | null,
  options: {
    allowedExtensions: Set<string>;
    allowedMimeTypes: Set<string>;
    maxSizeBytes: number;
    mimeTypeByExtension: Record<string, string>;
    multiple: boolean;
  }
): { validFiles: File[]; errors: string[] } {
  if (!files) {
    return { validFiles: [], errors: [] };
  }

  const validFiles: File[] = [];
  const errors: string[] = [];
  const incomingFiles = Array.from(files);

  incomingFiles.forEach((file) => {
    if (file.size > options.maxSizeBytes) {
      errors.push(
        `${file.name}: supera el tamaño máximo de ${formatFileSize(options.maxSizeBytes)} (${formatFileSize(file.size)}).`
      );
      return;
    }

    const extension = getFileExtension(file.name);
    const isMimeAllowed = options.allowedMimeTypes.has(file.type);
    const canValidateByExtension = file.type === '' || file.type === 'application/octet-stream';
    const isExtensionAllowed = options.allowedExtensions.has(extension);

    if (!isMimeAllowed && !(canValidateByExtension && isExtensionAllowed)) {
      errors.push(`${file.name}: tipo de archivo no soportado.`);
      return;
    }

    validFiles.push(file);
  });

  if (!options.multiple && validFiles.length > 1) {
    return {
      validFiles: [validFiles[0]],
      errors,
    };
  }

  return { validFiles, errors };
}

export type FileAttachmentPickerProps = {
  id?: string;
  label?: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  allowedExtensions: Set<string>;
  allowedMimeTypes: Set<string>;
  maxSizeBytes: number;
  mimeTypeByExtension?: Record<string, string>;
  accept?: string;
  formatHint?: string;
  validationErrors?: string[];
  onValidationErrorsChange?: (errors: string[]) => void;
  fieldErrors?: string[];
};

export function FileAttachmentPicker({
  id = 'file-upload',
  label = 'Adjuntar archivos',
  files,
  onFilesChange,
  multiple = true,
  disabled = false,
  allowedExtensions,
  allowedMimeTypes,
  maxSizeBytes,
  mimeTypeByExtension = MIME_TYPE_BY_EXTENSION,
  accept,
  formatHint,
  validationErrors = [],
  onValidationErrorsChange,
  fieldErrors,
}: FileAttachmentPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resolvedAccept =
    accept ?? Array.from(allowedExtensions).map((extension) => `.${extension}`).join(',');

  const resolvedFormatHint =
    formatHint ??
    `${Array.from(allowedExtensions).join(', ').toUpperCase()}. Máximo ${formatFileSize(maxSizeBytes)} por archivo.`;

  function addFiles(incoming: FileList | null) {
    const { validFiles, errors } = validateIncomingFiles(incoming, {
      allowedExtensions,
      allowedMimeTypes,
      maxSizeBytes,
      mimeTypeByExtension,
      multiple,
    });

    onValidationErrorsChange?.(errors);

    if (validFiles.length === 0) {
      return;
    }

    if (multiple) {
      onFilesChange([...files, ...validFiles]);
      return;
    }

    onFilesChange([validFiles[0]]);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files);
    event.target.value = '';
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      addFiles(event.dataTransfer.files);
    }
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
  }

  const showDropZone = multiple ? files.length === 0 : files.length === 0;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>

      <input
        id={id}
        type="file"
        multiple={multiple}
        accept={resolvedAccept}
        className="sr-only"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {(validationErrors.length > 0 || (fieldErrors?.length ?? 0) > 0) && (
        <div
          className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          aria-live="polite"
        >
          <p className="font-medium">Revisá los archivos adjuntos:</p>
          <ul className="mt-1 list-disc pl-5">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
            {fieldErrors?.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {showDropZone && (
        <div
          className={`mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-gray-300 hover:border-primary/50 dark:border-gray-700'
          } ${disabled ? 'pointer-events-none cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="mt-2 space-y-1 text-center">
            <p className="text-sm font-medium">
              Arrastrá y soltá aquí, o{' '}
              <span className="font-semibold text-primary">hacé click para buscar</span>
            </p>
            <p className="text-xs text-muted-foreground">{resolvedFormatHint}</p>
          </div>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {files.map((attachment, index) => (
          <li
            key={`${attachment.name}-${attachment.size}-${index}`}
            className={`flex items-center justify-between rounded-md border bg-white p-3 shadow-sm transition-opacity ${
              disabled ? 'opacity-60' : ''
            }`}
          >
            <div className="flex min-w-0 items-center space-x-3">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="max-w-xs truncate text-sm font-medium">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => removeFile(index)}
              className="h-8 w-8 shrink-0 p-0"
              disabled={disabled}
            >
              <X className={`h-4 w-4 ${disabled ? 'text-gray-400' : 'text-red-500'}`} />
              <span className="sr-only">Eliminar archivo</span>
            </Button>
          </li>
        ))}

        {multiple && files.length > 0 && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <AddIcon className="mr-2 h-4 w-4" /> Agregar otro archivo
          </Button>
        )}

        {!multiple && files.length > 0 && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            Cambiar archivo
          </Button>
        )}
      </ul>
    </div>
  );
}
