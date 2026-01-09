'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Users, LogOut, PlusCircle, Clock, ChevronRight, Trash2, Edit, FileCheck } from 'lucide-react';
import { UserDropdown } from '@/components/UserDropdown';

interface ReportSummary {
    _id: string;
    schoolName: string;
    location: string;
    auditDate: string;
    createdAt: string;
    creatorName?: string;
}

export default function DashboardPage() {
    const sessionObj = useSession();
    const session = sessionObj?.data;
    const [recentReports, setRecentReports] = useState<ReportSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = () => {
        setLoading(true);
        fetch('/api/reports')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRecentReports(data.data.slice(0, 5)); // Show top 5
                }
            })
            .catch(err => console.error('Failed to fetch reports:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (session) {
            fetchReports();
        }
    }, [session]);

    const handleDeleteReport = async (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm(`Are you sure you want to delete report for "${name}"?`)) return;

        try {
            const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchReports();
            } else {
                alert('Failed to delete report');
            }
        } catch (err) {
            console.error('Error deleting report:', err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Welcome back, {session?.user?.name}</p>
                    </div>
                    {session?.user && <UserDropdown user={session.user} />}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Create Report Card */}
                    <Link href="/report" className="block group">
                        <Card className="h-full transition-all hover:shadow-lg hover:border-sky-500 cursor-pointer">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 group-hover:text-sky-600 transition-colors">
                                    <FileText className="w-5 h-5" /> Create Report
                                </CardTitle>
                                <CardDescription>Start a new Internal Review Report</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-sky-50 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-sky-100 transition-colors">
                                    <PlusCircle className="w-6 h-6 text-sky-600" />
                                </div>
                                <p className="text-sm text-slate-600">
                                    Access the observation template, add findings, and export to PDF.
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Admin: Manage Users */}
                    {session?.user?.role === 'admin' && (
                        <>
                            <Link href="/admin/users" className="block group">
                                <Card className="h-full transition-all hover:shadow-lg hover:border-purple-500 cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                                            <Users className="w-5 h-5" /> Manage Users
                                        </CardTitle>
                                        <CardDescription>Admin User Management</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-purple-50 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                                            <Users className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            Create new users, manage existing accounts, and assign roles.
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/admin/templates" className="block group">
                                <Card className="h-full transition-all hover:shadow-lg hover:border-indigo-500 cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                                            <FileText className="w-5 h-5" /> Manage Templates
                                        </CardTitle>
                                        <CardDescription>Observation Templates</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                                            <FileText className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            Add and edit observation templates for auto-population.
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/admin/reports" className="block group">
                                <Card className="h-full transition-all hover:shadow-lg hover:border-emerald-500 cursor-pointer">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                                            <FileCheck className="w-5 h-5" /> Review Reports
                                        </CardTitle>
                                        <CardDescription>Approve/Decline Reports</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-emerald-50 rounded-full w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                                            <FileCheck className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            Review and approve reports submitted by management.
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </>
                    )}
                </div>

                {/* Recent Reports Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-slate-500" /> Recent Reports
                    </h2>

                    {loading ? (
                        <p className="text-slate-500">Loading reports...</p>
                    ) : recentReports.length > 0 ? (
                        <div className="grid gap-4">
                            {recentReports.map((report) => (
                                <Link key={report._id} href={`/report?id=${report._id}`} className="block group">
                                    <Card className="hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-sky-500">
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                                                    {report.schoolName} - {report.location}
                                                </h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Audit Date: {new Date(report.auditDate).toLocaleDateString()}
                                                </p>
                                                {session?.user?.role === 'admin' && (
                                                    <p className="text-xs text-indigo-600 mt-0.5 font-medium">
                                                        Created by: {report.creatorName || 'User'}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-sky-600"
                                                    title="Edit Report"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600"
                                                    onClick={(e) => handleDeleteReport(e, report._id, report.schoolName)}
                                                    title="Delete Report"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-slate-50 border-dashed">
                            <CardContent className="p-8 text-center text-slate-500">
                                No reports found. Create your first report to see it here.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div >
        </div >
    );
}
