'use client';

import React from 'react';
import { useReport } from '@/components/ReportContext';
import { cn } from '@/lib/utils';

// Standard Area Order
const AREA_ORDER = [
    'INTERNAL CONTROLS AND FINANCIAL MANAGEMENT',
    'REVENUE & INCOME RECOGNITION',
    'EXPENSES & COST MANAGEMENT',
    'FIXED ASSETS',
    'LEGAL AND STATUTORY COMPLIANCE',
    'Other'
];

// Area Background Colors
const AREA_BG: Record<string, string> = {
    'INTERNAL CONTROLS AND FINANCIAL MANAGEMENT': 'bg-sky-100',
    'REVENUE & INCOME RECOGNITION': 'bg-orange-50',
    'EXPENSES & COST MANAGEMENT': 'bg-sky-50',
    'FIXED ASSETS': 'bg-emerald-50',
    'LEGAL AND STATUTORY COMPLIANCE': 'bg-red-50',
    'Other': 'bg-slate-100'
};

export function PrintSummary() {
    const { observations } = useReport();

    // Group observations logic
    const groupedObs: Record<string, typeof observations> = {};
    observations.forEach(obs => {
        if (obs.isNA) return; // Skip N/A in summary
        const area = obs.area && obs.area.trim() !== '' ? obs.area : 'Other';
        if (!groupedObs[area]) groupedObs[area] = [];
        groupedObs[area].push(obs);
    });

    const sortedAreas = Object.keys(groupedObs).sort((a, b) => {
        const idxA = AREA_ORDER.findIndex(order => order.toLowerCase() === a.toLowerCase());
        const idxB = AREA_ORDER.findIndex(order => order.toLowerCase() === b.toLowerCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    if (sortedAreas.length === 0) return null;

    return (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:mb-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 print:text-sm print:mb-2">Observation Summary</h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-100 text-slate-700">
                            <th className="border border-slate-200 p-2 text-left w-[8%]">No.</th>
                            <th className="border border-slate-200 p-2 text-left w-[35%]">Observation Title</th>
                            <th className="border border-slate-200 p-2 text-left w-[12%]">Risk</th>
                            <th className="border border-slate-200 p-2 text-left">Recommendation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAreas.map((area, areaIdx) => (
                            <React.Fragment key={area}>
                                {/* Area Header Row */}
                                <tr className={cn("font-bold text-slate-800 uppercase tracking-wider", AREA_BG[area] || 'bg-slate-100')}>
                                    <td colSpan={4} className="border border-slate-300 p-2 text-[10px]">
                                        {area}
                                    </td>
                                </tr>
                                {/* Rows */}
                                {groupedObs[area].map((obs, obsIdx) => (
                                    <tr key={obs.id} className="hover:bg-slate-50">
                                        <td className="border border-slate-200 p-2 text-center text-slate-500 font-mono">
                                            {areaIdx + 1}.{obsIdx + 1}
                                        </td>
                                        <td className="border border-slate-200 p-2 font-medium text-slate-800">
                                            {obs.title || 'Untitled'}
                                        </td>
                                        <td className={cn("border border-slate-200 p-2 font-bold text-center",
                                            obs.risk === 'High' ? 'bg-red-50 text-red-700' :
                                                obs.risk === 'Medium' ? 'bg-yellow-50 text-yellow-700' :
                                                    'bg-green-50 text-green-700'
                                        )}>
                                            {obs.risk}
                                        </td>
                                        <td className="border border-slate-200 p-2 text-slate-600 leading-relaxed">
                                            {obs.recommendation ? (
                                                <>
                                                    {obs.recommendation.slice(0, 230)}
                                                    {obs.recommendation.length > 230 && '...'}
                                                </>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
