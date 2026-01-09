import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Report from '@/models/Report';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { adminReviewNotes } = body;

        // Find the report
        const report = await Report.findById(id);

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        // Check if report is in correct state
        if (report.workflowStatus !== 'Submitted by Management' && report.workflowStatus !== 'Declined') {
            return NextResponse.json({
                error: `Cannot approve report from ${report.workflowStatus} state`
            }, { status: 400 });
        }

        // Update report status to approved
        report.workflowStatus = 'Approved';
        report.reviewedBy = new mongoose.Types.ObjectId(session.user.id) as any;
        report.reviewedByName = session.user.name || '';
        report.reviewedAt = new Date();
        report.adminReviewNotes = adminReviewNotes || '';
        report.declineReason = ''; // Clear any previous decline reason

        await report.save();

        return NextResponse.json({
            success: true,
            data: report,
            message: 'Report approved successfully'
        });
    } catch (error: unknown) {
        console.error('Error approving report:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
