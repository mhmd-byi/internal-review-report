import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Report from '@/models/Report';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const reportData = {
            ...body,
            createdBy: session.user.id,
            creatorName: session.user.name
        };

        const report = await Report.create(reportData);
        return NextResponse.json({ success: true, data: report }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const isDraftParam = searchParams.get('isDraft');

        let query: any = {};
        if (session.user.role === 'admin') {
            // Admin sees all, but can filter by isDraft
            if (isDraftParam !== null) {
                query.isDraft = isDraftParam === 'true';
            }
        } else if (session.user.role === 'management') {
            // Management sees assigned reports
            query = { assignedTo: session.user.id };
            if (isDraftParam !== null) {
                query.isDraft = isDraftParam === 'true';
            }
        } else if (session.user.responsibility) {
            // Regular user responsible for specific area (legacy logic, keep if needed)
            query = { "observations.responsibility": session.user.responsibility };
            if (isDraftParam !== null) {
                query.isDraft = isDraftParam === 'true';
            }
        } else {
            return NextResponse.json({ success: true, data: [] });
        }

        const reports = await Report.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: reports });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}
