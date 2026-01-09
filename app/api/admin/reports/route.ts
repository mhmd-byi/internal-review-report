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

        // Fetch submitted reports for admin review
        const reports = await Report.find({
            workflowStatus: { $in: ['Submitted by Management', 'Declined'] }
        })
            .sort({ submittedAt: -1 })
            .select('schoolName location assignedToName submittedAt workflowStatus observations createdAt');

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
