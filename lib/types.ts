import { z } from 'zod';
import { Property, PropertyImage, Feature } from './db';
import { User } from './auth-context';

export interface PropertyWithDetails extends Property {
    images: PropertyImage[];
    features: Feature[];
}

export interface ExtendedUser extends User {
    phone?: string;
}

export const propertySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    location: z.string().min(1, 'Location is required'),
    price: z.number().positive('Price must be positive'),
    bedrooms: z.number().int().positive('Bedrooms must be positive'),
    bathrooms: z.number().positive('Bathrooms must be positive'),
    area: z.number().positive('Area must be positive').nullable(),
    status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE']).default('AVAILABLE')
});
