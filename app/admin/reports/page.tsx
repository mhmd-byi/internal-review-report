'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ReportListItem {
    _id: string;
    schoolName: string;
    location: string;
    assignedToName: string;
    submittedAt: string;
    workflowStatus: string;
    observationsCount: number;
    createdAt: string;
}

export default function AdminReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reports, setReports] = useState<ReportListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'submitted' | 'declined'>('all');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/reports');
            const data = await res.json();

            if (data.success) {
                setReports(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewReport = (reportId: string) => {
        router.push(`/admin/reports/${reportId}`);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (session?.user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-slate-50">
                <AppHeader title="Reports Review" />
                <div className="p-8 text-center text-red-500">
                    Access Denied. Admin access required.
                </div>
            </div>
        );
    }

    const filteredReports = reports.filter(report => {
        if (filter === 'submitted') return report.workflowStatus === 'Submitted by Management';
        if (filter === 'declined') return report.workflowStatus === 'Declined';
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <AppHeader title="Reports Review" />

            <div className="p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Reports Review
                    </h1>
                    <p className="text-slate-500">
                        Review and approve reports submitted by management
                    </p>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    <Button
                        size="sm"
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className={filter === 'all' ? 'bg-indigo-600' : ''}
                    >
                        All ({reports.length})
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'submitted' ? 'default' : 'outline'}
                        onClick={() => setFilter('submitted')}
                        className={filter === 'submitted' ? 'bg-indigo-600' : ''}
                    >
                        Pending Review ({reports.filter(r => r.workflowStatus === 'Submitted by Management').length})
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'declined' ? 'default' : 'outline'}
                        onClick={() => setFilter('declined')}
                        className={filter === 'declined' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                    >
                        Declined ({reports.filter(r => r.workflowStatus === 'Declined').length})
                    </Button>
                </div>

                {/* Reports Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : filteredReports.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-slate-500">No reports found matching this filter.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        School
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Assigned To
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Observations
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Submitted
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredReports.map((report) => (
                                    <tr key={report._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                            {report.schoolName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {report.location}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {report.assignedToName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                                                {report.observationsCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(report.submittedAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {report.workflowStatus === 'Submitted by Management' && (
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Pending Review
                                                </span>
                                            )}
                                            {report.workflowStatus === 'Declined' && (
                                                <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                                                    <XCircle className="w-3 h-3" />
                                                    Declined
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewReport(report._id)}
                                                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Review
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
