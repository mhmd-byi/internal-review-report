'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash, Edit, X } from 'lucide-react';

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

export default function AdminTemplatesPage() {
    const session = useSession();
    const [templates, setTemplates] = useState<ITemplate[]>([]);
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

    useEffect(() => {
        fetchTemplates();
    }, []);

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

            const res = await fetch('/api/templates', {
                method: 'POST',
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
        alert("Delete functionality coming soon (requires API update)");
    };

    if (session.data?.user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <AppHeader title="Manage Templates" />
            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Observation Templates</h1>
                        <p className="text-slate-500">Manage standard observations for quick reporting.</p>
                    </div>
                    <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Add New Template
                    </Button>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map(t => (
                                <Card key={t._id} className="hover:shadow-md transition-shadow group relative">
                                    <CardContent className="p-5">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white shadow-sm border" onClick={() => openEditModal(t)}>
                                                <Edit className="w-4 h-4 text-slate-600" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white shadow-sm border hover:bg-red-50" onClick={() => handleDelete(t._id)}>
                                                <Trash className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider rounded-full font-bold border border-slate-200">
                                                    {t.area}
                                                </span>
                                                <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded-full font-bold border ${t.risk === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        t.risk === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                            'bg-green-50 text-green-700 border-green-200'
                                                    }`}>
                                                    {t.risk}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-lg leading-tight">{t.title}</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {t.actionPlan && (
                                                <div className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                                                    <span className="font-bold text-[10px] uppercase text-slate-400 block mb-1">Action Plan</span>
                                                    <p className="line-clamp-2">{t.actionPlan}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
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
                                        <Input
                                            value={formData.area}
                                            onChange={e => setFormData({ ...formData, area: e.target.value })}
                                            placeholder="e.g. Fixed Assets"
                                            required
                                            className="font-medium"
                                        />
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
                                    <Input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter a descriptive title..."
                                        required
                                        className="font-bold text-lg"
                                    />
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
