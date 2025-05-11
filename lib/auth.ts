import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from './db';

export interface AuthUser {
    id: string;
    email: string;
    role: 'landlord' | 'tenant'; // Updated to lowercase
}

export async function auth(request: Request): Promise<AuthUser | null> {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) return null;

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await db.getUserById(decoded.id);
        
        if (!user) return null;

        // Ensure role is properly typed
        const normalizedRole = user.role.toLowerCase() as 'landlord' | 'tenant';
        
        return {
            id: user.id,
            email: user.email,
            role: normalizedRole
        };
    } catch (error) {
        return null;
    }
}

export function withAuth(handler: Function, allowedRoles?: string[]) {
    return async (request: Request) => {
        const user = await auth(request);
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return handler(request, user);
    };
}
