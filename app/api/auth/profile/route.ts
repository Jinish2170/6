import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: Request) {
    try {
        const user = await auth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await request.json();
          // Validate and sanitize updates
        const allowedUpdates = ['name', 'phone'];
        const sanitizedUpdates: Record<string, any> = {};
        
        for (const [key, value] of Object.entries(updates)) {
            if (allowedUpdates.includes(key)) {
                sanitizedUpdates[key] = value;
            }
        }

        // Update user in database using the updateUser method
        await db.updateUser(user.id, sanitizedUpdates);

        // Get updated user data
        const updatedUser = await db.getUserById(user.id);
        if (!updatedUser) {
            throw new Error('User not found after update');
        }

        return NextResponse.json({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            phone: updatedUser.phone
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
