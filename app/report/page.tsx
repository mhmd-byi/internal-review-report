'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { IObservation } from '@/models/Report';
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
  const { loadReport, setAllObservations } = useReport();

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
    } else {
      // New Report: Fetch templates and populate
      fetch('/api/templates')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            // Map templates to IObservation objects
            const templateObs: IObservation[] = data.data.map((t: any) => ({
              id: crypto.randomUUID(),
              title: t.title,
              isNA: false,
              area: t.area,
              type: 'Non Financial',
              risk: t.risk || 'Medium',
              background: t.background || '',
              observation: t.observation || '',
              recommendation: t.recommendation || '',
              implication: t.implication || '',
              actionPlan: t.actionPlan || '',
              status: 'Open',
              responsibility: '',
              targetDate: undefined
            }));

            // Fallback: if no templates, add one empty observation (to avoid empty screen)
            if (templateObs.length === 0) {
              setAllObservations([{
                id: crypto.randomUUID(),
                title: '', isNA: false, area: '', type: 'Non Financial', risk: 'Medium',
                background: '', observation: '', recommendation: '', implication: '', actionPlan: '',
                status: 'Open', responsibility: ''
              }]);
            } else {
              setAllObservations(templateObs);
            }
          }
        })
        .catch(err => console.error('Failed to load templates:', err));
    }
  }, [reportId, loadReport, setAllObservations]);

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
