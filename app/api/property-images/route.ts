import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'landlord') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const imageId = searchParams.get('id');
        
        if (!imageId) {
            return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
        }

        // Get image details
        const images = await db.query('SELECT * FROM property_images WHERE id = ?', [imageId]) as any[];
        if (!images.length) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        const image = images[0];

        // Verify property ownership
        const property = await db.getPropertyById(image.property_id);
        if (!property || property.landlord_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete the physical file
        try {
            const filePath = path.join(process.cwd(), 'public', image.image_url);
            await fs.unlink(filePath);
        } catch (error) {
            console.error('Error deleting image file:', error);
            // Continue with database deletion even if file deletion fails
        }

        // Delete from database
        await db.deletePropertyImage(imageId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting property image:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
