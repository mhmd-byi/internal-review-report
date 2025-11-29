'use client';

import React from 'react';
import { useReport } from '@/components/ReportContext';

export function ReportHeader() {
    const {
        schoolName, setSchoolName,
        location, setLocation,
        period, setPeriod,
        auditDate, setAuditDate,
        preparedBy, setPreparedBy,
        stats
    } = useReport();

    return (
        <div className="mb-8">
            {/* Print Header (Hidden on Screen) */}
            <div className="hidden print:block fixed top-0 left-0 right-0 bg-white z-50 border-b pb-2 text-center text-sm text-gray-600">
                {schoolName} | {location} | {new Date(auditDate).toLocaleDateString()} | {preparedBy}
            </div>

            {/* Screen Header */}
            <div className="text-center mb-6 pt-8">
                <h1 className="text-3xl font-serif font-bold text-slate-900 mb-1">Internal Review Report</h1>
                <h2 className="text-xl font-serif text-slate-700 font-medium">Observation Summary Template</h2>
            </div>

            {/* Meta Card */}
            <div className="bg-white/20 backdrop-blur-md border border-white/40 rounded-xl shadow-xl p-5 mb-6">
                <div className="flex flex-wrap lg:flex-nowrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">School</label>
                        <input
                            type="text"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-white/90 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-white/90 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Period of Review</label>
                        <input
                            type="text"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-white/90 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                    <div className="w-[160px]">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Date of Audit</label>
                        <input
                            type="date"
                            value={auditDate}
                            onChange={(e) => setAuditDate(e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-white/90 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Prepared By</label>
                        <input
                            type="text"
                            value={preparedBy}
                            onChange={(e) => setPreparedBy(e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-white/90 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
