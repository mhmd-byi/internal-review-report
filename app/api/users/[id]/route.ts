
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, email, phone, itsId, role, responsibility, password } = body;

        await dbConnect();

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.itsId = itsId || user.itsId;
        user.role = role || user.role;
        user.responsibility = responsibility || user.responsibility;

        if (password && password.length >= 6) {
            const hashedPassword = await bcrypt.hash(password, 12);
            user.password = hashedPassword;
        }

        await user.save();

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Prevent self-deletion
        if (id === session.user.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        await dbConnect();
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
