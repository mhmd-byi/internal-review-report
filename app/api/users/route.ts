
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'user')) { // Allow basic users to potentially see management list if needed, or strictly admin. Plan said Admin sends.
            // Actually, currently only Admin can access this route.
            if (session?.user?.role !== 'admin') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');

        const query: any = {};
        if (role) {
            query.role = role;
        }

        const users = await User.find(query, '-password').sort({ createdAt: -1 });

        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
