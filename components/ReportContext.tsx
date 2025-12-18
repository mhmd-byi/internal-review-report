'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IObservation, IReport } from '@/models/Report';
import { getCurrentDateISO, getTargetDateFromAudit } from '@/utils/dates';

interface ReportContextType {
    schoolName: string;
    setSchoolName: (val: string) => void;
    location: string;
    setLocation: (val: string) => void;
    period: string;
    setPeriod: (val: string) => void;
    auditDate: string;
    setAuditDate: (val: string) => void;
    preparedBy: string;
    setPreparedBy: (val: string) => void;
    observations: IObservation[];
    addObservation: () => void;
    updateObservation: (id: string, updates: Partial<IObservation>) => void;
    deleteObservation: (id: string) => void; // Optional, if we want delete
    loadReport: (reportData: any) => void;
    stats: {
        total: number;
        high: number;
        medium: number;
        low: number;
        open: number;
        inProgress: number;
        closed: number;
        financialCount: number;
        financialImpact: number;
        responsibilityMatrix: Record<string, { High: number; Medium: number; Low: number }>;
        statusMatrix: Record<string, { High: number; Medium: number; Low: number }>;
        areaMatrix: Record<string, { High: number; Medium: number; Low: number }>;
        timelineBands: { overdue: number; day0_7: number; day8_15: number; day16_30: number; day30p: number };
        quality: { complete: number; missingAP: number; missingTL: number; missingResp: number };
    };
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
    const [schoolName, setSchoolName] = useState('MSB School');
    const [location, setLocation] = useState('Rajkot');
    const [period, setPeriod] = useState('01-Apr-2024 to 31-Jan-2025');
    const [auditDate, setAuditDate] = useState(getCurrentDateISO());
    const [preparedBy, setPreparedBy] = useState('Internal Audit Team');
    const [observations, setObservations] = useState<IObservation[]>([]);

    // Initialize with one observation
    const initialized = React.useRef(false);
    useEffect(() => {
        if (!initialized.current && observations.length === 0) {
            initialized.current = true;
            addObservation();
        }
    }, []);

    const addObservation = () => {
        const newObs: IObservation = {
            id: crypto.randomUUID(),
            title: '',
            isNA: false,
            area: '',
            type: 'Non Financial',
            risk: 'Medium',
            background: '',
            observation: '',
            recommendation: '',
            implication: '',
            actionPlan: '',
            status: 'Open',
            responsibility: '',
            targetDate: undefined, // Will be set by default logic in UI if needed, or user input
        };
        setObservations((prev) => [...prev, newObs]);
    };

    const updateObservation = (id: string, updates: Partial<IObservation>) => {
        setObservations((prev) =>
            prev.map((obs) => (obs.id === id ? { ...obs, ...updates } : obs))
        );
    };

    const deleteObservation = (id: string) => {
        setObservations((prev) => prev.filter((obs) => obs.id !== id));
    };

    // Calculate Stats
    const stats = observations.reduce(
        (acc, obs) => {
            if (obs.isNA) return acc;
            acc.total++;

            // Risk Counts
            if (obs.risk === 'High') acc.high++;
            else if (obs.risk === 'Medium') acc.medium++;
            else if (obs.risk === 'Low') acc.low++;

            // Status Counts
            if (obs.status === 'Open') acc.open++;
            else if (obs.status === 'In-Progress') acc.inProgress++;
            else if (obs.status === 'Closed') acc.closed++;

            // Financial Impact
            if (obs.type === 'Financial') {
                acc.financialCount++;
                if (obs.financialImpact) {
                    acc.financialImpact += Number(obs.financialImpact);
                }
            }

            // --- v47 New Matrices & Logic ---

            // 1. Responsibility x Risk
            const resp = obs.responsibility || 'Other';
            if (!acc.responsibilityMatrix[resp]) {
                acc.responsibilityMatrix[resp] = { High: 0, Medium: 0, Low: 0 };
            }
            if (obs.risk) acc.responsibilityMatrix[resp][obs.risk]++;

            // 2. Status x Risk
            const st = obs.status || 'Open';
            if (!acc.statusMatrix[st]) {
                acc.statusMatrix[st] = { High: 0, Medium: 0, Low: 0 };
            }
            if (obs.risk) acc.statusMatrix[st][obs.risk]++;

            // 3. Area x Risk
            const area = obs.area || 'Other';
            if (!acc.areaMatrix[area]) {
                acc.areaMatrix[area] = { High: 0, Medium: 0, Low: 0 };
            }
            if (obs.risk) acc.areaMatrix[area][obs.risk]++;

            // 4. Timeline Banding
            // Logic: Calculate diffDays between targetDate and NOW (or auditDate? v47 uses 'now')
            // v47 logic: diffDays = targetDate - now. 
            // If diff < 0 -> Overdue. 0-7, 8-15, 16-30, 30+
            if (obs.status !== 'Closed' && obs.targetDate) {
                const target = new Date(obs.targetDate);
                const now = new Date();
                // Reset times for simpler day calc
                target.setHours(0, 0, 0, 0);
                now.setHours(0, 0, 0, 0);

                const diffTime = target.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) acc.timelineBands.overdue++;
                else if (diffDays <= 7) acc.timelineBands.day0_7++;
                else if (diffDays <= 15) acc.timelineBands.day8_15++;
                else if (diffDays <= 30) acc.timelineBands.day16_30++;
                else acc.timelineBands.day30p++;
            } else if (obs.status !== 'Closed' && !obs.targetDate) {
                // No date set = treat as long term or unassigned? v47 puts missing date into 30+ or separate?
                // v47: "missing date -> 30+ bucket"
                acc.timelineBands.day30p++;
            }

            // 5. Documentation Quality
            // Complete if: ActionPlan + TargetDate + Responsibility are present
            const hasAP = obs.actionPlan && obs.actionPlan.trim() !== '';
            const hasTL = !!obs.targetDate;
            const hasResp = !!obs.responsibility;

            if (hasAP && hasTL && hasResp) acc.quality.complete++;
            if (!hasAP) acc.quality.missingAP++;
            if (!hasTL) acc.quality.missingTL++;
            if (!hasResp) acc.quality.missingResp++;

            return acc;
        },
        {
            total: 0,
            high: 0,
            medium: 0,
            low: 0,
            open: 0,
            inProgress: 0,
            closed: 0,
            financialCount: 0,
            financialImpact: 0,
            responsibilityMatrix: {} as Record<string, { High: number; Medium: number; Low: number }>,
            statusMatrix: {} as Record<string, { High: number; Medium: number; Low: number }>,
            areaMatrix: {} as Record<string, { High: number; Medium: number; Low: number }>,
            timelineBands: { overdue: 0, day0_7: 0, day8_15: 0, day16_30: 0, day30p: 0 },
            quality: { complete: 0, missingAP: 0, missingTL: 0, missingResp: 0 }
        }
    );

    const loadReport = (reportData: IReport) => {
        setSchoolName(reportData.schoolName);
        setLocation(reportData.location);
        setPeriod(reportData.period);
        setAuditDate(new Date(reportData.auditDate).toISOString().split('T')[0]);
        setPreparedBy(reportData.preparedBy);
        setObservations(reportData.observations);
    };

    return (
        <ReportContext.Provider
            value={{
                schoolName,
                setSchoolName,
                location,
                setLocation,
                period,
                setPeriod,
                auditDate,
                setAuditDate,
                preparedBy,
                setPreparedBy,
                observations,
                addObservation,
                updateObservation,
                deleteObservation,
                loadReport,
                stats,
            }}
        >
            {children}
        </ReportContext.Provider>
    );
}

export function useReport() {
    const context = useContext(ReportContext);
    if (context === undefined) {
        throw new Error('useReport must be used within a ReportProvider');
    }
    return context;
}
