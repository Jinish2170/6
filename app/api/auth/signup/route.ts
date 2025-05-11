import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { name, email, password, role } = await request.json();

        // Validate input
        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        // Store password as plain text for college project
        const plainPassword = 'Test@123'; // Using a simple default password        // Normalize role to lowercase
        const normalizedRole = role.toLowerCase();
        
        // Create user
        const userId = await db.createUser({
            email,
            password: plainPassword,
            name,
            role: normalizedRole,
            phone: null
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: userId, email, role: normalizedRole },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        return NextResponse.json({
            token,
            user: {
                id: userId,
                email,
                name,
                role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
