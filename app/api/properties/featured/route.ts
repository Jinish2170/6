import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { PropertyWithDetails } from '@/lib/types';

// Add cache control headers to prevent repeated requests
export const revalidate = 3600; // Revalidate at most once per hour

export async function GET(request: Request) {
    try {
        // Get all available properties
        const properties = await db.getProperties({ status: 'AVAILABLE' });

        // Get properties with images and features
        const propertiesWithDetails = await Promise.all(properties.map(async (property) => {
            const [images, features] = await Promise.all([
                db.getPropertyImages(property.id),
                db.getPropertyFeatures(property.id)
            ]);

            return {
                id: property.id,
                title: property.title,
                location: property.location,
                price: property.price,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                area: property.area,
                status: property.status,
                image: images.find(img => img.is_featured)?.image_url || '/placeholder.svg',
                features
            };
        }));        // Sort properties by date and get the most recent ones
        const featuredProperties = propertiesWithDetails
            .sort((a, b) => {
                // Sort more expensive properties first as featured
                return b.price - a.price;
            })
            .slice(0, 8); // Increased to show more properties
        
        // Mark all properties as AVAILABLE for consistency
        featuredProperties.forEach(property => {
            property.status = 'AVAILABLE';
        });

        // Return response with cache control headers
        return NextResponse.json(featuredProperties, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
            }
        });
    } catch (error) {
        console.error('Error fetching featured properties:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
