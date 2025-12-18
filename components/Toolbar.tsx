'use client';

import React, { useState } from 'react';
import { useReport } from '@/components/ReportContext';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, Download, Save, Loader2, ChevronsDown, ChevronsUp } from 'lucide-react';

// Standard Area Order (Match ObservationList)
const AREA_ORDER = [
    'INTERNAL CONTROLS AND FINANCIAL MANAGEMENT',
    'REVENUE & INCOME RECOGNITION',
    'EXPENSES & COST MANAGEMENT',
    'FIXED ASSETS',
    'LEGAL AND STATUTORY COMPLIANCE',
    'Other'
];

export function Toolbar() {
    const { stats, location, addObservation, observations, schoolName, period, auditDate, preparedBy } = useReport();
    const [isSaving, setIsSaving] = useState(false);

    // Calculate available areas for Jump To
    const uniqueAreas = Array.from(new Set(observations.map(obs => obs.area && obs.area.trim() !== '' ? obs.area : 'Other')));
    const sortedAreas = uniqueAreas.sort((a, b) => {
        const idxA = AREA_ORDER.findIndex(order => order.toLowerCase() === a.toLowerCase());
        const idxB = AREA_ORDER.findIndex(order => order.toLowerCase() === b.toLowerCase());

        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    const handleJumpTo = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const areaName = e.target.value;
        if (!areaName) return;

        // Find index in sorted list to match ID
        const idx = sortedAreas.indexOf(areaName);
        if (idx !== -1) {
            const el = document.getElementById(`area-${idx}`);
            if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 100; // Offset for sticky header
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    };

    const toggleCollapseAll = (collapsed: boolean) => {
        window.dispatchEvent(new Event(collapsed ? 'report:collapse-all' : 'report:expand-all'));
    };

    const handleExportPDF = async () => {
        alert("To export as PDF, please use the browser's Print feature (Ctrl+P) and select 'Save as PDF'. The layout is optimized for A4.");
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
        <div className="sticky top-[70px] z-40 mb-8 p-2 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 print:hidden transition-all">
            {/* Stats Pills */}
            <div className="flex items-center gap-2 pl-2">
                <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Obs: {stats.total}
                </div>
                <div className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-100 hidden sm:flex items-center gap-1">
                    High: {stats.high}
                </div>
            </div>

            {/* Middle Controls: Jump & Collapse */}
            <div className="flex items-center gap-2 flex-1 justify-center">
                {/* Jump To Dropdown */}
                {sortedAreas.length > 0 && (
                    <div className="hidden md:block w-[200px]">
                        <Select onChange={handleJumpTo} className="h-8 text-xs bg-white border-slate-300">
                            <option value="">Jump to Area...</option>
                            {sortedAreas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </Select>
                    </div>
                )}

                {/* Collapse Controls */}
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                        onClick={() => toggleCollapseAll(false)}
                        className="p-1.5 hover:bg-white rounded-md text-slate-600 hover:text-indigo-600 hover:shadow-sm transition-all"
                        title="Expand All"
                    >
                        <ChevronsDown size={14} />
                    </button>
                    <div className="w-px bg-slate-300 my-1 mx-0.5"></div>
                    <button
                        onClick={() => toggleCollapseAll(true)}
                        className="p-1.5 hover:bg-white rounded-md text-slate-600 hover:text-indigo-600 hover:shadow-sm transition-all"
                        title="Collapse All"
                    >
                        <ChevronsUp size={14} />
                    </button>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 pr-1">
                <Button
                    onClick={addObservation}
                    size="sm"
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 shadow-sm hover:shadow"
                >
                    <Plus className="w-3 h-3 mr-1" /> <span className="hidden sm:inline">Add</span>
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-8 text-xs bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    onClick={handleExportPDF}
                >
                    <Download className="w-3 h-3 mr-1" /> <span className="hidden sm:inline">Print/PDF</span>
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                    onClick={handleSave}
                    disabled={isSaving}
                    title="Save Draft"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    );
}
