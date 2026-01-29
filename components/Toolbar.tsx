'use client';

import React, { useState, useEffect } from 'react';
import { useReport } from '@/components/ReportContext';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, Download, Save, Loader2, ChevronsDown, ChevronsUp, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Standard Area Order (Match ObservationList)
const AREA_ORDER = [
    'INTERNAL CONTROLS AND FINANCIAL MANAGEMENT',
    'REVENUE & INCOME RECOGNITION',
    'EXPENSES & COST MANAGEMENT',
    'FIXED ASSETS',
    'LEGAL AND STATUTORY COMPLIANCE',
    'Other'
];

import { useSession } from 'next-auth/react';

export function Toolbar() {
    const { data: session } = useSession(); // Get session
    const searchParams = useSearchParams();
    const { stats, location, addObservation, observations, schoolName, period, auditDate, preparedBy } = useReport();
    const [isSaving, setIsSaving] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [managementUsers, setManagementUsers] = useState<{ _id: string, name: string, email: string }[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [isSending, setIsSending] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportId, setReportId] = useState<string | null>(null);
    const [workflowStatus, setWorkflowStatus] = useState<string>('Draft');
    const [saveDropdownOpen, setSaveDropdownOpen] = useState(false);
    const [jumpMenuOpen, setJumpMenuOpen] = useState(false);
    const [hoveredArea, setHoveredArea] = useState<string | null>(null);

    // Get report ID and workflow status from URL
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setReportId(id);
            // Fetch report to get its workflow status
            fetch(`/api/reports/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        setWorkflowStatus(data.data.workflowStatus || 'Draft');
                    }
                })
                .catch(err => console.error('Failed to load report status:', err));
        }
    }, [searchParams]);

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

            const result = await response.json();
            setReportId(result.data._id);
            setWorkflowStatus('Sent to Management');

            alert(`Report sent to ${selectedUser?.name} successfully!`);
            setIsSendModalOpen(false);

        } catch (error) {
            console.error(error);
            alert('Failed to send report');
        } finally {
            setIsSending(false);
        }
    };

    const handleSubmitForReview = async () => {
        if (!reportId) {
            alert('Report ID not found. Please save the report first.');
            return;
        }

        if (!confirm('Are you sure you want to submit this report for admin review? You will not be able to edit it after submission.')) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/reports/${reportId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit report');
            }

            const result = await response.json();
            setWorkflowStatus('Submitted by Management');
            alert('Report submitted successfully for admin review!');
        } catch (error: any) {
            console.error('Error submitting report:', error);
            alert(error.message || 'Failed to submit report');
        } finally {
            setIsSubmitting(false);
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

    // Group observations by area (including non-NA observations with titles)
    const observationsByArea = sortedAreas.reduce((acc, area) => {
        acc[area] = observations
            .filter(obs => {
                const obsArea = obs.area && obs.area.trim() !== '' ? obs.area : 'Other';
                return obsArea === area && !obs.isNA && obs.title && obs.title.trim() !== '';
            });
        return acc;
    }, {} as Record<string, typeof observations>);

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

    const handleJumpToObservation = (observationId: string) => {
        const el = document.getElementById(`obs-card-${observationId}`);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        setJumpMenuOpen(false);
        setHoveredArea(null);
    };
    const toggleCollapseAll = (collapsed: boolean) => {
        window.dispatchEvent(new Event(collapsed ? 'report:collapse-all' : 'report:expand-all'));
    };

    const handleExportPDF = async () => {
        // Automatically expand all observations before printing to ensure content isn't hidden
        toggleCollapseAll(false);

        // Short delay to allow expansion animations/renders to complete
        setTimeout(() => {
            alert("📄 Print Instructions:\n\n1. Select 'Save as PDF' as the destination.\n2. Ensure 'Background graphics' is ENABLED to see the risk colors.\n3. The layout is optimized for A4 paper size.");
            window.print();
        }, 300);
    };

    const handleSaveReport = async () => {
        setIsSaving(true);
        try {
            const reportData = {
                schoolName,
                location,
                period,
                auditDate,
                preparedBy,
                observations,
                isDraft: false,
                workflowStatus: workflowStatus || 'Draft' // Preserve existing status or set to Draft
            };

            let response;
            if (reportId) {
                // Update existing report
                response = await fetch(`/api/reports/${reportId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reportData),
                });
            } else {
                // Create new report
                response = await fetch('/api/reports', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reportData),
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save report');
            }

            // If this was a new report, set the reportId and update URL
            if (!reportId && data.data?._id) {
                setReportId(data.data._id);
                // Update URL without page reload
                window.history.pushState({}, '', `/report?id=${data.data._id}`);
            }

            alert('Report saved successfully!');
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Failed to save report. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAsDraft = async () => {
        setIsSaving(true);
        try {
            const reportData = {
                schoolName,
                location,
                period,
                auditDate,
                preparedBy,
                observations,
                isDraft: true,
                workflowStatus: 'Draft' // Explicitly set to Draft
            };

            let response;
            if (reportId) {
                // Update existing draft
                response = await fetch(`/api/reports/${reportId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reportData),
                });
            } else {
                // Create new draft
                response = await fetch('/api/reports', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reportData),
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save draft');
            }

            // If this was a new draft, set the reportId and update URL
            if (!reportId && data.data?._id) {
                setReportId(data.data._id);
                // Update URL without page reload
                window.history.pushState({}, '', `/report?id=${data.data._id}`);
            }

            alert('Draft saved successfully!');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft. Please try again.');
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
                    {
                        sortedAreas.length > 0 && (
                            <div className="hidden md:block relative"
                                onMouseEnter={() => setJumpMenuOpen(true)}
                                onMouseLeave={() => {
                                    setJumpMenuOpen(false);
                                    setHoveredArea(null);
                                }}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs bg-white hover:bg-slate-50 border-slate-300 text-slate-700"
                                >
                                    Jump to...
                                </Button>

                                {/* Main Menu */}
                                {jumpMenuOpen && (
                                    <div
                                        className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 min-w-[220px]"
                                    >
                                        {sortedAreas.map((area) => {
                                            const obsCount = observationsByArea[area]?.length || 0;
                                            return (
                                                <div
                                                    key={area}
                                                    className="relative"
                                                    onMouseEnter={() => setHoveredArea(area)}
                                                >
                                                    <div
                                                        className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors ${hoveredArea === area
                                                            ? 'bg-indigo-50 text-indigo-700'
                                                            : 'text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <span className="font-medium truncate">{area}</span>
                                                        {obsCount > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-slate-500">{obsCount}</span>
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Submenu */}
                                                    {hoveredArea === area && obsCount > 0 && (
                                                        <div
                                                            className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-slate-200 py-1 min-w-[280px] max-w-[400px] z-50"
                                                            onMouseEnter={() => setHoveredArea(area)}
                                                        >
                                                            {observationsByArea[area].map((obs, idx) => (
                                                                <button
                                                                    key={obs.id}
                                                                    onClick={() => handleJumpToObservation(obs.id)}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-start gap-2 group"
                                                                >
                                                                    <span className="text-xs text-slate-400 mt-0.5 font-mono">{idx + 1}.</span>
                                                                    <span className="flex-1 text-slate-700 group-hover:text-indigo-700 line-clamp-2">{obs.title}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    }{/* Collapse Controls */}
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


                    {/* Right Actions */}
                    <div className="flex items-center gap-2 pr-1">
                        {/* Submit for Review btn (Management Only) */}
                        {session?.user?.role === 'management' && workflowStatus === 'Sent to Management' && (
                            <Button
                                onClick={handleSubmitForReview}
                                size="sm"
                                disabled={isSubmitting}
                                className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-3 shadow-sm hover:shadow"
                            >
                                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                Submit for Review
                            </Button>
                        )}

                        {/* Status badge (Management Only) */}
                        {session?.user?.role === 'management' && workflowStatus === 'Submitted by Management' && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                ✓ Submitted
                            </span>
                        )}

                        {session?.user?.role !== 'management' && (
                            <Button
                                onClick={handleOpenSendModal}
                                size="sm"
                                className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 shadow-sm hover:shadow"
                            >
                                Send to Management
                            </Button>
                        )}

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
                            <Download className="w-3 h-3 mr-1" /> <span className="hidden sm:inline">Print</span>
                        </Button>

                        {/* Split Save Button with Dropdown */}
                        <div className="relative">
                            <div className="flex items-center gap-0">
                                {/* Main Save Button */}
                                <Button
                                    size="sm"
                                    className="rounded-l-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white pr-3"
                                    onClick={handleSaveReport}
                                    disabled={isSaving}
                                    title="Save Report"
                                >
                                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                                    <span className="hidden sm:inline">Save</span>
                                </Button>

                                {/* Dropdown Toggle Button */}
                                <Button
                                    size="sm"
                                    className="rounded-r-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-l border-indigo-500 px-1.5"
                                    onClick={() => setSaveDropdownOpen(!saveDropdownOpen)}
                                    disabled={isSaving}
                                    title="More save options"
                                >
                                    <ChevronDown className="w-3 h-3" />
                                </Button>
                            </div>

                            {/* Dropdown Menu */}
                            {saveDropdownOpen && (
                                <>
                                    {/* Backdrop to close dropdown */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setSaveDropdownOpen(false)}
                                    />

                                    {/* Dropdown Content */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 flex items-center gap-2 transition-colors"
                                            onClick={() => {
                                                setSaveDropdownOpen(false);
                                                handleSaveAsDraft();
                                            }}
                                            disabled={isSaving}
                                        >
                                            <Save className="w-4 h-4 text-sky-600" />
                                            <div>
                                                <div className="font-medium">Save as Draft</div>
                                                <div className="text-xs text-slate-500">Save work in progress</div>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
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
            </div>
        </>
    );
}
