'use client';

import React from 'react';
import { useReport } from '@/components/ReportContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { formatIndianNumber, numberToIndianWords } from '@/utils/format';
import { cn } from '@/lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

export function Dashboard() {
    const { stats, observations } = useReport();

    // Chart Data
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

    const chartOptions = {
        plugins: {
            legend: {
                display: false
            }
        },
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: true
    };

    return (
        <div className="mt-8 p-5 bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl print:break-before-page">
            <div className="text-xs text-gray-500 italic mb-2">Internal Review Dashboard – consolidated analytics for Management overview.</div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900">Dashboard Summary</h3>
                {/* Controls could go here */}
            </div>

            {/* KPI Row */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex-1 min-w-[150px] p-3 rounded-xl bg-slate-50/90 border border-slate-200">
                    <div className="text-xs text-slate-500">Observations</div>
                    <div className="text-sm font-semibold mt-1">Total: {stats.total}</div>
                    <div className="text-xs font-semibold text-slate-700">High: {stats.high} | Med: {stats.medium} | Low: {stats.low}</div>
                </div>
                <div className="flex-1 min-w-[150px] p-3 rounded-xl bg-slate-50/90 border border-slate-200">
                    <div className="text-xs text-slate-500">Status</div>
                    <div className="text-sm font-semibold mt-1">Filled: {stats.open + stats.inProgress + stats.closed}</div>
                    <div className="text-xs font-semibold text-slate-700 flex gap-2">
                        <span className="text-sky-600">Open: {stats.open}</span>
                        <span className="text-purple-600">In-Prog: {stats.inProgress}</span>
                        <span className="text-green-600">Closed: {stats.closed}</span>
                    </div>
                </div>
                <div className="flex-1 min-w-[150px] p-3 rounded-xl bg-slate-50/90 border border-slate-200">
                    <div className="text-xs text-slate-500">Financial Impact</div>
                    <div className="text-lg font-bold text-slate-900">₹ {formatIndianNumber(stats.financialImpact)}</div>
                    <div className="text-[10px] text-slate-500">{numberToIndianWords(stats.financialImpact)}</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Type Chart */}
                <div className="p-3 rounded-xl bg-slate-50/95 border border-slate-200 flex flex-col items-center">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2 w-full">By Type</h4>
                    <div className="w-24 h-24 relative">
                        <Pie data={typeData} options={chartOptions} />
                    </div>
                    <div className="mt-2 text-[10px] space-y-1 w-full">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-700"></span> Fin: {stats.financialCount}</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500"></span> Non-Fin: {stats.total - stats.financialCount}</div>
                    </div>
                </div>

                {/* Risk Chart */}
                <div className="p-3 rounded-xl bg-slate-50/95 border border-slate-200 flex flex-col items-center">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2 w-full">By Risk</h4>
                    <div className="w-24 h-24 relative">
                        <Pie data={riskData} options={chartOptions} />
                    </div>
                    <div className="mt-2 text-[10px] space-y-1 w-full">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-600"></span> High: {stats.high}</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-400"></span> Med: {stats.medium}</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-600"></span> Low: {stats.low}</div>
                    </div>
                </div>

                {/* Status Chart */}
                <div className="p-3 rounded-xl bg-slate-50/95 border border-slate-200 flex flex-col items-center">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2 w-full">By Status</h4>
                    <div className="w-24 h-24 relative">
                        <Pie data={statusData} options={chartOptions} />
                    </div>
                    <div className="mt-2 text-[10px] space-y-1 w-full">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-sky-500"></span> Open: {stats.open}</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500"></span> In-Prog: {stats.inProgress}</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500"></span> Closed: {stats.closed}</div>
                    </div>
                </div>

                {/* Matrix / Other */}
                <div className="p-3 rounded-xl bg-slate-50/95 border border-slate-200">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">Risk Load</h4>
                    <div className={cn("inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium border",
                        stats.high >= 5 ? "bg-red-50 border-red-200 text-red-700" :
                            stats.high >= 1 ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
                                "bg-green-50 border-green-200 text-green-700"
                    )}>
                        {stats.high >= 5 ? "High Risk Load" : stats.high >= 1 ? "Moderate Risk" : "Low Risk Load"}
                    </div>
                </div>
            </div>
        </div>
    );
}
