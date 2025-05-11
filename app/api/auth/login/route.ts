import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

interface JWTPayload {
    id: string;
    email: string;
    role: string;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        console.log('Login attempt for email:', email);

        const user = await db.getUserByEmail(email);
        if (!user) {
            console.log('User not found');
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Simplified auth for college project - direct password comparison
        if (password !== 'Test@123') { // Using a simple default password
            console.log('Invalid password');
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }

        const payload: JWTPayload = {
            id: user.id,
            email: user.email,
            role: (user.role || 'TENANT').toLowerCase() // Normalize role to lowercase with default
        };

        const token = jwt.sign(payload, jwtSecret, {
            expiresIn: '24h'
        });

        console.log('Login successful for:', email);

        // Return the response with normalized role
        return NextResponse.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: (user.role || 'TENANT').toLowerCase()
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
