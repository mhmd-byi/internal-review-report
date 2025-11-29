'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Users, LogOut, PlusCircle } from 'lucide-react';

export default function DashboardPage() {
    const sessionObj = useSession();
    const session = sessionObj?.data;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Welcome back, {session?.user?.name}</p>
                    </div>
                    <Button variant="outline" onClick={() => signOut()} className="gap-2">
                        <LogOut className="w-4 h-4" /> Logout
                    </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    )}

                    {/* Placeholder for future features */}
                    <Card className="h-full opacity-50 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-slate-400">Recent Reports</CardTitle>
                            <CardDescription>Coming Soon</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400">
                                View and edit previously saved reports.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
