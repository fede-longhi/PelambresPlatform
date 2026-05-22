import { ALLOWED_MIME_TYPES, MAX_FILE_ATTACHMENT_SIZE_BYTES } from '@/lib/consts';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  console.log('Received upload request');
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                return {
                    allowedContentTypes: ALLOWED_MIME_TYPES ? Array.from(ALLOWED_MIME_TYPES) : undefined,
                    maximumSizeInBytes: MAX_FILE_ATTACHMENT_SIZE_BYTES,
                    tokenPayload: JSON.stringify({}),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('✅ Archivo subido exitosamente a Vercel Blob:', blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.log('Error durante el proceso de subida:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}