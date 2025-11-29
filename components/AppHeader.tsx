'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, User } from 'lucide-react';

export function AppHeader({ title }: { title?: string }) {
    const { data: session } = useSession();

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    {title && (
                        <>
                            <div className="h-6 w-px bg-slate-200" />
                            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {session?.user && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <User className="w-4 h-4" />
                            <span>{session.user.name}</span>
                        </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => signOut()} title="Logout">
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
