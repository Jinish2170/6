import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET favorite properties for a tenant
export async function GET(request: Request) {    try {
        const user = await auth(request);
        if (!user || user.role !== 'tenant') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const favorites = await db.getFavorites(user.id);
        const propertiesWithDetails = await Promise.all(favorites.map(async (property) => {
            const [images, features] = await Promise.all([
                db.getPropertyImages(property.id),
                db.getPropertyFeatures(property.id)
            ]);

            return {
                ...property,
                images,
                features
            };
        }));

        return NextResponse.json(propertiesWithDetails);
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
