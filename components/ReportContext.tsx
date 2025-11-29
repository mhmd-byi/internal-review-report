'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IObservation } from '@/models/Report';
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
    useEffect(() => {
        if (observations.length === 0) {
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
            if (obs.risk === 'High') acc.high++;
            if (obs.risk === 'Medium') acc.medium++;
            if (obs.risk === 'Low') acc.low++;

            if (obs.status === 'Open') acc.open++;
            if (obs.status === 'In-Progress') acc.inProgress++;
            if (obs.status === 'Closed') acc.closed++;

            if (obs.type === 'Financial') {
                acc.financialCount++;
                if (obs.financialImpact) {
                    acc.financialImpact += Number(obs.financialImpact);
                }
            }
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
        }
    );

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
