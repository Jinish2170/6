import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

// Database connection configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Secure123!',
    database: 'property_management2',
    waitForConnections: true,
    connectionLimit: 5,      // Reduced from 10
    queueLimit: 7,          // Added reasonable queue limit
    maxIdle: 5,            // Max idle connections
    idleTimeout: 60000,    // Idle timeout: 60 seconds
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

export { pool };

// Helper function to execute queries
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
    try {
        const connection = await pool.getConnection();
        try {
            const [results] = await connection.execute(sql, params);
            return results as T[];
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Type definitions for database entities
export interface User {
    id: string;
    email: string;
    password: string;
    role: 'LANDLORD' | 'TENANT';
    name: string;
    phone: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface Property {
    id: string;
    landlord_id: string;
    title: string;
    description: string | null;
    location: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number | null;
    status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
    created_at: Date;
    updated_at: Date;
}

export interface PropertyImage {
    id: string;
    property_id: string;
    image_url: string;
    is_featured: boolean;
    created_at: Date;
}

export interface Feature {
    id: string;
    name: string;
    icon_name: string;
}

// Database access functions
export const db = {
    // Features
    async getAllFeatures(): Promise<Feature[]> {
        return query('SELECT * FROM features') as Promise<Feature[]>;
    },

    // User related queries
    async getUserById(id: string): Promise<User | null> {
        const users = await query('SELECT * FROM users WHERE id = ?', [id]);
        return users.length ? users[0] as User : null;
    },

    async getUserByEmail(email: string): Promise<User | null> {
        const users = await query('SELECT * FROM users WHERE email = ?', [email]);
        return users.length ? users[0] as User : null;
    },

    async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
        const id = crypto.randomUUID();
        await query(
            'INSERT INTO users (id, email, password, role, name, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [id, user.email, user.password, user.role, user.name, user.phone]
        );
        return id;
    },

    // Property related queries
    async getProperties(filters?: { status?: string; landlord_id?: string }): Promise<Property[]> {
        let sql = 'SELECT * FROM properties WHERE 1=1';
        const params: any[] = [];

        if (filters?.status) {
            sql += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters?.landlord_id) {
            sql += ' AND landlord_id = ?';
            params.push(filters.landlord_id);
        }

        return query(sql, params) as Promise<Property[]>;
    },

    async getPropertyById(id: string): Promise<Property | null> {
        const properties = await query('SELECT * FROM properties WHERE id = ?', [id]);
        return properties.length ? properties[0] as Property : null;
    },

    async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
        const id = crypto.randomUUID();
        await query(
            'INSERT INTO properties (id, landlord_id, title, description, location, price, bedrooms, bathrooms, area, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, property.landlord_id, property.title, property.description, property.location, property.price, property.bedrooms, property.bathrooms, property.area, property.status]
        );
        return id;
    },

    // Property Images
    async getPropertyImages(property_id: string): Promise<PropertyImage[]> {
        return query('SELECT * FROM property_images WHERE property_id = ?', [property_id]) as Promise<PropertyImage[]>;
    },

    async addPropertyImage(image: Omit<PropertyImage, 'id' | 'created_at'>): Promise<string> {
        const id = crypto.randomUUID();
        await query(
            'INSERT INTO property_images (id, property_id, image_url, is_featured) VALUES (?, ?, ?, ?)',
            [id, image.property_id, image.image_url, image.is_featured]
        );
        return id;
    },

    // Features/Amenities
    async getPropertyFeatures(property_id: string): Promise<Feature[]> {
        return query(
            `SELECT f.* FROM features f 
             JOIN property_features pf ON f.id = pf.feature_id 
             WHERE pf.property_id = ?`,
            [property_id]
        ) as Promise<Feature[]>;
    },

    async addPropertyFeature(property_id: string, feature_id: string): Promise<void> {
        await query(
            'INSERT INTO property_features (property_id, feature_id) VALUES (?, ?)',
            [property_id, feature_id]
        );
    },

    // Favorites
    async getFavorites(tenant_id: string): Promise<Property[]> {
        return query(
            `SELECT p.* FROM properties p 
             JOIN favorites f ON p.id = f.property_id 
             WHERE f.tenant_id = ?`,
            [tenant_id]
        ) as Promise<Property[]>;
    },

    async addFavorite(tenant_id: string, property_id: string): Promise<void> {
        await query(
            'INSERT INTO favorites (tenant_id, property_id) VALUES (?, ?)',
            [tenant_id, property_id]
        );
    },

    async removeFavorite(tenant_id: string, property_id: string): Promise<void> {
        await query(
            'DELETE FROM favorites WHERE tenant_id = ? AND property_id = ?',
            [tenant_id, property_id]
        );
    },

    // Extra property operations
    async updateProperty(id: string, property: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
        await query(
            `UPDATE properties 
             SET title = ?, description = ?, location = ?, price = ?, 
                 bedrooms = ?, bathrooms = ?, area = ?, status = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [property.title, property.description, property.location, property.price,
             property.bedrooms, property.bathrooms, property.area, property.status,
             id]
        );
    },

    async deleteProperty(id: string): Promise<void> {
        // Due to CASCADE constraints, this will also delete related images and features
        await query('DELETE FROM properties WHERE id = ?', [id]);
    },

    async clearPropertyFeatures(property_id: string): Promise<void> {
        await query('DELETE FROM property_features WHERE property_id = ?', [property_id]);
    },

    async deletePropertyImage(id: string): Promise<void> {
        await query('DELETE FROM property_images WHERE id = ?', [id]);
    },
};
