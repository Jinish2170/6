import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { PropertyImage, Feature } from '@/lib/db';

// Add cache control header
export const revalidate = 60; // Revalidate every 60 seconds

// GET favorite properties for a tenant with optimized queries
export async function GET(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'tenant') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all favorites in one query first
        const favorites = await db.getFavorites(user.id);
        
        // Batch fetch images and features for all properties rather than one at a time
        const propertyIds = favorites.map(fav => fav.id);
        
        // If there are no favorites, return empty array early
        if (propertyIds.length === 0) {
            return NextResponse.json([]);
        }
        
        // Get all images and features in two bulk queries
        const [allImages, allFeatures] = await Promise.all([
            db.bulkGetPropertyImages(propertyIds),
            db.bulkGetPropertyFeatures(propertyIds)
        ]);
          // Map the results back to individual properties
        const propertiesWithDetails = favorites.map(property => {
            return {
                ...property,
                images: allImages.filter((img: PropertyImage) => img.property_id === property.id),
                features: allFeatures.filter((feat: Feature & { property_id: string }) => feat.property_id === property.id)
            };
        });

        // Return response with cache headers
        return NextResponse.json(propertiesWithDetails, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST to add a property to favorites
export async function POST(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'tenant') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { propertyId } = await request.json();
        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        await db.addFavorite(user.id, propertyId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error adding favorite:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE to remove a property from favorites
export async function DELETE(request: Request) {    try {
        const user = await auth(request);
        if (!user || user.role !== 'tenant') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('propertyId');
        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        await db.removeFavorite(user.id, propertyId);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing favorite:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
