import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'landlord') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all properties for the landlord
        const properties = await db.getProperties({ landlord_id: user.id });

        // Get stats
        const propertyStats = {
            totalProperties: properties.length,
            occupiedProperties: properties.filter(p => p.status === 'RENTED').length,
            vacantProperties: properties.filter(p => p.status === 'AVAILABLE').length,
            maintenanceProperties: properties.filter(p => p.status === 'MAINTENANCE').length,
            totalRevenue: properties
                .filter(p => p.status === 'RENTED')
                .reduce((acc, curr) => acc + Number(curr.price), 0)
        };

        // Get recent properties with images and features
        const recentProperties = await Promise.all(
            properties
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map(async (property) => {
                    const [images, features] = await Promise.all([
                        db.getPropertyImages(property.id),
                        db.getPropertyFeatures(property.id)
                    ]);

                    return {
                        id: property.id,
                        title: property.title,
                        location: property.location,
                        status: property.status,
                        price: property.price,
                        image: images.find(img => img.is_featured)?.image_url || '/placeholder.svg',
                        features
                    };
                })
        );

        return NextResponse.json({
            propertyStats,
            recentProperties
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}