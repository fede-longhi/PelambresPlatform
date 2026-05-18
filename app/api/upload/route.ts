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
            // Aquí autorizamos la subida. Puedes restringir tipos de archivos o tamaños máximos.
            return {
            allowedContentTypes: [
                'model/stl',
                'application/pdf',
                'image/jpeg',
                'image/png',
                'model/obj',
                'model/3mf',
                'image/webp',
                'application/octet-stream'
            ],
            maximumSizeInBytes: 50 * 1024 * 1024, // Limite de 50MB (o lo que prefieras)
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