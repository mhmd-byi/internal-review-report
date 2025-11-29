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
    index: number;
}

export function ObservationCard({ observation, index }: ObservationCardProps) {
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
            handleUpdate('actionPlan', template.actionPlan);
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
            <div className="hidden print:hidden">
                <div className="mb-4 p-2 bg-gray-100 rounded flex justify-between items-center opacity-60">
                    <span className="text-xs font-bold">Observation {index + 1} (N/A)</span>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isNA}
                            onChange={(e) => handleUpdate('isNA', e.target.checked)}
                        />
                        Not Applicable
                    </label>
                </div>
            </div>
        );
    }

    return (
        <Card className={cn("mb-6 border-slate-200 shadow-lg overflow-hidden transition-all", isCollapsed ? "h-[60px]" : "")}>
            <div className={cn("p-3 text-white bg-gradient-to-br", getRiskColor(risk))}>
                <div className="flex flex-col gap-2">
                    {/* Title Row - NOW A DROPDOWN OR INPUT */}
                    <div className="w-full relative">
                        {filteredTitles.length > 0 ? (
                            <select
                                className="w-full bg-slate-900/20 border border-white/40 rounded px-2 py-1 text-white font-semibold focus:outline-none focus:bg-slate-900/40 appearance-none cursor-pointer"
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
                                className="w-full bg-slate-900/20 border border-white/40 rounded px-2 py-1 text-white font-semibold placeholder:text-white/50 focus:outline-none focus:bg-slate-900/40"
                                placeholder="Observation Title..."
                                value={title}
                                onChange={(e) => handleUpdate('title', e.target.value)}
                            />
                        )}
                    </div>

                    {/* Meta Row */}
                    <div className="flex items-center justify-between mt-1">
                        <div className="text-sm font-medium opacity-90">
                            Observation No.: <span>{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1 text-xs text-yellow-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isNA}
                                    onChange={(e) => handleUpdate('isNA', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Not Applicable
                            </label>
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-0.5 rounded-full border border-white/40 transition-colors"
                            >
                                {isCollapsed ? 'Expand' : 'Collapse'}
                            </button>
                        </div>
                    </div>

                    {/* Tags Row */}
                    <div className="flex flex-wrap gap-2 justify-center mt-1 text-xs text-slate-800">
                        <div className="flex items-center gap-1 bg-slate-900/20 px-2 py-0.5 rounded-full text-white">
                            <span className="font-medium">Area:</span>
                            <select
                                className="bg-white text-slate-900 rounded px-1 py-0.5 text-xs border-none focus:ring-0 cursor-pointer max-w-[150px]"
                                value={area}
                                onChange={(e) => handleUpdate('area', e.target.value)}
                            >
                                <option value="">Select Area</option>
                                {availableAreas.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-900/20 px-2 py-0.5 rounded-full text-white">
                            <span className="font-medium">Type:</span>
                            <select
                                className="bg-white text-slate-900 rounded px-1 py-0.5 text-xs border-none focus:ring-0 cursor-pointer"
                                value={type}
                                onChange={(e) => handleUpdate('type', e.target.value as any)}
                            >
                                <option value="Financial">Financial</option>
                                <option value="Non Financial">Non Financial</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-900/20 px-2 py-0.5 rounded-full text-white">
                            <span className="font-medium">Risk:</span>
                            <select
                                className={cn("rounded px-1 py-0.5 text-xs border-none focus:ring-0 cursor-pointer font-semibold", getRiskBg(risk))}
                                value={risk}
                                onChange={(e) => handleUpdate('risk', e.target.value as any)}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        {type === 'Financial' && (
                            <div className="flex items-center gap-1 bg-slate-900/20 px-2 py-0.5 rounded-full text-white">
                                <span className="font-medium">Impact (₹):</span>
                                <input
                                    type="number"
                                    className="w-20 bg-white text-slate-900 rounded px-1 py-0.5 text-xs border-none focus:ring-0"
                                    value={financialImpact || ''}
                                    onChange={(e) => handleUpdate('financialImpact', e.target.value)}
                                />
                            </div>
                        )}
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
                        className="min-h-[50px] text-sm"
                    />
                </div>

                {/* Observation */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Observation</label>
                    <p className="text-xs text-slate-400 mb-2">Highlight the specific issue identified during the review.</p>
                    <Textarea
                        placeholder="Example: No Minutes Register is maintained..."
                        value={obsText}
                        onChange={(e) => handleUpdate('observation', e.target.value)}
                        className="min-h-[50px] text-sm"
                    />
                </div>

                {/* Recommendation */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Recommendation</label>
                    <p className="text-xs text-slate-400 mb-2">Recommended corrective action as suggested by auditors.</p>
                    <Textarea
                        placeholder="Example: Introduce a formal Minutes Register..."
                        value={recommendation}
                        onChange={(e) => handleUpdate('recommendation', e.target.value)}
                        className="min-h-[50px] text-sm"
                    />
                </div>

                {/* Implication */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Implication</label>
                    <p className="text-xs text-slate-400 mb-2">Potential qualitative / quantitative impact.</p>
                    <Textarea
                        placeholder="Example: Risk of decisions not being implemented..."
                        value={implication}
                        onChange={(e) => handleUpdate('implication', e.target.value)}
                        className="min-h-[50px] text-sm"
                    />
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
                        className="min-h-[60px] text-sm"
                    />
                    <p className="text-[10px] text-slate-400 italic mt-1">Suggested structure: Specific Action Plan aligned to the observation.</p>
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
