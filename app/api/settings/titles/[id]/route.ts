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

    // Await params before using
    const { id } = await params;

    await dbConnect();
    try {
        await ObservationTitle.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete title' }, { status: 500 });
    }
}
