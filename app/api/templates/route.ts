import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Template from '@/models/Template';

export async function GET() {
    try {
        await dbConnect();
        const templates = await Template.find({}).sort({ area: 1, title: 1 });
        return NextResponse.json({ success: true, data: templates });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const template = await Template.create(body);
        return NextResponse.json({ success: true, data: template }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}
