'use server';

import { put, PutBlobResult } from "@vercel/blob";
import { FileData } from "../../types/definitions";
import { calculateFileHash } from "@/lib/utils";
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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

function getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex < 0) return '';
    return fileName.slice(lastDotIndex + 1).toLowerCase();
}

function normalizeMimeType(filename: string, mimeType?: string): string {
    if (mimeType && mimeType.trim().length > 0) {
        return mimeType;
    }

    const extension = getFileExtension(filename);
    return MIME_TYPE_BY_EXTENSION[extension] || 'application/octet-stream';
}

export type InsertFileResult = {
    insertedFile?: FileData,
    isExisting?: boolean,  
    message?: string,
    success: boolean,
}

export type InsertFilesResult = {
    insertedFiles?: FileData[],
    existingFiles?: FileData[],
    message?: string,
    success: boolean,
}

export async function insertSingleFormFile(fieldName: string, folder: string, formData: FormData): Promise<InsertFileResult> {
    const file = formData.get(fieldName) as File;
    if (!file) {
        return {
            message: 'Could not get file from form.',
            success: false,
        }
    }

    let fileHash: string;
    try {
        fileHash = await calculateFileHash(file);
    } catch (error) {
        return {
            message: `Error calculating file hash: ${error}`,
            success: false,
        };
    }

    const existing = await sql<FileData[]>`
        SELECT id, filename, path, mime_type, size, hash FROM files WHERE hash = ${fileHash} LIMIT 1
    `;
    if (existing.length > 0) {
        return {
            insertedFile: existing[0],
            isExisting: true,
            success: true,
        };
    }

    let blob: PutBlobResult;
    try {
        blob = await put(folder + '/' + file.name, file, {
            access: 'public',
        });
        const mimeType = normalizeMimeType(file.name, file.type);
        const inserted = await sql<FileData[]>`
            INSERT INTO files (filename, path, mime_type, size, uploaded_at, hash)
            VALUES (
                ${file.name},
                ${blob.downloadUrl},
                ${mimeType},
                ${file.size},
                ${new Date().toISOString()},
                ${fileHash}
            )
            RETURNING id, filename, path, mime_type, size, hash
        `;

        return {
            insertedFile: inserted[0],
            isExisting: false,
            success: true,
        };
    } catch (error) {
        return {
            message: `Error uploading file: "${file.name}": ${error}`,
            success: false,
        };
    }
}

export async function insertFormFiles(folder: string, formData: FormData): Promise<InsertFilesResult> {
    const insertedFiles: FileData[] = [];
    const existingFiles: FileData[] = [];

    const filesCount = Number(formData.get("filesCount"));
    for (let i = 0; i < filesCount; i++) {
        const file = formData.get(`file-${i}`) as File;
        if (!file) continue;

        let fileHash: string;
        try {
            fileHash = await calculateFileHash(file);
        } catch (error) {
            return {
                message: `Error calculating hash for "${file.name}": ${error}`,
                success: false,
            };
        }

        const existing = await sql<FileData[]>`
            SELECT id, filename, path, mime_type, size, hash FROM files WHERE hash = ${fileHash} LIMIT 1
        `;
        if (existing.length > 0) {
            existingFiles.push(existing[0]);
            continue;
        }

        try {
            const blob = await put(folder + '/' + file.name, file, {
                access: "public",
            });

            const now = new Date().toISOString(); 
            const mimeType = normalizeMimeType(file.name, file.type);
            const inserted = await sql<FileData[]>`
                INSERT INTO files (filename, path, mime_type, size, uploaded_at, hash)
                VALUES (
                    ${file.name},
                    ${blob.downloadUrl},
                    ${mimeType},
                    ${file.size},
                    ${now},
                    ${fileHash}
                )
                RETURNING id, filename, path, mime_type, size, hash
            `;

            insertedFiles.push(inserted[0]);
        } catch (error) {
            return {
                message: `Error uploading or inserting file "${file.name}": ${error}`,
                success: false,
            };
        }
    }

    return {
        insertedFiles,
        existingFiles,
        success: true,
    };
}

export async function getFileData(
    hashSet: string[]
): Promise<Record<string, { exists: boolean; existingFile?: FileData; error?: string }>> {
    const result: Record<string, { exists: boolean; existingFile?: FileData; error?: string }> = {};

    try {
        const existing = await sql<FileData[]>`
            SELECT id, filename, path, mime_type, size, hash FROM files WHERE hash = ANY(${hashSet})
        `;

        for (const file of existing) {
            if (file.hash) {
                result[file.hash] = {
                    exists: true,
                    existingFile: file,
                };
            }
        }

        for (const hash of hashSet) {
            if (!result[hash]) {
                result[hash] = { exists: false };
            }
        }

        return result;
    } catch (error) {
        return hashSet.reduce((acc, hash) => {
            acc[hash] = { exists: false, error: `Error checking file existence: ${error}` };
            return acc;
        }, {} as Record<string, { exists: boolean; existingFile?: FileData; error?: string }>);
    }
}

export async function insertFileData(
    files: { filename: string; hash: string; type?: string; size?: number, url?: string }[],
): Promise<void> {
    if (files.length === 0) return;

    const now = new Date().toISOString();

    const recordsToInsert = files.map(file => ({
        filename: file.filename,
        path: file.url ?? '',
        mime_type: normalizeMimeType(file.filename, file.type),
        size: file.size ?? 0,
        uploaded_at: now,
        hash: file.hash
    }));

    await sql`
        INSERT INTO files ${sql(recordsToInsert, 'filename', 'path', 'mime_type', 'size', 'uploaded_at', 'hash')}
    `;
}