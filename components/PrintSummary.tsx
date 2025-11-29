'use client';

import React from 'react';
import { useReport } from '@/components/ReportContext';
import { cn } from '@/lib/utils';

export function PrintSummary() {
    const { observations } = useReport();

    return (
        <div className="hidden print:block mb-6 p-4 border rounded-lg bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Observation Summary (Index)</h3>
            <table className="w-full border-collapse text-[10px]">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-1 text-left">No.</th>
                        <th className="border p-1 text-left">Area</th>
                        <th className="border p-1 text-left">Observation</th>
                        <th className="border p-1 text-left">Risk</th>
                        <th className="border p-1 text-left">Recommendation</th>
                    </tr>
                </thead>
                <tbody>
                    {observations.filter(o => !o.isNA).map((obs, idx) => (
                        <tr key={obs.id}>
                            <td className="border p-1">{idx + 1}</td>
                            <td className="border p-1">{obs.area || 'Other'}</td>
                            <td className="border p-1 font-medium">{obs.title || 'Untitled'}</td>
                            <td className={cn("border p-1 font-semibold",
                                obs.risk === 'High' ? 'bg-red-50 text-red-700' :
                                    obs.risk === 'Medium' ? 'bg-yellow-50 text-yellow-700' :
                                        'bg-green-50 text-green-700'
                            )}>
                                {obs.risk}
                            </td>
                            <td className="border p-1 text-gray-600 truncate max-w-[200px]">
                                {obs.recommendation.slice(0, 100)}{obs.recommendation.length > 100 ? '...' : ''}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
