import { put, PutBlobResult } from "@vercel/blob";
import { FileData } from "../../types/definitions";
import { calculateFileHash } from "@/lib/utils";
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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
        const inserted = await sql<FileData[]>`
            INSERT INTO files (filename, path, mime_type, size, uploaded_at, hash)
            VALUES (
                ${file.name},
                ${blob.downloadUrl},
                ${file.type},
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
            const inserted = await sql<FileData[]>`
                INSERT INTO files (filename, path, mime_type, size, uploaded_at, hash)
                VALUES (
                    ${file.name},
                    ${blob.downloadUrl},
                    ${file.type},
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