import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { name, email, phone, itsId, password, role, responsibility } = await request.json();

        if (!name || !email || !phone || !itsId || !password) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            phone,
            itsId,
            password: hashedPassword,
            role: role || 'user',
            responsibility: responsibility || '',
        });

        return NextResponse.json(
            { success: true, data: { name: user.name, email: user.email, role: user.role } },
            { status: 201 }
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
