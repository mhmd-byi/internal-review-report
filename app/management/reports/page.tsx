'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Loader2, CheckCircle, XCircle, Clock, FileCheck } from 'lucide-react';

interface ReportListItem {
    _id: string;
    schoolName: string;
    location: string;
    assignedToName: string;
    submittedAt?: string;
    workflowStatus: string;
    observationsCount: number;
    createdAt: string;
    auditDate: string;
    period?: string;
}

export default function ManagementReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reports, setReports] = useState<ReportListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

    useEffect(() => {
        if (session?.user?.role === 'management') {
            fetchReports();
        }
    }, [session]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/reports');
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
        router.push(`/report?id=${reportId}`);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (session?.user?.role !== 'management') {
        return (
            <div className="min-h-screen bg-slate-50">
                <AppHeader title="My Assigned Reports" />
                <div className="p-8 text-center text-red-500">
                    Access Denied. Management access required.
                </div>
            </div>
        );
    }

    const filteredReports = reports.filter(report => {
        if (filter === 'pending') return report.workflowStatus === 'Draft' || report.workflowStatus === 'Submitted by Management';
        if (filter === 'approved') return report.workflowStatus === 'Approved';
        if (filter === 'declined') return report.workflowStatus === 'Declined';
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Draft':
                return (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        Draft
                    </span>
                );
            case 'Submitted by Management':
                return (
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        Pending Review
                    </span>
                );
            case 'Approved':
                return (
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                    </span>
                );
            case 'Declined':
                return (
                    <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" />
                        Declined
                    </span>
                );
            default:
                return <span className="text-xs text-slate-500">{status}</span>;
        }
    };

    const pendingCount = reports.filter(r => r.workflowStatus === 'Draft' || r.workflowStatus === 'Submitted by Management').length;
    const approvedCount = reports.filter(r => r.workflowStatus === 'Approved').length;
    const declinedCount = reports.filter(r => r.workflowStatus === 'Declined').length;

    return (
        <div className="min-h-screen bg-slate-50">
            <AppHeader title="My Assigned Reports" />

            <div className="p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        My Assigned Reports
                    </h1>
                    <p className="text-slate-500">
                        View and manage reports assigned to you for review
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Reports</div>
                            <div className="text-2xl font-bold text-slate-900">{reports.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-blue-600 uppercase font-semibold mb-1">Pending</div>
                            <div className="text-2xl font-bold text-blue-700">{pendingCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-green-600 uppercase font-semibold mb-1">Approved</div>
                            <div className="text-2xl font-bold text-green-700">{approvedCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-xs text-orange-600 uppercase font-semibold mb-1">Declined</div>
                            <div className="text-2xl font-bold text-orange-700">{declinedCount}</div>
                        </CardContent>
                    </Card>
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
                        variant={filter === 'pending' ? 'default' : 'outline'}
                        onClick={() => setFilter('pending')}
                        className={filter === 'pending' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                        Pending ({pendingCount})
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'approved' ? 'default' : 'outline'}
                        onClick={() => setFilter('approved')}
                        className={filter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        Approved ({approvedCount})
                    </Button>
                    <Button
                        size="sm"
                        variant={filter === 'declined' ? 'default' : 'outline'}
                        onClick={() => setFilter('declined')}
                        className={filter === 'declined' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                    >
                        Declined ({declinedCount})
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
                            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg font-medium mb-2">No reports found</p>
                            <p className="text-slate-400 text-sm">
                                {filter === 'all'
                                    ? 'You have no assigned reports yet.'
                                    : `No reports with status: ${filter}`}
                            </p>
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
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Observations
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Audit Date
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
                                            {report.period || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                                                {report.observationsCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(report.auditDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(report.workflowStatus)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewReport(report._id)}
                                                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
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
