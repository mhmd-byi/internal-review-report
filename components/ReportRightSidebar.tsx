'use client';

import React from 'react';
import { useReport } from './ReportContext';
import { formatMMMDDYY } from '@/utils/dates';

export function ReportRightSidebar() {
    const { schoolName, location, period, auditDate, preparedBy } = useReport();

    const auditDateStr = formatMMMDDYY(auditDate);

    // Logic from v47:
    // header.innerHTML = `${school} | ${location} | ${period} | Audit Date: ${auditDateHeader || "-"} | Prepared By: ${prepared}`;
    const text = `${schoolName || 'School'} | ${location || 'Location'} | ${period || 'Period'} | Audit Date: ${auditDateStr || '-'} | Prepared By: ${preparedBy || 'Prepared By'}`;

    return (
        <div
            className="fixed top-0 right-0 h-screen w-[10mm] bg-transparent border-l border-slate-200 text-slate-600 text-[10pt] leading-[1.15] py-2 px-[2px] text-center z-[999] pointer-events-none select-none print:top-[5mm] print:h-[calc(100%-10mm)] print:m-0 print:border-b-0 print:text-[8pt] print:leading-[1.1] print:z-[9999]"
            style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)'
            }}
        >
            {text}
        </div>
    );
}
