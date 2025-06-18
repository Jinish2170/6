import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getVisitLogsForLandlord } from '../../visits/route';

export async function GET(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'landlord') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get visits for this landlord
        const landlordVisits = getVisitLogsForLandlord(user.id);
        
        // Sort by scheduled date (most recent first)
        landlordVisits.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

        return NextResponse.json({ 
            visits: landlordVisits.slice(0, 10), // Return last 10 visits
            total: landlordVisits.length 
        });

    } catch (error) {
        console.error('Error fetching visit logs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
