'use client';

import { useActionState, useEffect, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button';
import { FileAttachmentPicker } from '@/components/shared/file-attachment-picker';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_ATTACHMENT_SIZE_BYTES,
} from '@/lib/consts';
import { formatFileSize } from '@/lib/utils';
import {
  addOrderAttachments,
  deleteOrderAttachment,
  type OrderAttachmentsFormState,
} from '@/lib/actions/order-actions';
import type { OrderAttachment } from '@/types/order-definitions';

export default function OrderAttachments({
  orderId,
  attachments,
}: {
  orderId: string;
  attachments: OrderAttachment[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
  const initialState: OrderAttachmentsFormState = {
    message: null,
    success: false,
  };
  const upload = addOrderAttachments.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(upload, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      setFiles([]);
      setFileValidationErrors([]);
      toast({
        title: 'Archivos adjuntos',
        description: 'Los archivos se asociaron al pedido.',
        variant: 'success',
      });
    }
  }, [state.success, state.message, toast]);

  return (
    <div className="space-y-4">
      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Este pedido todavía no tiene archivos adjuntos.
        </p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((attachment) => {
            const deleteAttachment = deleteOrderAttachment.bind(
              null,
              attachment.id,
              orderId
            );

            return (
              <li
                key={attachment.id}
                className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2"
              >
                <a
                  href={attachment.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-0 flex-1 items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Paperclip className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{attachment.filename}</span>
                </a>
                <ConfirmDeleteButton
                  ariaLabel={`Eliminar ${attachment.filename}`}
                  title="Eliminar archivo"
                  description={`Se va a quitar ${attachment.filename} de este pedido.`}
                  action={deleteAttachment}
                />
              </li>
            );
          })}
        </ul>
      )}

      <form
        className="space-y-3"
        action={(formData) => {
          formData.set('filesCount', String(files.length));
          files.forEach((file, index) => {
            formData.set(`file-${index}`, file);
          });
          formAction(formData);
        }}
      >
        <FileAttachmentPicker
          id="order-attachments"
          label="Adjuntar archivos"
          files={files}
          onFilesChange={setFiles}
          disabled={isPending}
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
        {state.message && !state.success ? (
          <p className="text-sm text-destructive" role="alert">
            {state.message}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending || files.length === 0}>
          {isPending ? 'Subiendo...' : 'Adjuntar'}
        </Button>
      </form>
    </div>
  );
}
