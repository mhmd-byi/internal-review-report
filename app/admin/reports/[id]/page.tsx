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
import { formatDDMMYYYY } from '@/utils/dates';

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
                            {report.location} • Submitted {formatDDMMYYYY(report.submittedAt)}
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
                                    {formatDDMMYYYY(report.auditDate)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Full Report Details */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-4">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Full Report Details
                        </h3>
                        <div className="space-y-8">
                            {activeObservations.map((obs, idx) => (
                                <div key={obs.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    {/* Observation Header */}
                                    <div className={`p-4 flex items-center justify-between ${obs.risk === 'High' ? 'bg-red-50 border-b border-red-100' :
                                        obs.risk === 'Medium' ? 'bg-yellow-50 border-b border-yellow-100' :
                                            'bg-green-50 border-b border-green-100'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 text-sm font-bold text-slate-700 shadow-sm">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{obs.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                                        {obs.area}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className={`px-2 py-0.5 text-[10px] uppercase rounded-full font-bold ${obs.risk === 'High' ? 'bg-red-100 text-red-700' :
                                                        obs.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                        {obs.risk} Risk
                                                    </span>
                                                    {obs.type === 'Financial' && (
                                                        <>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="px-2 py-0.5 text-[10px] uppercase rounded-full font-bold bg-blue-100 text-blue-700">
                                                                Financial (₹{obs.financialImpact || 0})
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${obs.status === 'Closed' ? 'bg-green-100 text-green-800 border-green-200' :
                                                obs.status === 'In-Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    'bg-slate-100 text-slate-800 border-slate-200'
                                                }`}>
                                                {obs.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Observation Content */}
                                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Background</h5>
                                                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                                    {obs.background || 'No background information provided.'}
                                                </p>
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Observation</h5>
                                                <p className="text-sm text-slate-900 leading-relaxed font-medium">
                                                    {obs.observation || 'No observation details provided.'}
                                                </p>
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommendation</h5>
                                                <p className="text-sm text-indigo-900 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                                    {obs.recommendation || 'No recommendation provided.'}
                                                </p>
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Implication</h5>
                                                <p className="text-sm text-red-900 leading-relaxed bg-red-50/30 p-3 rounded-lg border border-red-100/50">
                                                    {obs.implication || 'No implication provided.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Management Response Section */}
                                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                            <h5 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                                                Management Response
                                            </h5>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Action Plan</label>
                                                    <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">
                                                        {obs.actionPlan || 'No action plan provided.'}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Date</label>
                                                        <p className="text-sm text-slate-800">
                                                            {formatDDMMYYYY(obs.targetDate)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Responsibility</label>
                                                        <p className="text-sm text-slate-800 font-bold">{obs.responsibility || 'N/A'}</p>
                                                        {obs.responsibilityPersonName && (
                                                            <div className="mt-1">
                                                                <label className="text-[9px] font-bold text-slate-400 uppercase block">Name</label>
                                                                <p className="text-xs text-slate-700">{obs.responsibilityPersonName}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {obs.reviewerNotes && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                                        <label className="text-[10px] font-bold text-orange-600 uppercase block mb-1">Management Notes for Auditor</label>
                                                        <p className="text-sm text-slate-700 bg-orange-50 p-3 rounded-lg border border-orange-100 italic font-medium whitespace-pre-wrap">
                                                            {obs.reviewerNotes}
                                                        </p>
                                                    </div>
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
                                    Declined by {report.reviewedByName} on {formatDDMMYYYY(report.reviewedAt)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
