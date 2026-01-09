'use client';

import React from 'react';
import { useReport } from '@/components/ReportContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { formatIndianNumber, numberToIndianWords } from '@/utils/format';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FileCheck } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export function Dashboard() {
    const { stats } = useReport();
    const router = useRouter();
    const { data: session } = useSession();

    // Chart Data (Keep existing charts logic for visual quick view)
    const typeData = {
        labels: ['Financial', 'Non Financial'],
        datasets: [{
            data: [stats.financialCount, stats.total - stats.financialCount],
            backgroundColor: ['#1d4ed8', '#22c55e'],
            borderWidth: 0,
        }],
    };

    const riskData = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
            data: [stats.high, stats.medium, stats.low],
            backgroundColor: ['#dc2626', '#facc15', '#16a34a'],
            borderWidth: 0,
        }],
    };

    const statusData = {
        labels: ['Open', 'In-Progress', 'Closed'],
        datasets: [{
            data: [stats.open, stats.inProgress, stats.closed],
            backgroundColor: ['#0ea5e9', '#a855f7', '#22c55e'],
            borderWidth: 0,
        }],
    };

    const respData = {
        labels: Object.keys(stats.responsibilityMatrix),
        datasets: [{
            data: Object.values(stats.responsibilityMatrix).map(r => r.High + r.Medium + r.Low),
            backgroundColor: ['#f97316', '#6366f1', '#14b8a6', '#ec4899', '#84cc16'], // Colors from v47
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        plugins: { legend: { display: false } },
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: true
    };

    // Helper to render Matrix Tables matching v47 style
    const MatrixTable = ({ title, columns, rows }: { title: string, columns: string[], rows: { label: string, high: number, med: number, low: number, total: number }[] }) => (
        <div className="bg-slate-50/95 border border-slate-300 rounded-xl p-3 shadow-sm h-full flex flex-col">
            <h4 className="text-xs font-bold text-slate-800 mb-2">{title}</h4>
            <table className="w-full text-xs border-collapse">
                <thead>
                    <tr className="bg-slate-100 border-b border-slate-200">
                        {columns.map((col, i) => <th key={i} className="text-left p-1 font-semibold text-slate-600 border border-slate-200">{col}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-200">
                            <td className="p-1 border border-slate-200 font-medium">{row.label}</td>
                            <td className="p-1 border border-slate-200 text-center">{row.high}</td>
                            <td className="p-1 border border-slate-200 text-center">{row.med}</td>
                            <td className="p-1 border border-slate-200 text-center">{row.low}</td>
                            <td className="p-1 border border-slate-200 text-center font-bold">{row.total}</td>
                        </tr>
                    ))}
                    {/* Grand Total Row Calculation */}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                        <td className="p-1 border border-slate-200">Total</td>
                        <td className="p-1 border border-slate-200 text-center text-red-600">{rows.reduce((a, b) => a + b.high, 0)}</td>
                        <td className="p-1 border border-slate-200 text-center text-yellow-600">{rows.reduce((a, b) => a + b.med, 0)}</td>
                        <td className="p-1 border border-slate-200 text-center text-green-600">{rows.reduce((a, b) => a + b.low, 0)}</td>
                        <td className="p-1 border border-slate-200 text-center">{rows.reduce((a, b) => a + b.total, 0)}</td>
                    </tr>
                </tbody>
            </table>
            <div className="mt-auto pt-2 text-[10px] text-slate-400 flex gap-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-100 border border-red-200"></span> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-100 border border-yellow-200"></span> Med</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-100 border border-green-200"></span> Low</span>
            </div>
        </div>
    );

    // Prepare rows for matrices
    const statusRows = Object.entries(stats.statusMatrix).map(([label, val]) => ({
        label, high: val.High, med: val.Medium, low: val.Low, total: val.High + val.Medium + val.Low
    }));

    const respRows = Object.entries(stats.responsibilityMatrix).map(([label, val]) => ({
        label, high: val.High, med: val.Medium, low: val.Low, total: val.High + val.Medium + val.Low
    }));

    // Sort Area Rows
    const AREA_ORDER = [
        'INTERNAL CONTROLS AND FINANCIAL MANAGEMENT',
        'REVENUE & INCOME RECOGNITION',
        'EXPENSES & COST MANAGEMENT',
        'FIXED ASSETS',
        'LEGAL AND STATUTORY COMPLIANCE',
        'Other'
    ];

    const areaRows = Object.entries(stats.areaMatrix)
        .map(([label, val]) => ({
            label, high: val.High, med: val.Medium, low: val.Low, total: val.High + val.Medium + val.Low
        }))
        .sort((a, b) => {
            const idxA = AREA_ORDER.findIndex(order => order.toLowerCase() === a.label.toLowerCase());
            const idxB = AREA_ORDER.findIndex(order => order.toLowerCase() === b.label.toLowerCase());

            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.label.localeCompare(b.label);
        });


    return (
        <div className="mt-8 p-5 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-xl print:shadow-none print:border-none print:p-0 print:bg-white print:break-before-page">
            <div className="text-xs text-gray-500 italic mb-2 print:hidden">Internal Review Dashboard v2.0 – Consolidated Analytics</div>

            {/* KPI Row */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[140px] p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observations</div>
                    <div className="text-2xl font-bold mt-1 text-slate-800">{stats.total}</div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-1">High: {stats.high} | Med: {stats.medium} | Low: {stats.low}</div>
                </div>
                <div className="flex-1 min-w-[140px] p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</div>
                    <div className="text-2xl font-bold mt-1 text-slate-800">{stats.total}</div>
                    <div className="text-[11px] font-semibold text-slate-600 mt-1 flex gap-2">
                        <span className="text-sky-700">Open: {stats.open}</span>
                        <span className="text-purple-700">In-Prog: {stats.inProgress}</span>
                        <span className="text-green-700">Closed: {stats.closed}</span>
                    </div>
                </div>
                <div className="flex-1 min-w-[140px] p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Financial Obs</div>
                    <div className="text-2xl font-bold mt-1 text-slate-800">{stats.financialCount}</div>
                    <div className="text-[10px] text-slate-500 mt-1">With Impact Filled: {stats.financialCount}</div>
                </div>

                {/* Report Review Tile (Admin Only) */}
                {session?.user?.role === 'admin' && (
                    <div
                        onClick={() => router.push('/admin/reports')}
                        className="flex-1 min-w-[140px] p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 shadow-sm cursor-pointer hover:shadow-md hover:border-indigo-400 transition-all group"
                    >
                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                            <FileCheck className="w-3 h-3" />
                            Report Review
                        </div>
                        <div className="text-2xl font-bold mt-1 text-indigo-900 group-hover:text-indigo-600 transition-colors">→</div>
                        <div className="text-[10px] text-indigo-600 mt-1 font-semibold">Click to review reports</div>
                    </div>
                )}

                <div className="flex-[1.5] min-w-[200px] p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Financial Impact</div>
                    <div className="text-2xl font-bold mt-1 text-blue-900 underline decoration-blue-200/50 underline-offset-4">₹ {formatIndianNumber(stats.financialImpact)}</div>
                    <div className="text-[10px] text-slate-500 italic mt-1">{numberToIndianWords(stats.financialImpact)}</div>
                </div>
            </div>

            {/* Charts Grid (Small Pie Charts) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print:grid-cols-2">
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 flex flex-col items-center">
                    <h5 className="text-[10px] font-bold text-slate-600 mb-2 self-start">By Type</h5>
                    <div className="w-16 h-16"><Pie data={typeData} options={chartOptions} /></div>
                    <div className="mt-2 text-[9px] w-full space-y-0.5">
                        <div className="flex justify-between"><span>Fin</span> <strong>{stats.financialCount}</strong></div>
                        <div className="flex justify-between"><span>Non-Fin</span> <strong>{stats.total - stats.financialCount}</strong></div>
                    </div>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 flex flex-col items-center">
                    <h5 className="text-[10px] font-bold text-slate-600 mb-2 self-start">By Risk</h5>
                    <div className="w-16 h-16"><Pie data={riskData} options={chartOptions} /></div>
                    <div className="mt-2 text-[9px] w-full space-y-0.5">
                        <div className="flex justify-between text-red-700"><span>High</span> <strong>{stats.high}</strong></div>
                        <div className="flex justify-between text-yellow-700"><span>Med</span> <strong>{stats.medium}</strong></div>
                        <div className="flex justify-between text-green-700"><span>Low</span> <strong>{stats.low}</strong></div>
                    </div>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 flex flex-col items-center">
                    <h5 className="text-[10px] font-bold text-slate-600 mb-2 self-start">By Status</h5>
                    <div className="w-16 h-16"><Pie data={statusData} options={chartOptions} /></div>
                    <div className="mt-2 text-[9px] w-full space-y-0.5">
                        <div className="flex justify-between text-sky-700"><span>Open</span> <strong>{stats.open}</strong></div>
                        <div className="flex justify-between text-purple-700"><span>In-Prg</span> <strong>{stats.inProgress}</strong></div>
                        <div className="flex justify-between text-green-700"><span>Closed</span> <strong>{stats.closed}</strong></div>
                    </div>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 flex flex-col items-center">
                    <h5 className="text-[10px] font-bold text-slate-600 mb-2 self-start">By Resp</h5>
                    <div className="w-16 h-16"><Pie data={respData} options={chartOptions} /></div>
                </div>
            </div>

            {/* Matrix & Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print:grid-cols-1 print:gap-4">
                {/* Status x Risk */}
                <div className="h-full">
                    <MatrixTable
                        title="Status × Risk Matrix"
                        columns={['Status', 'High', 'Med', 'Low', 'Total']}
                        rows={statusRows}
                    />
                </div>
                {/* Responsibility x Risk */}
                <div className="h-full">
                    <MatrixTable
                        title="Responsibility × Risk Matrix"
                        columns={['Responsibility', 'High', 'Med', 'Low', 'Total']}
                        rows={respRows}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print:grid-cols-1 print:gap-4">
                {/* Documentation Quality & Alerts */}
                <div className="bg-slate-50/95 border border-slate-300 rounded-xl p-3 shadow-sm h-full flex flex-col">
                    <h4 className="text-xs font-bold text-slate-800 mb-2">Action Plan Documentation & Alerts</h4>
                    <table className="w-full text-xs border-collapse mb-4">
                        <tbody>
                            <tr className="border-b"><th className="text-left p-1 bg-slate-100 border">Action Plan defined</th><td className="p-1 border text-center font-bold">{stats.quality.complete}</td></tr>
                            <tr className="border-b"><th className="text-left p-1 bg-slate-100 border">Missing Action Plan</th><td className="p-1 border text-center font-bold text-red-600">{stats.quality.missingAP}</td></tr>
                            <tr className="border-b"><th className="text-left p-1 bg-slate-100 border">Missing Timeline</th><td className="p-1 border text-center font-bold text-red-600">{stats.quality.missingTL}</td></tr>
                            <tr className="border-b"><th className="text-left p-1 bg-slate-100 border">Missing Responsibility</th><td className="p-1 border text-center font-bold text-red-600">{stats.quality.missingResp}</td></tr>
                        </tbody>
                    </table>

                    <div className="flex flex-wrap gap-2 mt-auto">
                        <span className={cn("px-2 py-1 rounded-full text-[10px] font-semibold border",
                            stats.high >= 5 ? "bg-red-50 border-red-200 text-red-700" : stats.high >= 1 ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-green-50 border-green-200 text-green-700"
                        )}>
                            Risk Load: {stats.high >= 5 ? "High (≥5)" : stats.high >= 1 ? "Moderate" : "OK"}
                        </span>
                        <span className={cn("px-2 py-1 rounded-full text-[10px] font-semibold border",
                            stats.timelineBands.overdue > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
                        )}>
                            Overdue: {stats.timelineBands.overdue > 0 ? `${stats.timelineBands.overdue} Past Due` : "None"}
                        </span>
                        <span className={cn("px-2 py-1 rounded-full text-[10px] font-semibold border",
                            (stats.quality.missingAP / stats.total > 0.5) ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
                        )}>
                            Docs: {stats.quality.missingAP > 0 ? "Incomplete" : "Healthy"}
                        </span>
                    </div>
                </div>

                {/* Area Risk Matrix */}
                <div className="h-full">
                    <MatrixTable
                        title="Area-wise Risk Matrix"
                        columns={['Area', 'High', 'Med', 'Low', 'Total']}
                        rows={areaRows}
                    />
                </div>
            </div>

            {/* Timeline Banding */}
            <div className="bg-slate-50/95 border border-slate-300 rounded-xl p-3 shadow-sm mb-6 print:break-inside-avoid">
                <h4 className="text-xs font-bold text-slate-800 mb-3">Timeline Deadlines (Items not Closed)</h4>
                <div className="flex gap-1 h-8 w-full rounded-lg overflow-hidden bg-slate-200 text-[10px] font-bold text-center leading-8 text-white">
                    {stats.timelineBands.overdue > 0 && (
                        <div style={{ flex: stats.timelineBands.overdue }} className="bg-red-600 p-1 truncate">Overdue ({stats.timelineBands.overdue})</div>
                    )}
                    {stats.timelineBands.day0_7 > 0 && (
                        <div style={{ flex: stats.timelineBands.day0_7 }} className="bg-orange-500 p-1 truncate">0-7 Days ({stats.timelineBands.day0_7})</div>
                    )}
                    {stats.timelineBands.day8_15 > 0 && (
                        <div style={{ flex: stats.timelineBands.day8_15 }} className="bg-yellow-500 p-1 truncate">8-15 Days ({stats.timelineBands.day8_15})</div>
                    )}
                    {stats.timelineBands.day16_30 > 0 && (
                        <div style={{ flex: stats.timelineBands.day16_30 }} className="bg-blue-500 p-1 truncate">16-30 Days ({stats.timelineBands.day16_30})</div>
                    )}
                    {stats.timelineBands.day30p > 0 && (
                        <div style={{ flex: stats.timelineBands.day30p }} className="bg-slate-500 p-1 truncate">30+ Days ({stats.timelineBands.day30p})</div>
                    )}
                    {(stats.total - stats.closed) === 0 && <div className="flex-1 bg-green-500">All Closed</div>}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                    <span>Total Open/In-Progress: {stats.total - stats.closed}</span>
                    <span>Timeline visualization requires Target Date set on observations.</span>
                </div>
            </div>

        </div>
    );
}
