import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'tenant') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { propertyId, paymentDetails } = await request.json();

        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        // Check if property exists and is available
        const property = await db.getPropertyById(propertyId);
        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        if (property.status !== 'AVAILABLE') {
            return NextResponse.json({ error: 'Property is not available for rent' }, { status: 400 });
        }

        // Update property status to RENTED
        await db.updatePropertyStatus(propertyId, 'RENTED');

        // Return success response
        return NextResponse.json({
            success: true,
            message: 'Property rental completed successfully',
            propertyId: propertyId,
            propertyTitle: property.title,
            rentAmount: property.price
        });

    } catch (error) {
        console.error('Property rental error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
