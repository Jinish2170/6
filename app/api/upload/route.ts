import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/upload';

// Configure API route to handle larger payloads
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
    try {
        console.log('=== UPLOAD API START ===');
        
        // Verify authentication first
        const user = await auth(request);
        if (!user) {
            console.log('Authentication failed');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('User authenticated:', user.id);
        console.log('Request content-type:', request.headers.get('content-type'));

        // Check if request has a body
        if (!request.body) {
            console.error('No request body found');
            return NextResponse.json({ error: 'No request body' }, { status: 400 });
        }

        if (request.bodyUsed) {
            console.error('Request body already consumed');
            return NextResponse.json({ error: 'Request body already consumed' }, { status: 400 });
        }

        // Parse FormData
        let formData: FormData;
        try {
            console.log('Attempting to parse FormData...');
            formData = await request.formData();
            console.log('✓ FormData parsed successfully');
        } catch (parseError) {
            console.error('✗ FormData parsing failed:', parseError);
            
            return NextResponse.json({ 
                error: 'Failed to parse multipart form data',
                details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
                type: parseError instanceof Error ? parseError.constructor.name : 'Unknown'
            }, { status: 400 });
        }

        // Log all FormData entries for debugging
        const entries = Array.from(formData.entries());
        console.log('FormData entries:', entries.map(([key, value]) => [
            key, 
            typeof value, 
            value instanceof File ? `File: ${value.name} (${value.size} bytes, ${value.type})` : value
        ]));

        // Get the file
        const file = formData.get('file') as File | null;
        
        if (!file || !(file instanceof File)) {
            console.error('No valid file found in FormData');
            return NextResponse.json({ error: 'No file provided or invalid file format' }, { status: 400 });
        }

        // Use the upload utility
        const result = await saveUploadedFile(file, user.id);
        
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
        
        return NextResponse.json(result);

    } catch (error) {
        console.error('Upload API error:', error);
        
        return NextResponse.json({ 
            error: 'Upload failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
