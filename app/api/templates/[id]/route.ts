import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Template from '@/models/Template';
import { authOptions } from '../../auth/[...nextauth]/route';

// PUT: Update a template
export async function PUT(
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
        const body = await request.json();
        const updatedTemplate = await Template.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!updatedTemplate) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedTemplate });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to update template' }, { status: 500 });
    }
}

// DELETE: Remove a template
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
        const deletedTemplate = await Template.findByIdAndDelete(id);

        if (!deletedTemplate) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Template deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to delete template' }, { status: 500 });
    }
}
