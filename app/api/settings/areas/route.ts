import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Area from '@/models/Area';
import dbConnect from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    await dbConnect();
    try {
        const areas = await Area.find({}).sort({ name: 1 });
        return NextResponse.json(areas);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch areas' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const { name } = await request.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const newArea = await Area.create({ name });
        return NextResponse.json(newArea, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Area already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create area' }, { status: 500 });
    }
}
