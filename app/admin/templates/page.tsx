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
                                        <select
                                            className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={formData.area}
                                            onChange={e => setFormData({ ...formData, area: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Area...</option>
                                            {metaAreas.map(area => (
                                                <option key={area._id} value={area.name}>{area.name}</option>
                                            ))}
                                        </select>
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
                                    <select
                                        className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-bold text-slate-700"
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
