'use client';

import React from 'react';
import { useReport } from '@/components/ReportContext';
import { ObservationCard } from '@/components/ObservationCard';

// Define standard area order
const AREA_ORDER = [
    'INTERNAL CONTROLS AND FINANCIAL MANAGEMENT',
    'REVENUE & INCOME RECOGNITION',
    'EXPENSES & COST MANAGEMENT',
    'FIXED ASSETS',
    'LEGAL AND STATUTORY COMPLIANCE',
    'Other'
];

export function ObservationList() {
    const { observations } = useReport();

    // Group observations by Area
    const groupedObs: Record<string, typeof observations> = {};
    observations.forEach(obs => {
        const area = obs.area && obs.area.trim() !== '' ? obs.area : 'Other';
        if (!groupedObs[area]) groupedObs[area] = [];
        groupedObs[area].push(obs);
    });

    // Sort areas based on configuration, then others alphabetically
    const sortedAreas = Object.keys(groupedObs).sort((a, b) => {
        const idxA = AREA_ORDER.findIndex(order => order.toLowerCase() === a.toLowerCase());
        const idxB = AREA_ORDER.findIndex(order => order.toLowerCase() === b.toLowerCase());

        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        // Known areas come BEFORE unknown areas
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;

        // If both unknown, sort alphabetically
        return a.localeCompare(b);
    });

    return (
        <div className="space-y-8">
            <hr className="border-t-2 border-slate-200 my-6 print:hidden" />

            <div id="obsContainer">
                {sortedAreas.map((area, areaIdx) => (
                    <div key={area} id={`area-${areaIdx}`} className="mb-8 p-4 bg-white/50 rounded-2xl border border-white/60 shadow-sm print:shadow-none print:border-none print:p-0 print:bg-transparent">
                        <div className="mb-4 pb-2 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 uppercase tracking-widest pl-2 border-l-4 border-indigo-500">
                                {areaIdx + 1}. {area}
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {(() => {
                                let validObsCount = 0;
                                return groupedObs[area].map((obs) => {
                                    const displayNum = obs.isNA ? 'N/A' : `${areaIdx + 1}.${++validObsCount}`;
                                    return (
                                        <ObservationCard
                                            key={obs.id}
                                            observation={obs}
                                            obsNumber={displayNum}
                                        />
                                    );
                                });
                            })()}
                        </div>
                    </div>
                ))}

                {observations.length === 0 && (
                    <div className="text-center p-10 text-slate-400 italic">
                        No observations added yet. Click "Add Observation" to start.
                    </div>
                )}
            </div>
        </div>
    );
}

