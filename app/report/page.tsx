'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportProvider, useReport } from '@/components/ReportContext';
import { ReportHeader } from '@/components/ReportHeader';
import { Toolbar } from '@/components/Toolbar';
import { Dashboard } from '@/components/Dashboard';
import { ObservationList } from '@/components/ObservationList';
import { PrintSummary } from '@/components/PrintSummary';

import { ReportRightSidebar } from '@/components/ReportRightSidebar';

import { AppHeader } from '@/components/AppHeader';

function ReportContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const { loadReport } = useReport();

  useEffect(() => {
    if (reportId) {
      fetch(`/api/reports/${reportId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            loadReport(data.data);
          }
        })
        .catch(err => console.error('Failed to load report:', err));
    }
  }, [reportId]);

  return (
    <div id="report-container" className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-gray-100 font-serif text-slate-800">
      <AppHeader title="Internal Review Report" />
      <div className="p-4 md:p-8">
        <div className="max-w-[1100px] mx-auto pb-20 pr-12">

          <ReportRightSidebar />

          <ReportHeader />

          <Toolbar />

          <PrintSummary />

          <ObservationList />

          <Dashboard />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ReportProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <ReportContent />
      </Suspense>
    </ReportProvider>
  );
}
