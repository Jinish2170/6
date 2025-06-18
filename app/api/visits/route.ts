import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Temporary in-memory storage for visits (in a real app, this would be in database)
let visitLogs: Array<{
    id: string;
    tenantId: string;
    tenantName: string;
    tenantEmail: string;
    tenantPhone: string | null;
    propertyId: string;
    propertyTitle: string;
    propertyLocation: string;
    landlordId: string;
    visitDate: string;
    message: string;
    scheduledAt: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}> = [];

export async function POST(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'tenant') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { propertyId, visitDate, message } = await request.json();

        if (!propertyId || !visitDate) {
            return NextResponse.json({ error: 'Property ID and visit date are required' }, { status: 400 });
        }

        // Get full user details and property details
        const fullUser = await db.getUserById(user.id);
        const property = await db.getPropertyById(propertyId);

        if (!fullUser || !property) {
            return NextResponse.json({ error: 'User or property not found' }, { status: 404 });
        }

        // Create visit log entry
        const visitLogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            tenantId: user.id,
            tenantName: fullUser.name,
            tenantEmail: fullUser.email,
            tenantPhone: fullUser.phone,
            propertyId,
            propertyTitle: property.title,
            propertyLocation: property.location,
            landlordId: property.landlord_id,
            visitDate,
            message: message || 'No additional message',
            scheduledAt: new Date().toISOString(),
            status: 'pending' as const
        };

        // Store the visit log
        visitLogs.push(visitLogEntry);

        console.log(`Visit scheduled and logged:`, visitLogEntry);
        console.log(`Total visit logs: ${visitLogs.length}`);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Visit scheduled successfully. The landlord will contact you to confirm the appointment.',
            details: {
                propertyTitle: property.title,
                visitDate,
                contactInfo: 'You will be contacted within 24 hours'
            }
        });

    } catch (error) {
        console.error('Error scheduling visit:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Function to get visit logs for landlord dashboard
export function getVisitLogsForLandlord(landlordId: string) {
    return visitLogs.filter(visit => visit.landlordId === landlordId);
}
