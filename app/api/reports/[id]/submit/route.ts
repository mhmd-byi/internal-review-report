import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Report from '@/models/Report';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Find the report
        const report = await Report.findById(id);

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        // Check if user is assigned to this report
        if (report.assignedTo?.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Not authorized to submit this report' }, { status: 403 });
        }

        // Check if report is in correct state
        if (report.workflowStatus !== 'Sent to Management' && report.workflowStatus !== 'Declined') {
            return NextResponse.json({
                error: `Cannot submit report from ${report.workflowStatus} state`
            }, { status: 400 });
        }

        // Update report status to submitted
        report.workflowStatus = 'Submitted by Management';
        report.submittedAt = new Date();

        await report.save();

        return NextResponse.json({
            success: true,
            data: report,
            message: 'Report submitted successfully for admin review'
        });
    } catch (error: unknown) {
        console.error('Error submitting report:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
