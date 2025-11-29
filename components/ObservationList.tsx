'use client';

import React from 'react';
import { useReport } from '@/components/ReportContext';
import { ObservationCard } from '@/components/ObservationCard';

export function ObservationList() {
    const { observations } = useReport();

    return (
        <div className="space-y-6">
            <hr className="border-t-2 border-slate-200 my-6" />

            <div className="flex justify-end mb-2">
                {/* Global collapse could go here */}
            </div>

            <div id="obsContainer">
                {observations.map((obs, index) => (
                    <ObservationCard key={obs.id} observation={obs} index={index} />
                ))}
            </div>
        </div>
    );
}
