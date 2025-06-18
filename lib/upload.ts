import { promises as fs } from 'fs';
import path from 'path';

export interface UploadResult {
    success: boolean;
    url?: string;
    filename?: string;
    error?: string;
}

export async function saveUploadedFile(file: File, userId: string): Promise<UploadResult> {
    try {
        console.log(`Processing file upload: ${file.name}, size: ${file.size}, type: ${file.type}`);

        // Validate file
        if (!file || !(file instanceof File)) {
            return { success: false, error: 'No valid file provided' };
        }

        if (file.size === 0) {
            return { success: false, error: 'File is empty' };
        }

        // File type validation
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/gif'];
        if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
            return { 
                success: false, 
                error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}` 
            };
        }

        // File size validation (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return { success: false, error: 'File too large. Maximum size is 10MB' };
        }

        // Create upload directory
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error('Error creating upload directory:', error);
            return { success: false, error: 'Server configuration error' };
        }

        // Generate secure filename
        const extension = path.extname(file.name) || '.jpg';
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 12);
        const filename = `${userId}-${timestamp}-${randomStr}${extension}`;
        const filepath = path.join(uploadDir, filename);

        console.log('Saving file to:', filepath);

        // Save file
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await fs.writeFile(filepath, buffer);
            console.log('File saved successfully');
        } catch (writeError) {
            console.error('Error writing file:', writeError);
            return { success: false, error: 'Failed to save file' };
        }

        // Return success response
        const fileUrl = `/uploads/${filename}`;
        console.log('Upload successful, returning URL:', fileUrl);
        
        return { 
            success: true,
            url: fileUrl,
            filename: filename
        };

    } catch (error) {
        console.error('Upload utility error:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
}
