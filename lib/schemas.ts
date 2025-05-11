import { z } from 'zod';

export const propertySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    location: z.string().min(1, 'Location is required'),
    price: z.number().positive('Price must be positive'),
    bedrooms: z.number().int().min(0, 'Bedrooms must be 0 or more'),
    bathrooms: z.number().min(0, 'Bathrooms must be 0 or more'),
    area: z.number().nullable().optional(),
    status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE']).default('AVAILABLE')
});
