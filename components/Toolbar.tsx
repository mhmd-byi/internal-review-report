'use client';

import React from 'react';
import { useReport } from '@/components/ReportContext';
import { Button } from '@/components/ui/button';
import { Plus, Download, Save } from 'lucide-react';
// import html2pdf from 'html2pdf.js'; // We will import dynamically or use a wrapper

export function Toolbar() {
    const { stats, location, addObservation } = useReport();

    const handleExportPDF = async () => {
        // Dynamic import to avoid SSR issues
        // const html2pdf = (await import('html2pdf.js')).default;
        // const element = document.getElementById('report-container');
        // const opt = {
        //   margin: 10,
        //   filename: `Internal_Review_${location}_${new Date().toISOString().split('T')[0]}.pdf`,
        //   image: { type: 'jpeg', quality: 0.98 },
        //   html2canvas: { scale: 2 },
        //   jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        // };
        // html2pdf().set(opt).from(element).save();
        alert("PDF Export is temporarily disabled for build verification.");
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
                {/* Placeholders for other actions */}
                <Button variant="outline" className="rounded-full text-xs h-8 bg-white/80 hover:bg-white">
                    <Save className="w-3 h-3 mr-1" /> Save Draft
                </Button>
            </div>
        </div>
    );
}
