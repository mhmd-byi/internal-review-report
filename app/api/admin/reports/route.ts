import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Report from '@/models/Report';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        // Fetch reports for admin review (sent to management, submitted, or declined)
        const reports = await Report.find({
            workflowStatus: { $in: ['Sent to Management', 'Submitted by Management', 'Declined', 'Approved'] }
        })
            .sort({ submittedAt: -1, createdAt: -1 })
            .select('schoolName location assignedToName submittedAt workflowStatus observations createdAt period auditDate');

        // Add observation count to each report
        const reportsWithCount = reports.map(report => ({
            ...report.toObject(),
            observationsCount: report.observations.filter((obs: any) => !obs.isNA).length
        }));

        return NextResponse.json({ success: true, data: reportsWithCount });
    } catch (error: unknown) {
        console.error('Error fetching admin reports:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
