import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Report from '@/models/Report';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const report = await Report.findById(id);

        if (!report) {
            return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: report });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const report = await Report.findByIdAndDelete(id);

        if (!report) {
            return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Report deleted successfully' });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}
