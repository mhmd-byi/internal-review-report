'use client';

import { ReportProvider } from '@/components/ReportContext';
import { ReportHeader } from '@/components/ReportHeader';
import { Toolbar } from '@/components/Toolbar';
import { Dashboard } from '@/components/Dashboard';
import { ObservationList } from '@/components/ObservationList';
import { PrintSummary } from '@/components/PrintSummary';

import { AppHeader } from '@/components/AppHeader';

export default function Home() {
  return (
    <ReportProvider>
      <div id="report-container" className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-gray-100 font-serif text-slate-800">
        <AppHeader title="Internal Review Report" />
        <div className="p-4 md:p-8">
          <div className="max-w-[1100px] mx-auto pb-20">

            <ReportHeader />

            <Toolbar />

            <PrintSummary />

            <ObservationList />

            <Dashboard />

          </div>
        </div>
      </div>
    </ReportProvider>
  );
}
