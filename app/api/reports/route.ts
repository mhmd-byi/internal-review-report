import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Report from '@/models/Report';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const report = await Report.create(body);
        return NextResponse.json({ success: true, data: report }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const reports = await Report.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: reports });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}
