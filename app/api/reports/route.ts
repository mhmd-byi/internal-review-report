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

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let query = {};
        if (session.user.role !== 'admin' && session.user.responsibility) {
            query = { "observations.responsibility": session.user.responsibility };
        } else if (session.user.role !== 'admin') {
            // If not admin and no responsibility, perhaps show nothing or standard view. 
            // For now, let's restriction to nothing if they are a 'user' without responsibility, 
            // or maybe they shouldn't see anything. I'll act safe and show nothing if strict RBAC is desired, 
            // or just show nothing for now as per "reports responsible to principal... will be visible".
            // If they have NO responsibility, they see NO reports? Or all? 
            // Safest is to return empty if not admin and no responsibility match found (or explicitly querying for nothing).
            // Actually, implies that regular users ONLY see their responsible reports.
            return NextResponse.json({ success: true, data: [] });
        }

        const reports = await Report.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: reports });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
}
