import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { PropertyWithDetails } from '@/lib/types';
import { propertySchema } from '@/lib/schemas';
import { saveUploadedFile } from '@/lib/upload';

// Add cache control headers
export const revalidate = 300; // Revalidate at most once per 5 minutes

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const status = searchParams.get('status');
        const landlordId = searchParams.get('landlordId');
        const location = searchParams.get('location');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const bedrooms = searchParams.get('bedrooms');
        const bathrooms = searchParams.get('bathrooms');

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
            } as PropertyWithDetails, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
                }
            });
        }

        // Build search filters
        const filters: any = {};
        
        if (status) {
            filters.status = status;
        }
        if (landlordId) {
            filters.landlord_id = landlordId;
        }
        if (location) {
            filters.location = location;
        }
        if (minPrice) {
            filters.minPrice = parseInt(minPrice);
        }
        if (maxPrice) {
            filters.maxPrice = parseInt(maxPrice);
        }
        if (bedrooms && bedrooms !== 'any') {
            filters.bedrooms = bedrooms === '4+' ? 4 : parseInt(bedrooms);
        }
        if (bathrooms && bathrooms !== 'any') {
            filters.bathrooms = parseFloat(bathrooms);
        }

        // Fetch filtered properties
        const properties = await db.getProperties(filters);
        
        // If no properties found, return empty array
        if (properties.length === 0) {
            return NextResponse.json([]);
        }

        // Batch fetch images and features for all properties
        const propertyIds = properties.map(property => property.id);
        const [allImages, allFeatures] = await Promise.all([
            db.bulkGetPropertyImages(propertyIds),
            db.bulkGetPropertyFeatures(propertyIds)
        ]);

        // Map images and features to their properties
        const propertiesWithDetails = properties.map(property => {
            return {
                ...property,
                images: allImages.filter(img => img.property_id === property.id),
                features: allFeatures.filter(feat => feat.property_id === property.id)
            } as PropertyWithDetails;
        });

        return NextResponse.json(propertiesWithDetails, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
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
        }        // Add landlord_id to validated data
        const property = {
            ...validationResult.data,
            landlord_id: user.id,
            area: validationResult.data.area ?? null // Ensure area is either a number or null, not undefined
        };

        const propertyId = await db.createProperty(property);        // Handle image uploads
        const images = formData.getAll('images') as File[];
        console.log(`Processing ${images.length} images for property ${propertyId}`);
        
        if (images.length > 0) {
            // Validate that all items are actual files
            const validImages = images.filter(img => img instanceof File && img.size > 0);
            
            if (validImages.length !== images.length) {
                console.warn(`Found ${images.length - validImages.length} invalid image entries`);
            }
              if (validImages.length > 0) {
                try {
                    // Process images directly using the upload utility
                    for (let index = 0; index < validImages.length; index++) {
                        const image = validImages[index];
                        console.log(`Processing image ${index + 1}: ${image.name}, size: ${image.size}, type: ${image.type}`);
                        
                        // Use the upload utility directly instead of HTTP request
                        const uploadResult = await saveUploadedFile(image, user.id);
                        
                        if (!uploadResult.success) {
                            throw new Error(`Failed to upload image ${image.name}: ${uploadResult.error}`);
                        }

                        if (!uploadResult.url) {
                            throw new Error(`Upload succeeded but no URL returned for ${image.name}`);
                        }
                        
                        await db.addPropertyImage({
                            property_id: propertyId,
                            image_url: uploadResult.url,
                            is_featured: index === 0
                        });
                        
                        console.log(`Successfully saved image ${index + 1} with URL: ${uploadResult.url}`);
                    }
                } catch (error) {
                    console.error('Error uploading images:', error);
                    // Delete the property if image upload fails
                    await db.deleteProperty(propertyId);
                    throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
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
        }        // Update property
        await db.updateProperty(propertyId, {
            ...validationResult.data,
            landlord_id: user.id,
            area: validationResult.data.area ?? null // Ensure area is either a number or null, not undefined
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
        }        // Handle images
        const images = formData.getAll('images') as File[];
        console.log(`Processing ${images.length} images for property update ${propertyId}`);
        
        if (images.length > 0) {
            // Validate that all items are actual files
            const validImages = images.filter(img => img instanceof File && img.size > 0);
            
            if (validImages.length !== images.length) {
                console.warn(`Found ${images.length - validImages.length} invalid image entries`);
            }
            
            if (validImages.length > 0) {
                const authHeader = request.headers.get('Authorization') || '';
                try {
                    // Process images one by one for better error handling
                    for (let index = 0; index < validImages.length; index++) {
                        const image = validImages[index];
                        console.log(`Processing update image ${index + 1}, size: ${image.size} bytes, type: ${image.type}`);
                        
                        const imageUrl = await handleImageUpload(image, authHeader, request.url);
                        await db.addPropertyImage({
                            property_id: propertyId,
                            image_url: imageUrl,
                            is_featured: index === 0
                        });
                        
                        console.log(`Successfully saved update image ${index + 1} with URL: ${imageUrl}`);
                    }
                } catch (error) {
                    console.error('Error uploading images:', error);
                    throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
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

async function handleImageUpload(file: File, authHeader: string, requestUrl: string): Promise<string> {
    if (!(file instanceof File) || file.size === 0) {
        throw new Error('Invalid file object provided');
    }
    
    console.log(`handleImageUpload called with file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Log FormData contents for debugging
    console.log('handleImageUpload FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, typeof value, value instanceof File ? `File: ${value.name}` : value]));
    
    // Use origin from the request URL to construct the absolute upload URL
    const url = new URL(requestUrl);
    const uploadUrl = `${url.origin}/api/upload`;
    
    console.log(`Uploading image to ${uploadUrl}, size: ${file.size} bytes, type: ${file.type}`);
    
    const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': authHeader
        }
    });

    if (!response.ok) {
        let errorText;
        try {
            const errorData = await response.json();
            errorText = errorData.error;
        } catch (e) {
            errorText = await response.text();
        }
        console.error(`Image upload failed: ${errorText}`);
        throw new Error(`Failed to upload image: ${errorText}`);
    }

    const responseData = await response.json();
    
    if (!responseData.url) {
        throw new Error('Upload succeeded but no URL was returned');
    }
    
    return responseData.url;
}
