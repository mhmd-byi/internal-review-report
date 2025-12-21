'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { User, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserDropdownProps {
    user: {
        name?: string | null;
        email?: string | null;
    };
}

export function UserDropdown({ user }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                className="flex items-center gap-2 text-sm text-slate-700 hover:text-sky-700 transition-colors focus:outline-none p-1 rounded-md hover:bg-slate-50"
            >
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center border border-sky-200 text-sky-700">
                    <User className="w-4 h-4" />
                </div>
                <span className="font-medium hidden sm:inline-block">{user.name || 'User'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="p-1">
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-sky-700 rounded-md transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserCircle className="w-4 h-4" />
                            My Profile
                        </Link>

                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors text-left"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
