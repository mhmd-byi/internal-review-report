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

interface ObservationCardProps {
    observation: IObservation;
    obsNumber: string; // Changed from index number to string for "1.1" format
}

export function ObservationCard({ observation, obsNumber }: ObservationCardProps) {
    const { updateObservation, deleteObservation, auditDate } = useReport();
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
            const titles = templates.filter(t => t.area === area);
            setFilteredTitles(titles);
        } else {
            setFilteredTitles([]);
        }
    }, [area, templates]);

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
        if (selectedTitle === 'custom') {
            handleUpdate('title', '');
            return;
        }

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
                        />
                        Mark as Applicable
                    </label>
                </div>
            </div>
        );
    }

    if (isCollapsed) {
        return (
            <Card
                className="mb-4 border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setIsCollapsed(false)}
            >
                <div className={cn("p-3 flex items-center justify-between bg-gradient-to-r rounded-lg", getRiskColor(risk))}>
                    <div className="flex items-center gap-4 text-white">
                        <span className="font-bold text-sm bg-white/20 w-6 h-6 flex items-center justify-center rounded-full">
                            {obsNumber}
                        </span>
                        <span className="font-semibold text-sm truncate max-w-[300px] md:max-w-[500px]">
                            {title || 'Untitled Observation'}
                        </span>
                        {area && (
                            <span className="hidden md:inline-block text-xs bg-white/10 px-2 py-0.5 rounded text-white/90 border border-white/10">
                                {area}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-0.5 rounded font-bold bg-white/20 text-white border border-white/10">
                            {risk}
                        </span>
                        <span className="hidden md:inline text-xs text-white/80 font-medium">
                            {status}
                        </span>
                        <div className="text-white/70 group-hover:text-white transition-colors">
                            <span className="text-xs font-medium">Expand</span>
                        </div>
                    </div>
                </div>
            </Card>
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
                            >
                                <option value="" className="text-slate-800">Select Observation Title...</option>
                                {filteredTitles.map(t => (
                                    <option key={t._id} value={t.title} className="text-slate-800">{t.title}</option>
                                ))}
                                <option value="custom" className="text-slate-800 font-bold">-- Custom Title --</option>
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-lg text-white font-semibold placeholder:text-white/40 focus:outline-none focus:bg-white/20 focus:border-white/50 transition-colors"
                                placeholder="Enter Observation Title..."
                                value={title}
                                onChange={(e) => handleUpdate('title', e.target.value)}
                            />
                        )}
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="text-xs font-medium text-white/80">
                            Observation #{obsNumber}
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-xs text-white/90 cursor-pointer hover:text-white transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isNA}
                                    onChange={(e) => handleUpdate('isNA', e.target.checked)}
                                    className="rounded border-white/30 bg-white/10 text-indigo-500 focus:ring-offset-0 focus:ring-1 focus:ring-white/50"
                                />
                                Mark as N/A
                            </label>
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="text-xs bg-white/10 hover:bg-white/20 px-4 py-1 rounded-full border border-white/20 transition-all font-medium"
                            >
                                {isCollapsed ? 'Expand' : 'Collapse'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <CardContent className="p-4 bg-white/90 space-y-4">
                {/* Background */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Background</label>
                    <p className="text-xs text-slate-400 mb-2">Briefly describe the current process / practice followed at the school for this area.</p>
                    <Textarea
                        placeholder="Example: Management meetings are held monthly..."
                        value={background}
                        onChange={(e) => handleUpdate('background', e.target.value)}
                        className="min-h-[50px] text-sm print:hidden"
                    />
                    <div className="hidden print:block text-sm whitespace-pre-wrap text-slate-800">{background || '-'}</div>
                </div>

                {/* Observation */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Observation</label>
                    <p className="text-xs text-slate-400 mb-2">Highlight the specific issue identified during the review.</p>
                    <Textarea
                        placeholder="Example: No Minutes Register is maintained..."
                        value={obsText}
                        onChange={(e) => handleUpdate('observation', e.target.value)}
                        className="min-h-[50px] text-sm print:hidden"
                    />
                    <div className="hidden print:block text-sm whitespace-pre-wrap text-slate-800">{obsText || '-'}</div>
                </div>

                {/* Recommendation */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Recommendation</label>
                    <p className="text-xs text-slate-400 mb-2">Recommended corrective action as suggested by auditors.</p>
                    <Textarea
                        placeholder="Example: Introduce a formal Minutes Register..."
                        value={recommendation}
                        onChange={(e) => handleUpdate('recommendation', e.target.value)}
                        className="min-h-[50px] text-sm print:hidden"
                    />
                    <div className="hidden print:block text-sm whitespace-pre-wrap text-slate-800">{recommendation || '-'}</div>
                </div>

                {/* Implication */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Implication</label>
                    <p className="text-xs text-slate-400 mb-2">Potential qualitative / quantitative impact.</p>
                    <Textarea
                        placeholder="Example: Risk of decisions not being implemented..."
                        value={implication}
                        onChange={(e) => handleUpdate('implication', e.target.value)}
                        className="min-h-[50px] text-sm print:hidden"
                    />
                    <div className="hidden print:block text-sm whitespace-pre-wrap text-slate-800">{implication || '-'}</div>
                </div>

                {/* Management Response */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Management Response</label>
                    <p className="text-xs text-slate-400 mb-2">Structured response from management, including Action Plan.</p>

                    <label className="block text-xs font-semibold text-slate-600 mt-2 mb-1">Action Plan</label>
                    <Textarea
                        placeholder="Detail the exact steps management will take..."
                        value={actionPlan}
                        onChange={(e) => handleUpdate('actionPlan', e.target.value)}
                        className="min-h-[60px] text-sm print:hidden"
                    />
                    <div className="hidden print:block text-sm whitespace-pre-wrap text-slate-800">{actionPlan || '-'}</div>
                    <p className="text-[10px] text-slate-400 italic mt-1 print:hidden">Suggested structure: Specific Action Plan aligned to the observation.</p>
                </div>

                {/* Timeline & Responsibility Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Timelines (Tracker)</label>
                        <p className="text-xs text-slate-400 mb-2">Due date for implementation.</p>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <span className="text-xs font-medium block mb-1">Target Date:</span>
                                <Input
                                    type="date"
                                    value={targetDate ? new Date(targetDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleUpdate('targetDate', e.target.value ? new Date(e.target.value) : undefined)}
                                    className="bg-white font-bold"
                                />
                            </div>
                            <div className="flex-1">
                                <span className="text-xs font-medium block mb-1">Status:</span>
                                <select
                                    className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm font-bold"
                                    value={status}
                                    onChange={(e) => handleUpdate('status', e.target.value as any)}
                                >
                                    <option value="Open">Open</option>
                                    <option value="In-Progress">In-Progress</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Responsibility</label>
                        <p className="text-xs text-slate-400 mb-2">Responsibility assigned for implementation.</p>
                        <select
                            className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm"
                            value={responsibility}
                            onChange={(e) => handleUpdate('responsibility', e.target.value)}
                        >
                            <option value="" disabled>Select Responsible Person</option>
                            <option value="Principal">Principal</option>
                            <option value="Admin Head">Admin Head</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Management Committee">Management Committee</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
