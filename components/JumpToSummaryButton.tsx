'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ChevronUp } from 'lucide-react';

export function JumpToSummaryButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show button when user scrolls down past the summary section
            const summaryElement = document.getElementById('observation-summary');
            if (summaryElement) {
                const summaryBottom = summaryElement.getBoundingClientRect().bottom;
                setIsVisible(summaryBottom < 0);
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

    if (!isVisible) return null;

    return (
        <Button
            onClick={scrollToSummary}
            className="fixed bottom-8 right-8 z-50 shadow-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-3 rounded-full flex items-center gap-2 print:hidden transition-all duration-300 hover:scale-105"
            title="Jump to Summary"
        >
            <ChevronUp className="w-5 h-5" />
            <FileText className="w-5 h-5" />
            <span className="font-semibold">Jump to Summary</span>
        </Button>
    );
}
