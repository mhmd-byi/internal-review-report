import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import ObservationTitle from '@/models/ObservationTitle';
import dbConnect from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();
    try {
        await ObservationTitle.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete title' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, area } = body;

    await dbConnect();
    try {
        const updatedTitle = await ObservationTitle.findByIdAndUpdate(
            id,
            { title, area },
            { new: true, runValidators: true }
        );

        if (!updatedTitle) {
            return NextResponse.json({ error: 'Title not found' }, { status: 404 });
        }

        return NextResponse.json(updatedTitle);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update title' }, { status: 500 });
    }
}
