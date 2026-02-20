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
        stats, workflowStatus, declineReason
    } = useReport();

    return (
        <div className="mb-8">
            {/* Print Header (Hidden on Screen) */}
            <div className="hidden print:block relative bg-white border-b pb-4 mb-4 text-center text-sm text-gray-600">
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '14pt', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>
                    {schoolName} | Internal Review Report
                </div>
                <div>
                    {location} | Audit Date: {new Date(auditDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Prepared By: {preparedBy}
                </div>
            </div>

            {/* Screen Header */}
            <div className="text-center mb-6 pt-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Internal Review Report</h1>
                <h2 className="text-xl text-slate-700 font-medium" style={{ fontFamily: 'var(--font-heading)' }}>Observation Summary Template</h2>
            </div>

            {/* Decline Notice */}
            {workflowStatus === 'Declined' && declineReason && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 bg-orange-100 rounded-full">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-orange-900">Report Reverted for Correction</h3>
                            <p className="text-sm text-orange-800 mt-1 whitespace-pre-wrap">{declineReason}</p>
                            <p className="text-xs text-orange-600 mt-2 font-medium">Please address the feedback above and resubmit the report for review.</p>
                        </div>
                    </div>
                </div>
            )}

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
                        <div className="print-only font-bold text-slate-900 border-b border-slate-200 pb-1">
                            {schoolName || '-'}
                        </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-white/90 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                        <div className="print-only font-bold text-slate-900 border-b border-slate-200 pb-1">
                            {location || '-'}
                        </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Period of Review</label>
                        <input
                            type="text"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-white/90 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                        <div className="print-only font-bold text-slate-900 border-b border-slate-200 pb-1">
                            {period || '-'}
                        </div>
                    </div>
                    <div className="w-[160px]">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Date of Audit</label>
                        <input
                            type="date"
                            value={auditDate}
                            onChange={(e) => setAuditDate(e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-white/90 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                        <div className="print-only font-bold text-slate-900 border-b border-slate-200 pb-1">
                            {auditDate ? new Date(auditDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Prepared By</label>
                        <input
                            type="text"
                            value={preparedBy}
                            onChange={(e) => setPreparedBy(e.target.value)}
                            className="w-full rounded-lg border-slate-300 bg-white/90 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                        <div className="print-only font-bold text-slate-900 border-b border-slate-200 pb-1">
                            {preparedBy || '-'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
