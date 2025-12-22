'use client';

import React, { useState } from 'react';
import { useReport } from '@/components/ReportContext';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, Download, Save, Loader2, ChevronsDown, ChevronsUp } from 'lucide-react';

// Standard Area Order (Match ObservationList)
const AREA_ORDER = [
    'INTERNAL CONTROLS AND FINANCIAL MANAGEMENT',
    'REVENUE & INCOME RECOGNITION',
    'EXPENSES & COST MANAGEMENT',
    'FIXED ASSETS',
    'LEGAL AND STATUTORY COMPLIANCE',
    'Other'
];

export function Toolbar() {
    const { stats, location, addObservation, observations, schoolName, period, auditDate, preparedBy } = useReport();
    const [isSaving, setIsSaving] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [managementUsers, setManagementUsers] = useState<{ _id: string, name: string, email: string }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [isSending, setIsSending] = useState(false);

    const handleOpenSendModal = async () => {
        setIsSendModalOpen(true);
        try {
            const res = await fetch('/api/users?role=management');
            const data = await res.json();
            if (Array.isArray(data)) {
                setManagementUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch management users', error);
        }
    };

    const handleSendToManagement = async () => {
        if (!selectedUserId) {
            alert('Please select a user');
            return;
        }

        setIsSending(true);

        try {
            const selectedUser = managementUsers.find(u => u._id === selectedUserId);

            const reportData = {
                schoolName,
                location,
                period,
                auditDate,
                preparedBy,
                observations,
                assignedTo: selectedUserId,
                assignedToName: selectedUser?.name,
                workflowStatus: 'Sent to Management'
            };

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData),
            });

            if (!response.ok) throw new Error('Failed to send report');

            alert(`Report sent to ${selectedUser?.name} successfully!`);
            setIsSendModalOpen(false);

        } catch (error) {
            console.error(error);
            alert('Failed to send report');
        } finally {
            setIsSending(false);
        }
    };

    // Calculate available areas for Jump To
    const uniqueAreas = Array.from(new Set(observations.map(obs => obs.area && obs.area.trim() !== '' ? obs.area : 'Other')));
    const sortedAreas = uniqueAreas.sort((a, b) => {
        const idxA = AREA_ORDER.findIndex(order => order.toLowerCase() === a.toLowerCase());
        const idxB = AREA_ORDER.findIndex(order => order.toLowerCase() === b.toLowerCase());

        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    const handleJumpTo = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const areaName = e.target.value;
        if (!areaName) return;

        // Find index in sorted list to match ID
        const idx = sortedAreas.indexOf(areaName);
        if (idx !== -1) {
            const el = document.getElementById(`area-${idx}`);
            if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 100; // Offset for sticky header
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    };

    const toggleCollapseAll = (collapsed: boolean) => {
        window.dispatchEvent(new Event(collapsed ? 'report:collapse-all' : 'report:expand-all'));
    };

    const handleExportPDF = async () => {
        alert("To export as PDF, please use the browser's Print feature (Ctrl+P) and select 'Save as PDF'. The layout is optimized for A4.");
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const reportData = {
                schoolName,
                location,
                period,
                auditDate,
                preparedBy,
                observations
            };

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save report');
            }

            alert('Report saved successfully!');
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Failed to save report. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <>
            <div className="sticky top-[70px] z-40 mb-8 p-2 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 print:hidden transition-all">
                {/* Stats Pills */}
                <div className="flex items-center gap-2 pl-2">
                    <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        Obs: {stats.total}
                    </div>
                    <div className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-100 hidden sm:flex items-center gap-1">
                        High: {stats.high}
                    </div>
                </div>

                {/* Middle Controls: Jump & Collapse */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                    {/* Jump To Dropdown */}
                    {sortedAreas.length > 0 && (
                        <div className="hidden md:block w-[200px]">
                            <Select onChange={handleJumpTo} className="h-8 text-xs bg-white border-slate-300">
                                <option value="">Jump to Area...</option>
                                {sortedAreas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </Select>
                        </div>
                    )}

                    {/* Collapse Controls */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCollapseAll(false)}
                            className="h-7 px-2 text-xs text-slate-600 hover:text-indigo-600 hover:bg-white"
                            title="Expand All"
                        >
                            <ChevronsDown className="w-3 h-3 mr-1" /> Expand All
                        </Button>
                        <div className="w-px h-4 bg-slate-300"></div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCollapseAll(true)}
                            className="h-7 px-2 text-xs text-slate-600 hover:text-indigo-600 hover:bg-white"
                            title="Collapse All"
                        >
                            <ChevronsUp className="w-3 h-3 mr-1" /> Collapse All
                        </Button>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 pr-1">
                    <Button
                        onClick={handleOpenSendModal}
                        size="sm"
                        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 shadow-sm hover:shadow"
                    >
                        Send to Management
                    </Button>

                    <Button
                        onClick={addObservation}
                        size="sm"
                        className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 shadow-sm hover:shadow"
                    >
                        <Plus className="w-3 h-3 mr-1" /> <span className="hidden sm:inline">Add</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full h-8 text-xs bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                        onClick={handleExportPDF}
                    >
                        <Download className="w-3 h-3 mr-1" /> <span className="hidden sm:inline">Print/PDF</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        onClick={handleSave}
                        disabled={isSaving}
                        title="Save Draft"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Send to Management Modal */}
            {isSendModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Send to Management</h3>
                        <p className="text-sm text-slate-500 mb-6">Select a management user to assign this report to. They will be notified and can provide their responses.</p>

                        <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                            {managementUsers.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No management users found.</p>
                            ) : (
                                managementUsers.map(user => (
                                    <div
                                        key={user._id}
                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedUserId === user._id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}
                                        onClick={() => setSelectedUserId(user._id)}
                                    >
                                        <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${selectedUserId === user._id ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                                            {selectedUserId === user._id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsSendModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSendToManagement} disabled={isSending || !selectedUserId} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Send Report
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
