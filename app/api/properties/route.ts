import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { PropertyWithDetails } from '@/lib/types';
import { propertySchema } from '@/lib/schemas';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const status = searchParams.get('status');
        const landlordId = searchParams.get('landlordId');

        // If ID is provided, fetch single property
        if (id) {
            const property = await db.getPropertyById(id);
            if (!property) {
                return NextResponse.json({ error: 'Property not found' }, { status: 404 });
            }

            const [images, features] = await Promise.all([
                db.getPropertyImages(id),
                db.getPropertyFeatures(id)
            ]);

            return NextResponse.json({
                ...property,
                images,
                features
            } as PropertyWithDetails);
        }

        // Otherwise, fetch filtered properties
        const properties = await db.getProperties({ 
            status: status || undefined,
            landlord_id: landlordId || undefined
        });

        // Fetch images and features for each property
        const propertiesWithDetails = await Promise.all(properties.map(async (property) => {
            const [images, features] = await Promise.all([
                db.getPropertyImages(property.id),
                db.getPropertyFeatures(property.id)
            ]);

            return {
                ...property,
                images,
                features
            } as PropertyWithDetails;
        }));

        return NextResponse.json(propertiesWithDetails);
    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'landlord') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const propertyInput = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            location: formData.get('location') as string,
            price: Number(formData.get('price')) || 0,
            bedrooms: Number(formData.get('bedrooms')) || 0,
            bathrooms: Number(formData.get('bathrooms')) || 0,
            area: formData.has('area') ? Number(formData.get('area')) : null,
            status: (formData.get('status') as 'AVAILABLE' | 'RENTED' | 'MAINTENANCE') || 'AVAILABLE'
        };

        // Validate input
        const validationResult = propertySchema.safeParse(propertyInput);
        if (!validationResult.success) {
            return NextResponse.json({ 
                error: 'Validation failed',
                issues: validationResult.error.issues 
            }, { status: 400 });
        }

        // Add landlord_id to validated data
        const property = {
            ...validationResult.data,
            landlord_id: user.id
        };

                const propertyId = await db.createProperty(property);

        // Handle image uploads
        const images = formData.getAll('images') as File[];
        if (images.length > 0) {
            const authHeader = request.headers.get('Authorization') || '';
            try {
                await Promise.all(images.map(async (image, index) => {
                    const formData = new FormData();
                    formData.append('file', image);
                    
                    const uploadResponse = await fetch(new URL('/api/upload', request.url), {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Authorization': authHeader
                        }
                    });

                    if (!uploadResponse.ok) {
                        throw new Error('Failed to upload image');
                    }

                    const { url } = await uploadResponse.json();
                    
                    await db.addPropertyImage({
                        property_id: propertyId,
                        image_url: url,
                        is_featured: index === 0
                    });
                }));
            } catch (error) {
                console.error('Error uploading images:', error);
                // Delete the property if image upload fails
                await db.deleteProperty(propertyId);
                throw new Error('Failed to upload images');
            }
        }

        // Handle features
        const featuresStr = formData.get('features') as string;
        if (featuresStr) {
            const features = JSON.parse(featuresStr);
            await Promise.all(features.map((featureId: string) => 
                db.addPropertyFeature(propertyId, featureId)
            ));
        }

        return NextResponse.json({ id: propertyId });
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'landlord') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('id');
        
        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        // Check if property exists and belongs to landlord
        const existingProperty = await db.getPropertyById(propertyId);
        if (!existingProperty) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }
        if (existingProperty.landlord_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const propertyInput = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            location: formData.get('location') as string,
            price: Number(formData.get('price')),
            bedrooms: Number(formData.get('bedrooms')),
            bathrooms: Number(formData.get('bathrooms')),
            area: Number(formData.get('area')),
            status: (formData.get('status') as 'AVAILABLE' | 'RENTED' | 'MAINTENANCE') || 'AVAILABLE'
        };

        // Validate input
        const validationResult = propertySchema.safeParse(propertyInput);
        if (!validationResult.success) {
            return NextResponse.json({ 
                error: 'Validation failed',
                issues: validationResult.error.issues 
            }, { status: 400 });
        }

        // Update property
        await db.updateProperty(propertyId, {
            ...validationResult.data,
            landlord_id: user.id
        });

        // Handle features
        const featuresStr = formData.get('features') as string;
        if (featuresStr) {
            // Remove existing features and add new ones
            await db.clearPropertyFeatures(propertyId);
            const features = JSON.parse(featuresStr);
            await Promise.all(features.map((featureId: string) => 
                db.addPropertyFeature(propertyId, featureId)
            ));
        }

        // Handle images
        const images = formData.getAll('images') as File[];
        if (images.length > 0) {
            const authHeader = request.headers.get('Authorization') || '';
            await Promise.all(images.map(async (image, index) => {
                const imageUrl = await handleImageUpload(image, authHeader);
                await db.addPropertyImage({
                    property_id: propertyId,
                    image_url: imageUrl,
                    is_featured: index === 0
                });
            }));
        }

        // Get updated property with details
        const [updatedProperty, updatedImages, updatedFeatures] = await Promise.all([
            db.getPropertyById(propertyId),
            db.getPropertyImages(propertyId),
            db.getPropertyFeatures(propertyId)
        ]);

        return NextResponse.json({
            ...updatedProperty,
            images: updatedImages,
            features: updatedFeatures
        } as PropertyWithDetails);
    } catch (error) {
        console.error('Error updating property:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await auth(request);
        if (!user || user.role !== 'landlord') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const propertyId = searchParams.get('id');
        
        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        // Check if property exists and belongs to landlord
        const property = await db.getPropertyById(propertyId);
        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }
        if (property.landlord_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete property (cascade will handle related records)
        await db.deleteProperty(propertyId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function handleImageUpload(file: File, authHeader: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': authHeader
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.url;
}
