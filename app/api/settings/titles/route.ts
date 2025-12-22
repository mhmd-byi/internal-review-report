import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import ObservationTitle from '@/models/ObservationTitle';
import dbConnect from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
    await dbConnect();
    try {
        const titles = await ObservationTitle.find({}).sort({ title: 1 });
        return NextResponse.json(titles);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch titles' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const { title, area } = await request.json();
        if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

        const newTitle = await ObservationTitle.create({ title, area });
        return NextResponse.json(newTitle, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Title already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create title' }, { status: 500 });
    }
}
