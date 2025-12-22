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

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Check if report exists
        const existingReport = await Report.findById(id);
        if (!existingReport) {
            return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
        }

        // ROLE BASED ACCESS CONTROL
        if (session.user.role === 'management') {
            // Management user can only update specific fields (Management Response)
            // They cannot change Title, Observation, Recommendation, etc.

            // Check if assigned to them
            if (existingReport.assignedTo?.toString() !== session.user.id) {
                return NextResponse.json({ error: 'Unauthorized: Not assigned to this report' }, { status: 403 });
            }

            // Allow updates ONLY to observations' management fields
            // We need to iterate over provided observations and only update actionPlan, targetDate, status, responsibility
            // AND the top level fields? No, management shouldn't change header info usually.

            // Construct safe update object
            const safeUpdates: any = {
                // potentially status of report if we had one?
            };

            // If observations are passed, we merge them carefully
            if (body.observations && Array.isArray(body.observations)) {
                // Map existing observations to a dictionary for easy lookup
                const existingObsMap = new Map(existingReport.observations.map((o: any) => [o.id, o]));

                const updatedObs = body.observations.map((newObs: any) => {
                    const oldObs = existingObsMap.get(newObs.id);
                    if (!oldObs) return newObs; // Should strictly be existing ones? Assuming they can't add new.

                    return {
                        ...oldObs.toObject(), // Keep original
                        // Overwrite ONLY Management Fields
                        actionPlan: newObs.actionPlan,
                        targetDate: newObs.targetDate,
                        status: newObs.status,
                        responsibility: newObs.responsibility,
                    };
                });
                safeUpdates.observations = updatedObs;
            }

            const report = await Report.findByIdAndUpdate(id, safeUpdates, { new: true });
            return NextResponse.json({ success: true, data: report });

        } else if (session.user.role === 'admin') {
            // Admin can update everything
            const report = await Report.findByIdAndUpdate(id, body, { new: true });
            return NextResponse.json({ success: true, data: report });
        } else {
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }

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
