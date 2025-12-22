'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useReport } from '@/components/ReportContext';
import { IObservation } from '@/models/Report';
import { cn } from '@/lib/utils';
import { getTargetDateFromAudit } from '@/utils/dates';
import { useSession } from 'next-auth/react';

interface ObservationCardProps {
    observation: IObservation;
    obsNumber: string; // Changed from index number to string for "1.1" format
}

export function ObservationCard({ observation, obsNumber }: ObservationCardProps) {
    const { data: session } = useSession();
    const { updateObservation, deleteObservation, auditDate, observations } = useReport();
    const isManagement = session?.user?.role === 'management';

    // ... inside return ...
    // Update inputs to add `disabled={isManagement}`

    // Example for Title/Risk/Type/Area/Inputs:
    // ... disabled={isManagement} ...
    // Note: I will apply this to all non-management inputs.

    // Can I apply a "readOnly" or "disabled" prop to all these elements?
    // I'll do it block by block.

    // ... (Code continues below)
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [availableAreas, setAvailableAreas] = useState<string[]>([]);
    const [filteredTitles, setFilteredTitles] = useState<any[]>([]);

    const {
        id,
        title,
        isNA,
        area,
        type,
        risk,
        financialImpact,
        background,
        observation: obsText,
        recommendation,
        implication,
        actionPlan,
        targetDate,
        status,
        responsibility,
        reviewerNotes,
    } = observation;

    useEffect(() => {
        // Fetch templates on mount
        fetch('/api/templates')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTemplates(data.data);
                    const areas = Array.from(new Set(data.data.map((t: any) => t.area)));
                    setAvailableAreas(areas as string[]);
                }
            })
            .catch(err => console.error('Failed to fetch templates:', err));
    }, []);

    useEffect(() => {
        const handleCollapse = () => setIsCollapsed(true);
        const handleExpand = () => setIsCollapsed(false);

        window.addEventListener('report:collapse-all', handleCollapse);
        window.addEventListener('report:expand-all', handleExpand);

        return () => {
            window.removeEventListener('report:collapse-all', handleCollapse);
            window.removeEventListener('report:expand-all', handleExpand);
        };
    }, []);

    useEffect(() => {
        if (area) {
            // Get titles used in OTHER cards
            const usedTitles = observations
                .filter(o => o.id !== id && o.title)
                .map(o => o.title);

            const titles = templates.filter(t => t.area === area && !usedTitles.includes(t.title));
            setFilteredTitles(titles);
        } else {
            setFilteredTitles([]);
        }
    }, [area, templates, observations, id]);

    // Auto-set target date if empty
    useEffect(() => {
        if (!targetDate && !isNA) {
            const defaultTarget = getTargetDateFromAudit(auditDate);
            updateObservation(id, { targetDate: new Date(defaultTarget) });
        }
    }, [targetDate, isNA, auditDate, id, updateObservation]);

    const handleUpdate = (field: keyof IObservation, value: any) => {
        updateObservation(id, { [field]: value });
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTitle = e.target.value;

        const template = templates.find(t => t.title === selectedTitle && t.area === area);

        handleUpdate('title', selectedTitle);
        if (template) {
            handleUpdate('risk', template.risk);
            handleUpdate('actionPlan', template.actionPlan || '');
            handleUpdate('background', template.background || '');
            if (template.observation) handleUpdate('observation', template.observation);
            handleUpdate('recommendation', template.recommendation || '');
            handleUpdate('implication', template.implication || '');
        }
    };

    const getRiskColor = (r: string) => {
        switch (r) {
            case 'High': return 'from-red-700 to-red-900';
            case 'Medium': return 'from-yellow-500 to-yellow-700';
            case 'Low': return 'from-green-600 to-green-800';
            default: return 'from-sky-900 to-slate-900';
        }
    };

    const getRiskBg = (r: string) => {
        switch (r) {
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-white text-slate-800';
        }
    };

    if (isNA) {
        return (
            <div className="mb-6 print:hidden">
                <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-500">Observation {obsNumber}</span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">Not Applicable</span>
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-600 hover:text-slate-900">
                        <input
                            type="checkbox"
                            checked={isNA}
                            onChange={(e) => handleUpdate('isNA', e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={isManagement}
                        />
                        Mark as Applicable
                    </label>
                </div>
            </div>
        );
    }


    return (
        <Card className="mb-6 border-slate-200 shadow-lg overflow-hidden transition-all">
            {/* Header Section */}
            <div className={cn("p-4 text-white bg-gradient-to-r", getRiskColor(risk))}>
                <div className="flex flex-col gap-4">

                    {/* Top Row: Area & Meta */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Area Selector */}
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1 block">Area</label>
                            <select
                                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white font-medium focus:outline-none focus:bg-white/20 focus:border-white/50 transition-colors cursor-pointer"
                                value={area}
                                onChange={(e) => handleUpdate('area', e.target.value)}
                                disabled={isManagement}
                            >
                                <option value="" className="text-slate-800">Select Area...</option>
                                {availableAreas.map(a => (
                                    <option key={a} value={a} className="text-slate-800">{a}</option>
                                ))}
                                <option value="Other" className="text-slate-800">Other</option>
                            </select>
                        </div>

                        {/* Metadata Badges */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Risk Badge */}
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1 block">Risk Level</label>
                                <select
                                    className={cn("h-[38px] rounded px-3 text-xs font-bold border-none focus:ring-0 cursor-pointer shadow-sm", getRiskBg(risk))}
                                    value={risk}
                                    onChange={(e) => handleUpdate('risk', e.target.value as any)}
                                    disabled={isManagement}
                                >
                                    <option value="High">High Risk</option>
                                    <option value="Medium">Medium Risk</option>
                                    <option value="Low">Low Risk</option>
                                </select>
                            </div>

                            {/* Type Badge */}
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1 block">Type</label>
                                <select
                                    className="h-[38px] bg-white/10 border border-white/20 rounded px-3 text-xs text-white font-medium focus:outline-none focus:bg-white/20 cursor-pointer"
                                    value={type}
                                    onChange={(e) => handleUpdate('type', e.target.value as any)}
                                    disabled={isManagement}
                                >
                                    <option value="Financial" className="text-slate-800">Financial</option>
                                    <option value="Non Financial" className="text-slate-800">Non-Financial</option>
                                </select>
                            </div>

                            {/* Financial Impact */}
                            {type === 'Financial' && (
                                <div className="flex flex-col">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1 block">Impact (₹)</label>
                                    <input
                                        type="number"
                                        className="h-[38px] w-24 bg-white text-slate-900 rounded px-3 text-sm font-bold border-none focus:ring-0 shadow-sm"
                                        placeholder="0.00"
                                        value={financialImpact || ''}
                                        onChange={(e) => handleUpdate('financialImpact', e.target.value)}
                                        disabled={isManagement}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Title Row */}
                    <div className="w-full">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1 block">Observation Title</label>
                        {filteredTitles.length > 0 ? (
                            <select
                                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-lg text-white font-semibold focus:outline-none focus:bg-white/20 focus:border-white/50 transition-colors cursor-pointer appearance-none"
                                value={title}
                                onChange={handleTitleChange}
                                disabled={isManagement}
                            >
                                <option value="" className="text-slate-800">Select Observation Title...</option>
                                {filteredTitles.map(t => (
                                    <option key={t._id} value={t.title} className="text-slate-800">{t.title}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-lg text-white font-semibold placeholder:text-white/40 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-colors"
                                placeholder="Enter Observation Title..."
                                value={title}
                                onChange={(e) => handleUpdate('title', e.target.value)}
                                disabled={isManagement}
                            />
                        )}
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="text-xs font-medium text-white/80">
                            Observation #{obsNumber}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isNA}
                                        onChange={(e) => updateObservation(id, { isNA: e.target.checked })}
                                        className="rounded border-slate-300 text-white focus:ring-sky-500"
                                        disabled={isManagement}
                                    />
                                    Not Applicable
                                </label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className="text-white hover:text-slate-700"
                                >
                                    {isCollapsed ? 'Expand' : 'Collapse'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body - Only visible when NOT collapsed */}
            {!isCollapsed && (
                <div className="p-4 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Background</label>
                            <p className="text-xs text-slate-500">Briefly describe the current process / practice followed at the school for this area.</p>
                            <Textarea
                                value={background}
                                onChange={(e) => updateObservation(id, { background: e.target.value })}
                                placeholder="Describe current process..."
                                className="min-h-[80px]"
                                disabled={isManagement}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Observation</label>
                            <p className="text-xs text-slate-500">Highlight the specific issue identified during the review.</p>
                            <Textarea
                                value={obsText}
                                onChange={(e) => updateObservation(id, { observation: e.target.value })}
                                placeholder="Describe the issue..."
                                className="min-h-[80px]"
                                disabled={isManagement}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Recommendation</label>
                            <p className="text-xs text-slate-500">Recommended corrective action as suggested by auditors.</p>
                            <Textarea
                                value={recommendation}
                                onChange={(e) => updateObservation(id, { recommendation: e.target.value })}
                                placeholder="Suggest improvements..."
                                className="min-h-[80px]"
                                disabled={isManagement}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Implication</label>
                            <p className="text-xs text-slate-500">Potential qualitative / quantitative impact.</p>
                            <Textarea
                                value={implication}
                                onChange={(e) => updateObservation(id, { implication: e.target.value })}
                                placeholder="Describe impact..."
                                className="min-h-[80px]"
                                disabled={isManagement}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="font-semibold text-slate-900">Management Response</h4>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Action Plan</label>
                                <Textarea
                                    value={actionPlan}
                                    onChange={(e) => updateObservation(id, { actionPlan: e.target.value })}
                                    placeholder="Detail the exact steps management will take..."
                                    className="min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Target Date</label>
                                    <Input
                                        type="date"
                                        value={targetDate ? new Date(targetDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => updateObservation(id, { targetDate: e.target.value ? new Date(e.target.value) : undefined })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Responsibility</label>
                                    <select
                                        className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
                                        value={responsibility}
                                        onChange={(e) => updateObservation(id, { responsibility: e.target.value })}
                                    >
                                        <option value="">Select Responsibility</option>
                                        <option value="Principal">Principal</option>
                                        <option value="Admin Head">Admin Head</option>
                                        <option value="Accountant">Accountant</option>
                                        <option value="Management Committee">Management Committee</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Status</label>
                                <select
                                    className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
                                    value={status}
                                    onChange={(e) => updateObservation(id, { status: e.target.value as any })}
                                >
                                    <option value="Open">Open</option>
                                    <option value="In-Progress">In-Progress</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Collapsed View - Reviewer Notes */}
            {isCollapsed && (
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Reviewer Notes</label>
                        <Textarea
                            value={reviewerNotes || ''}
                            onChange={(e) => updateObservation(id, { reviewerNotes: e.target.value })}
                            placeholder="Add notes for reviewer..."
                            className="min-h-[60px] bg-white"
                        />
                    </div>
                </div>
            )}
        </Card>
    );
}
