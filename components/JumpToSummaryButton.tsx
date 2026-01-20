'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ChevronUp } from 'lucide-react';

export function JumpToSummaryButton() {
    const [showSummaryButton, setShowSummaryButton] = useState(false);
    const [showDashboardButton, setShowDashboardButton] = useState(true); // Show by default

    useEffect(() => {
        const handleScroll = () => {
            const summaryElement = document.getElementById('observation-summary');
            const dashboardElement = document.getElementById('analytics-dashboard');

            // SUMMARY BUTTON: Show only when scrolled past the summary section
            if (summaryElement) {
                const summaryRect = summaryElement.getBoundingClientRect();
                const isPastSummary = summaryRect.bottom < 0;
                setShowSummaryButton(isPastSummary);
            }

            // DASHBOARD BUTTON: Hide only when dashboard is visible in viewport
            if (dashboardElement) {
                const dashboardRect = dashboardElement.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                // Dashboard is visible if its top is in viewport and not scrolled past
                const isDashboardVisible = dashboardRect.top < windowHeight && dashboardRect.bottom > 0;

                setShowDashboardButton(!isDashboardVisible);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on mount

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSummary = () => {
        const summaryElement = document.getElementById('observation-summary');
        if (summaryElement) {
            summaryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const scrollToDashboard = () => {
        const dashboardElement = document.getElementById('analytics-dashboard');
        if (dashboardElement) {
            dashboardElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Don't show container if both buttons are hidden
    if (!showSummaryButton && !showDashboardButton) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 print:hidden">
            {/* Jump to Dashboard Button */}
            {showDashboardButton && (
                <Button
                    onClick={scrollToDashboard}
                    className="shadow-2xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-3 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105"
                    title="Jump to Analytics Dashboard"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-semibold">Dashboard</span>
                </Button>
            )}

            {/* Jump to Summary Button */}
            {showSummaryButton && (
                <Button
                    onClick={scrollToSummary}
                    className="shadow-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-3 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105"
                    title="Jump to Summary"
                >
                    <ChevronUp className="w-5 h-5" />
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold">Summary</span>
                </Button>
            )}
        </div>
    );
}
