import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PropertyWithDetails } from '@/lib/types';

// Add cache control headers to prevent repeated requests
export const revalidate = 300; // Revalidate at most once per 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fetch property
    const property = await db.getPropertyById(id);
    
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Fetch additional property data in parallel
    const [images, features] = await Promise.all([
      db.getPropertyImages(id),
      db.getPropertyFeatures(id)
    ]);

    // Return the property with its details and cache headers
    return NextResponse.json({
      ...property,
      images,
      features
    } as PropertyWithDetails, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}