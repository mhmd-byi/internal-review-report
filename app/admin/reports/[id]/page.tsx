'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, ArrowLeft, FileText } from 'lucide-react';
import { IReport } from '@/models/Report';

export default function AdminReportDetailPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const reportId = params.id as string;

    const [report, setReport] = useState<IReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminReviewNotes, setAdminReviewNotes] = useState('');
    const [declineReason, setDeclineReason] = useState('');
    const [showDeclineForm, setShowDeclineForm] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [reportId]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/reports/${reportId}`);
            const data = await res.json();

            if (data.success) {
                setReport(data.data);
                setAdminReviewNotes(data.data.adminReviewNotes || '');
                setDeclineReason(data.data.declineReason || '');
            }
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this report?')) return;

        try {
            setActionLoading(true);
            const res = await fetch(`/api/admin/reports/${reportId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminReviewNotes }),
            });

            const data = await res.json();

            if (data.success) {
                alert('Report approved successfully!');
                router.push('/admin/reports');
            } else {
                alert(data.error || 'Failed to approve report');
            }
        } catch (error) {
            console.error('Error approving report:', error);
            alert('Failed to approve report');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDecline = async () => {
        if (!declineReason.trim()) {
            alert('Please provide a reason for declining');
            return;
        }

        if (!confirm('Are you sure you want to decline this report? It will be sent back to management.')) return;

        try {
            setActionLoading(true);
            const res = await fetch(`/api/admin/reports/${reportId}/decline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ declineReason, adminReviewNotes }),
            });

            const data = await res.json();

            if (data.success) {
                alert('Report declined and sent back to management');
                router.push('/admin/reports');
            } else {
                alert(data.error || 'Failed to decline report');
            }
        } catch (error) {
            console.error('Error declining report:', error);
            alert('Failed to decline report');
        } finally {
            setActionLoading(false);
        }
    };

    if (session?.user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!report) {
        return <div className="p-8 text-center">Report not found</div>;
    }

    const activeObservations = report.observations.filter(obs => !obs.isNA);

    return (
        <div className="min-h-screen bg-slate-50">
            <AppHeader title="Review Report" />

            <div className="p-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/admin/reports')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Reports
                    </Button>

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-slate-900">{report.schoolName}</h1>
                        <p className="text-sm text-slate-500">
                            {report.location} • Submitted {new Date(report.submittedAt!).toLocaleDateString()}
                        </p>
                    </div>

                    {report.workflowStatus === 'Submitted by Management' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            Pending Review
                        </span>
                    )}
                    {report.workflowStatus === 'Declined' && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                            Declined
                        </span>
                    )}
                </div>

                {/* Report Summary */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-xs text-slate-500 uppercase font-semibold">Observations</div>
                                <div className="text-2xl font-bold text-slate-900">{activeObservations.length}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase font-semibold">Assigned To</div>
                                <div className="text-lg font-semibold text-slate-900">{report.assignedToName}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase font-semibold">Period</div>
                                <div className="text-lg font-semibold text-slate-900">{report.period}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase font-semibold">Audit Date</div>
                                <div className="text-lg font-semibold text-slate-900">
                                    {new Date(report.auditDate).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Observations Preview */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Observations Summary
                        </h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {activeObservations.map((obs, idx) => (
                                <div key={obs.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-start gap-3">
                                        <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-slate-900">{obs.title}</h4>
                                                <span className={`px-2 py-0.5 text-[10px] uppercase rounded-full font-bold ${obs.risk === 'High' ? 'bg-red-100 text-red-700' :
                                                        obs.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                    }`}>
                                                    {obs.risk}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-600 space-y-1">
                                                <div><span className="font-semibold">Area:</span> {obs.area}</div>
                                                {obs.actionPlan && (
                                                    <div><span className="font-semibold">Action Plan:</span> {obs.actionPlan}</div>
                                                )}
                                                {obs.responsibility && (
                                                    <div><span className="font-semibold">Responsibility:</span> {obs.responsibility}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Admin Review Form */}
                {(report.workflowStatus === 'Submitted by Management' || report.workflowStatus === 'Declined') && (
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Admin Review</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Review Notes (Optional)
                                    </label>
                                    <Textarea
                                        value={adminReviewNotes}
                                        onChange={(e) => setAdminReviewNotes(e.target.value)}
                                        placeholder="Add any notes or feedback about this report..."
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {showDeclineForm && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Decline Reason <span className="text-red-600">*</span>
                                        </label>
                                        <Textarea
                                            value={declineReason}
                                            onChange={(e) => setDeclineReason(e.target.value)}
                                            placeholder="Explain why this report is being declined..."
                                            className="min-h-[100px] border-red-200 focus:border-red-400"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    {!showDeclineForm ? (
                                        <>
                                            <Button
                                                onClick={handleApprove}
                                                disabled={actionLoading}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {actionLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                )}
                                                Approve Report
                                            </Button>
                                            <Button
                                                onClick={() => setShowDeclineForm(true)}
                                                variant="outline"
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Decline Report
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleDecline}
                                                disabled={actionLoading || !declineReason.trim()}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                {actionLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                )}
                                                Confirm Decline
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setShowDeclineForm(false);
                                                    setDeclineReason('');
                                                }}
                                                variant="outline"
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Previous Decline Info */}
                {report.declineReason && report.workflowStatus === 'Declined' && (
                    <Card className="mb-6 border-orange-200">
                        <CardContent className="p-6 bg-orange-50">
                            <h3 className="text-lg font-bold text-orange-900 mb-2">Previous Decline Reason</h3>
                            <p className="text-sm text-orange-800">{report.declineReason}</p>
                            {report.reviewedByName && (
                                <p className="text-xs text-orange-600 mt-2">
                                    Declined by {report.reviewedByName} on {new Date(report.reviewedAt!).toLocaleDateString()}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
