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

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Add creator information
        const templateData = {
            ...body,
            createdBy: session.user.id,
            creatorName: session.user.name || session.user.email
        };

        const template = await Template.create(templateData);
        return NextResponse.json({ success: true, data: template }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}
