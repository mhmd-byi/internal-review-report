'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash, Edit, X, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp } from 'lucide-react';

interface ITemplate {
    _id: string;
    area: string;
    title: string;
    risk: 'High' | 'Medium' | 'Low';
    actionPlan: string;
    background?: string;
    observation?: string;
    recommendation?: string;
    implication?: string;
    createdBy?: string;
    creatorName?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface MetaArea {
    _id: string;
    name: string;
}

interface MetaTitle {
    _id: string;
    title: string;
    area?: string;
}

export default function AdminTemplatesPage() {
    const session = useSession();
    const [templates, setTemplates] = useState<ITemplate[]>([]);
    // Metadata State
    const [metaAreas, setMetaAreas] = useState<MetaArea[]>([]);
    const [metaTitles, setMetaTitles] = useState<MetaTitle[]>([]);

    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<ITemplate>>({
        area: '',
        title: '',
        risk: 'Medium',
        actionPlan: '',
        background: '',
        observation: '',
        recommendation: '',
        implication: ''
    });

    // Quick-add state for Areas and Titles
    const [showQuickAddArea, setShowQuickAddArea] = useState(false);
    const [showQuickAddTitle, setShowQuickAddTitle] = useState(false);
    const [quickAddAreaValue, setQuickAddAreaValue] = useState('');
    const [quickAddTitleValue, setQuickAddTitleValue] = useState('');
    const [quickAddLoading, setQuickAddLoading] = useState(false);
    const [quickAddError, setQuickAddError] = useState<string | null>(null);

    // Grouping State and Logic
    const [collapsedAreas, setCollapsedAreas] = useState<Record<string, boolean>>({});

    const groupedTemplates = templates.reduce((acc, template) => {
        const area = template.area || 'Other';
        if (!acc[area]) acc[area] = [];
        acc[area].push(template);
        return acc;
    }, {} as Record<string, ITemplate[]>);

    const sortedAreas = Object.keys(groupedTemplates).sort();

    const toggleArea = (area: string) => {
        setCollapsedAreas(prev => ({ ...prev, [area]: !prev[area] }));
    };

    const toggleAll = (collapse: boolean) => {
        const newCollapsed: Record<string, boolean> = {};
        sortedAreas.forEach(area => newCollapsed[area] = collapse);
        setCollapsedAreas(newCollapsed);
    };

    useEffect(() => {
        fetchTemplates();
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [areasRes, titlesRes] = await Promise.all([
                fetch('/api/settings/areas'),
                fetch('/api/settings/titles')
            ]);
            if (areasRes.ok) setMetaAreas(await areasRes.json());
            if (titlesRes.ok) setMetaTitles(await titlesRes.json());
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/templates');
            const data = await res.json();
            if (data.success) {
                setTemplates(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            area: '',
            title: '',
            risk: 'Medium',
            actionPlan: '',
            background: '',
            observation: '',
            recommendation: '',
            implication: ''
        });
        setShowModal(true);
    };

    const openEditModal = (template: ITemplate) => {
        setEditingId(template._id);
        setFormData(template);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            area: '',
            title: '',
            risk: 'Medium',
            actionPlan: '',
            background: '',
            observation: '',
            recommendation: '',
            implication: ''
        });
        closeQuickAddPopups();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // NOTE: Currently using POST for everything as per existing API logic. 
            // Ideally should differentiate PUT vs POST, but sticking to existing pattern for now (Create).
            // If editingId exists, we ideally want to UPDATE.
            // Check if API supports PUT or if we just Create New.
            // For now, consistent with previous step, we call POST. 
            // TODO: Ensure API handles updates or add PUT endpoint if strictly required. 
            // Assuming current task focus is UI Refactor.

            const url = editingId ? `/api/templates/${editingId}` : '/api/templates';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchTemplates();
                closeModal();
            }
        } catch (error) {
            console.error('Failed to save template:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/templates/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchTemplates();
            } else {
                alert("Failed to delete template");
            }
        } catch (error) {
            console.error('Failed to delete template:', error);
        }
    };

    // Quick-add handlers
    const handleQuickAddArea = async () => {
        if (!quickAddAreaValue.trim()) return;

        setQuickAddLoading(true);
        setQuickAddError(null);

        try {
            console.log('Creating new area:', quickAddAreaValue.trim());
            const res = await fetch('/api/settings/areas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: quickAddAreaValue.trim() }),
            });

            if (res.ok) {
                const newArea = await res.json();
                console.log('Area created successfully:', newArea);

                // Validate response
                if (!newArea._id || !newArea.name) {
                    console.error('Invalid area response:', newArea);
                    setQuickAddError('Invalid response from server');
                    return;
                }

                // Add new area and sort alphabetically
                const updatedAreas = [...metaAreas, newArea].sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
                setMetaAreas(updatedAreas);

                // Auto-select the new area
                setFormData({ ...formData, area: newArea.name });

                // Clear and close popup
                setQuickAddAreaValue('');
                setShowQuickAddArea(false);

                console.log('Updated areas list:', updatedAreas);
            } else {
                const errorData = await res.json();
                console.error('Failed to create area:', errorData);
                setQuickAddError(errorData.error || 'Failed to create area');
            }
        } catch (error) {
            console.error('Network error creating area:', error);
            setQuickAddError('Network error. Please try again.');
        } finally {
            setQuickAddLoading(false);
        }
    };

    const handleQuickAddTitle = async () => {
        if (!quickAddTitleValue.trim()) return;

        setQuickAddLoading(true);
        setQuickAddError(null);

        try {
            const payload = {
                title: quickAddTitleValue.trim(),
                area: formData.area || undefined
            };
            console.log('Creating new observation title:', payload);

            const res = await fetch('/api/settings/titles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const newTitle = await res.json();
                console.log('Observation title created successfully:', newTitle);

                // Validate response
                if (!newTitle._id || !newTitle.title) {
                    console.error('Invalid title response:', newTitle);
                    setQuickAddError('Invalid response from server');
                    return;
                }

                // Add new title and sort alphabetically
                const updatedTitles = [...metaTitles, newTitle].sort((a, b) =>
                    a.title.localeCompare(b.title)
                );
                setMetaTitles(updatedTitles);

                // Auto-select the new title
                setFormData({ ...formData, title: newTitle.title });

                // Clear and close popup
                setQuickAddTitleValue('');
                setShowQuickAddTitle(false);

                console.log('Updated titles list:', updatedTitles);
            } else {
                const errorData = await res.json();
                console.error('Failed to create title:', errorData);
                setQuickAddError(errorData.error || 'Failed to create title');
            }
        } catch (error) {
            console.error('Network error creating title:', error);
            setQuickAddError('Network error. Please try again.');
        } finally {
            setQuickAddLoading(false);
        }
    };

    const closeQuickAddPopups = () => {
        setShowQuickAddArea(false);
        setShowQuickAddTitle(false);
        setQuickAddAreaValue('');
        setQuickAddTitleValue('');
        setQuickAddError(null);
    };

    if (session.data?.user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <AppHeader title="Manage Templates" />
            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Observation Templates</h1>
                        <p className="text-slate-500">Manage standard observations for quick reporting.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Collapse Controls */}
                        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAll(false)}
                                className="h-8 px-2 text-slate-600 hover:text-indigo-600"
                                title="Expand All"
                            >
                                <ChevronsDown className="w-4 h-4 mr-1" /> Expand
                            </Button>
                            <div className="w-px h-4 bg-slate-200"></div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleAll(true)}
                                className="h-8 px-2 text-slate-600 hover:text-indigo-600"
                                title="Collapse All"
                            >
                                <ChevronsUp className="w-4 h-4 mr-1" /> Collapse
                            </Button>
                        </div>

                        <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                            <Plus className="w-4 h-4 mr-2" /> Add Template
                        </Button>
                    </div>
                </div>

                {/* List Section - Full Width */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10">Loading templates...</div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-dashed">
                            No templates found. Create one to get started.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sortedAreas.map(area => (
                                <div key={area} className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
                                    <div
                                        className="px-6 py-4 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none group"
                                        onClick={() => toggleArea(area)}
                                    >
                                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-3">
                                            {area}
                                            <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors">
                                                {groupedTemplates[area].length}
                                            </span>
                                        </h3>
                                        <div className="p-1 rounded-full text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                                            {collapsedAreas[area] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                                        </div>
                                    </div>

                                    {!collapsedAreas[area] && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                            {groupedTemplates[area].map(t => (
                                                <Card key={t._id} className="hover:shadow-md transition-shadow group/card relative border-slate-200">
                                                    <CardContent className="p-5">
                                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
                                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-white shadow-sm border text-slate-500 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => openEditModal(t)}>
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-white shadow-sm border text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(t._id)}>
                                                                <Trash className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>

                                                        <div className="mb-3">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {/* Area badge removed as it is now grouped */}
                                                                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full font-bold border ${t.risk === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    t.risk === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                        'bg-green-50 text-green-700 border-green-200'
                                                                    }`}>
                                                                    {t.risk}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-bold text-slate-900 text-base leading-tight pr-6">{t.title}</h3>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {t.actionPlan && (
                                                                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100/80">
                                                                    <span className="font-bold text-[9px] uppercase text-slate-400 block mb-1 tracking-wider">Action Plan</span>
                                                                    <p className="line-clamp-2 leading-relaxed">{t.actionPlan}</p>
                                                                </div>
                                                            )}
                                                            {/* Creator Information */}
                                                            {t.creatorName && (
                                                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                        <span className="font-medium">Created by:</span>
                                                                        <span className="text-slate-700 font-semibold">{t.creatorName}</span>
                                                                    </div>
                                                                    {t.createdAt && (
                                                                        <span className="text-[10px] text-slate-400">
                                                                            - {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingId ? 'Edit Template' : 'Add New Template'}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={closeModal} className="h-8 w-8 p-0 rounded-full">
                                <X className="w-5 h-5 text-slate-400" />
                            </Button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="templateForm" onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Area</label>
                                        <div className="flex gap-2 relative w-full">
                                            <select
                                                className="flex-1 min-w-0 h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                value={formData.area}
                                                onChange={e => setFormData({ ...formData, area: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Area...</option>
                                                {metaAreas.map(area => (
                                                    <option key={area._id} value={area.name}>{area.name}</option>
                                                ))}
                                            </select>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-10 w-10 p-0 shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                                onClick={() => setShowQuickAddArea(!showQuickAddArea)}
                                                title="Add New Area"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>

                                            {/* Quick Add Area Popup */}
                                            {showQuickAddArea && (
                                                <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border border-slate-200 rounded-lg shadow-lg z-50 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-slate-700">Add New Area</span>
                                                        <button
                                                            type="button"
                                                            onClick={closeQuickAddPopups}
                                                            className="text-slate-400 hover:text-slate-600"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter area name..."
                                                        value={quickAddAreaValue}
                                                        onChange={(e) => setQuickAddAreaValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleQuickAddArea();
                                                            }
                                                        }}
                                                        className="h-8 text-sm"
                                                        autoFocus
                                                    />
                                                    {quickAddError && (
                                                        <p className="text-xs text-red-600">{quickAddError}</p>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            onClick={handleQuickAddArea}
                                                            disabled={quickAddLoading || !quickAddAreaValue.trim()}
                                                            className="flex-1 h-7 bg-indigo-600 hover:bg-indigo-700 text-xs"
                                                        >
                                                            {quickAddLoading ? 'Adding...' : 'Add Area'}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={closeQuickAddPopups}
                                                            className="h-7 text-xs"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Risk Level</label>
                                        <select
                                            className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={formData.risk}
                                            onChange={e => setFormData({ ...formData, risk: e.target.value as any })}
                                        >
                                            <option value="High">High Risk</option>
                                            <option value="Medium">Medium Risk</option>
                                            <option value="Low">Low Risk</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Observation Title</label>
                                    <div className="flex gap-2 relative w-full">
                                        <select
                                            className="flex-1 min-w-0 h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-bold text-slate-700"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Observation Title...</option>
                                            {metaTitles
                                                .filter(t => !formData.area || !t.area || t.area === formData.area)
                                                .map(title => (
                                                    <option key={title._id} value={title.title}>{title.title}</option>
                                                ))}
                                        </select>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="h-10 w-10 p-0 shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                            onClick={() => setShowQuickAddTitle(!showQuickAddTitle)}
                                            title="Add New Observation Title"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>

                                        {/* Quick Add Title Popup */}
                                        {showQuickAddTitle && (
                                            <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border border-slate-200 rounded-lg shadow-lg z-50 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-700">Add New Observation Title</span>
                                                    <button
                                                        type="button"
                                                        onClick={closeQuickAddPopups}
                                                        className="text-slate-400 hover:text-slate-600"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <Input
                                                    type="text"
                                                    placeholder="Enter observation title..."
                                                    value={quickAddTitleValue}
                                                    onChange={(e) => setQuickAddTitleValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleQuickAddTitle();
                                                        }
                                                    }}
                                                    className="h-8 text-sm"
                                                    autoFocus
                                                />
                                                {formData.area && (
                                                    <p className="text-xs text-slate-500">
                                                        Will be associated with area: <span className="font-semibold">{formData.area}</span>
                                                    </p>
                                                )}
                                                {quickAddError && (
                                                    <p className="text-xs text-red-600">{quickAddError}</p>
                                                )}
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={handleQuickAddTitle}
                                                        disabled={quickAddLoading || !quickAddTitleValue.trim()}
                                                        className="flex-1 h-7 bg-indigo-600 hover:bg-indigo-700 text-xs"
                                                    >
                                                        {quickAddLoading ? 'Adding...' : 'Add Title'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={closeQuickAddPopups}
                                                        className="h-7 text-xs"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2 border-t border-slate-100/80">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Background</label>
                                        <Textarea
                                            value={formData.background}
                                            onChange={e => setFormData({ ...formData, background: e.target.value })}
                                            placeholder="Details about the process or standard practice..."
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Observation Text</label>
                                        <Textarea
                                            value={formData.observation}
                                            onChange={e => setFormData({ ...formData, observation: e.target.value })}
                                            placeholder="Details of the finding or issue..."
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Implication</label>
                                            <Textarea
                                                value={formData.implication}
                                                onChange={e => setFormData({ ...formData, implication: e.target.value })}
                                                placeholder="Risk or impact..."
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Recommendation</label>
                                            <Textarea
                                                value={formData.recommendation}
                                                onChange={e => setFormData({ ...formData, recommendation: e.target.value })}
                                                placeholder="Suggested fix..."
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Default Action Plan</label>
                                        <Textarea
                                            value={formData.actionPlan}
                                            onChange={e => setFormData({ ...formData, actionPlan: e.target.value })}
                                            placeholder="Standard management response..."
                                            className="min-h-[80px] bg-slate-50"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button type="submit" form="templateForm" className="bg-sky-900 hover:bg-sky-800 min-w-[120px]">
                                {editingId ? 'Update Template' : 'Create Template'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

