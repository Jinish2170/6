import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import crypto from 'crypto';

config();

// Database connection configuration with optimized settings
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Secure123!',
    database: 'property_management2',
    waitForConnections: true,
    connectionLimit: 15,      // Increased
    queueLimit: 30,          // Increased queue limit 
    maxIdle: 10,             // Increased max idle connections
    idleTimeout: 60000,     // Idle timeout: 60 seconds
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Monitor connection stats for debugging
let activeConnections = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 100; // ms
const CONNECTION_TIMEOUT = 5000; // 5 seconds

// Export pool and connection monitoring
export { pool };
export { activeConnections };

// Connection management functions
async function getConnectionWithTimeout(): Promise<mysql.PoolConnection> {
    return new Promise(async (resolve, reject) => {
        // Set timeout to prevent hanging
        const timeout = setTimeout(() => {
            reject(new Error('Timeout getting connection from pool'));
        }, CONNECTION_TIMEOUT);
        
        try {
            const connection = await pool.getConnection();
            clearTimeout(timeout);
            resolve(connection);
        } catch (err) {
            clearTimeout(timeout);
            reject(err);
        }
    });
}

// Helper function to execute queries with improved error handling and connection management
export async function query<T>(sql: string, params?: any[]): Promise<T[]> {
    let retryCount = 0;
    let connection;
    
    while (retryCount < MAX_RETRY_ATTEMPTS) {
        try {
            // Try to get a connection from the pool with timeout
            connection = await getConnectionWithTimeout();
            activeConnections++;
            
            // Log connection stats for debugging purposes
            console.log(`DB connections: active=${activeConnections}`);
            
            // Execute the query
            const [results] = await connection.execute(sql, params);
            return results as T[];
        } catch (error: any) {
            // Check if it's a connection error that can be retried
            if ((error.message.includes('Queue limit reached') || 
                 error.message.includes('Timeout getting connection')) && 
                retryCount < MAX_RETRY_ATTEMPTS - 1) {
                retryCount++;
                console.warn(`Retrying database connection (attempt ${retryCount} of ${MAX_RETRY_ATTEMPTS})...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
                continue;
            }
            
            console.error('Database query error:', error);
            throw error;
        } finally {
            if (connection) {
                // Always release the connection back to the pool
                connection.release();
                activeConnections--;
            }
        }
    }

    // This should never be reached due to the throw in the catch block
    throw new Error('Failed to execute query after multiple attempts');
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

export interface PropertyVisit {
    id: string;
    property_id: string;
    tenant_id: string;
    landlord_id: string;
    visit_date: Date;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    message?: string;
    created_at: Date;
    updated_at: Date;
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

    async updateUser(id: string, updates: Partial<Pick<User, 'name' | 'phone'>>): Promise<void> {
        const fields = Object.keys(updates);
        if (fields.length === 0) return;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => updates[field as keyof typeof updates]);
        
        await query(
            `UPDATE users SET ${setClause} WHERE id = ?`,
            [...values, id]
        );
    },    // Property related queries
    async getProperties(filters?: { 
        status?: string; 
        landlord_id?: string;
        location?: string;
        minPrice?: number;
        maxPrice?: number;
        bedrooms?: number;
        bathrooms?: number;
    }): Promise<Property[]> {
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
        if (filters?.location) {
            sql += ' AND location LIKE ?';
            params.push(`%${filters.location}%`);
        }
        if (filters?.minPrice !== undefined) {
            sql += ' AND price >= ?';
            params.push(filters.minPrice);
        }
        if (filters?.maxPrice !== undefined) {
            sql += ' AND price <= ?';
            params.push(filters.maxPrice);
        }
        if (filters?.bedrooms !== undefined) {
            if (filters.bedrooms >= 4) {
                sql += ' AND bedrooms >= ?';
                params.push(4);
            } else {
                sql += ' AND bedrooms = ?';
                params.push(filters.bedrooms);
            }
        }
        if (filters?.bathrooms !== undefined) {
            sql += ' AND bathrooms >= ?';
            params.push(filters.bathrooms);
        }

        // Add ORDER BY to get consistent results
        sql += ' ORDER BY created_at DESC';

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
    },    // Property Images
    async getPropertyImages(property_id: string): Promise<PropertyImage[]> {
        return query('SELECT * FROM property_images WHERE property_id = ?', [property_id]) as Promise<PropertyImage[]>;
    },

    // Bulk fetch property images for multiple properties
    async bulkGetPropertyImages(property_ids: string[]): Promise<PropertyImage[]> {
        if (property_ids.length === 0) return [];
        
        // Create placeholders for the IN clause (?, ?, ?)
        const placeholders = property_ids.map(() => '?').join(',');
        return query(
            `SELECT * FROM property_images WHERE property_id IN (${placeholders})`, 
            property_ids
        ) as Promise<PropertyImage[]>;
    },

    async addPropertyImage(image: Omit<PropertyImage, 'id' | 'created_at'>): Promise<string> {
        const id = crypto.randomUUID();
        await query(
            'INSERT INTO property_images (id, property_id, image_url, is_featured) VALUES (?, ?, ?, ?)',
            [id, image.property_id, image.image_url, image.is_featured]
        );
        return id;
    },    // Features/Amenities
    async getPropertyFeatures(property_id: string): Promise<Feature[]> {
        return query(
            `SELECT f.*, pf.property_id FROM features f 
             JOIN property_features pf ON f.id = pf.feature_id 
             WHERE pf.property_id = ?`,
            [property_id]
        ) as Promise<Feature[]>;
    },
    
    // Bulk fetch property features for multiple properties
    async bulkGetPropertyFeatures(property_ids: string[]): Promise<(Feature & { property_id: string })[]> {
        if (property_ids.length === 0) return [];
        
        // Create placeholders for the IN clause (?, ?, ?)
        const placeholders = property_ids.map(() => '?').join(',');
        return query(
            `SELECT f.*, pf.property_id FROM features f 
             JOIN property_features pf ON f.id = pf.feature_id 
             WHERE pf.property_id IN (${placeholders})`,
            property_ids
        ) as Promise<(Feature & { property_id: string })[]>;
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

    async updatePropertyStatus(id: string, status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE'): Promise<void> {
        await query(
            'UPDATE properties SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
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
