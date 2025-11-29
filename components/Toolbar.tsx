'use client';

import React, { useState } from 'react';
import { useReport } from '@/components/ReportContext';
import { Button } from '@/components/ui/button';
import { Plus, Download, Save, Loader2 } from 'lucide-react';

export function Toolbar() {
    const { stats, location, addObservation, observations, schoolName, period, auditDate, preparedBy } = useReport();
    const [isSaving, setIsSaving] = useState(false);

    const handleExportPDF = async () => {
        alert("PDF Export is temporarily disabled for build verification.");
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const reportData = {
                schoolName,
                location,
                period,
                auditDate,
                preparedBy,
                observations
            };

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save report');
            }

            alert('Report saved successfully!');
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Failed to save report. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="sticky top-0 z-40 mb-6 p-3 bg-white/20 backdrop-blur-md border border-white/40 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-sky-900/95 text-white rounded-full text-xs font-semibold shadow-md border border-slate-900/20">
                    Observations: <span className="font-bold text-sm ml-1">{stats.total}</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-900/60 text-white rounded-full text-xs font-semibold border border-slate-900/20">
                    Location: <span className="ml-1">{location}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    onClick={addObservation}
                    className="rounded-full bg-sky-900 hover:bg-sky-800 text-white text-xs h-8"
                >
                    <Plus className="w-3 h-3 mr-1" /> Add Observation
                </Button>
                <Button
                    onClick={handleExportPDF}
                    className="rounded-full bg-sky-900 hover:bg-sky-800 text-white text-xs h-8"
                >
                    <Download className="w-3 h-3 mr-1" /> Export PDF
                </Button>
                <Button
                    variant="outline"
                    className="rounded-full text-xs h-8 bg-white/80 hover:bg-white"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                    {isSaving ? 'Saving...' : 'Save Draft'}
                </Button>
            </div>
        </div>
    );
}
