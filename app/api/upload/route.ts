import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Verify authentication
        const user = await auth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Handle file upload
        let formData;
        try {
            formData = await request.formData();
        } catch (error) {
            return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
        }

        const file = formData.get('file') as File;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Verify file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
        const fileType = file.type.toLowerCase();
        if (!allowedTypes.includes(fileType)) {
            return NextResponse.json({ 
                error: `Invalid file type: ${fileType}. Supported formats: JPG, PNG, WEBP, HEIC` 
            }, { status: 400 });
        }

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 });
        }

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error('Error creating upload directory:', error);
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Generate unique filename using user ID for better organization
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
        const ext = path.extname(cleanFileName);
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 9);
        const filename = `${user.id}-${timestamp}-${randomStr}${ext}`;
        const filepath = path.join(uploadDir, filename);

        // Write file
        try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await fs.writeFile(filepath, buffer);
        } catch (error) {
            console.error('Error writing file:', error);
            return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
        }

        // Return the URL
        const fileUrl = `/uploads/${filename}`;
        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Failed to upload file' 
        }, { status: 500 });
    }
}
