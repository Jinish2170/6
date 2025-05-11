import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function DELETE(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'landlord') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        const featureId = searchParams.get('featureId');
        
        if (!propertyId || !featureId) {
            return NextResponse.json({ error: 'Property ID and Feature ID are required' }, { status: 400 });
        }

        // Verify property ownership
        const property = await db.getPropertyById(propertyId);
        if (!property || property.landlord_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete the feature association
        await db.query('DELETE FROM property_features WHERE property_id = ? AND feature_id = ?', [propertyId, featureId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing property feature:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
