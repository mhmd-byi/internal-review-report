'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select } from '@/components/ui/select'; // If needed for Title-Area link, though simpler text match might suffice for now
import { Plus, Trash, Settings, ShieldCheck, FileType, Pencil, Check, X } from 'lucide-react';

interface Area {
    _id: string;
    name: string;
}

interface Title {
    _id: string;
    title: string;
    area?: string;
}

export default function SettingsPage() {
    const session = useSession();
    const [areas, setAreas] = useState<Area[]>([]);
    const [titles, setTitles] = useState<Title[]>([]);

    // Forms
    const [newArea, setNewArea] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [selectedAreaForTitle, setSelectedAreaForTitle] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session.status === 'authenticated') {
            fetchData();
        }
    }, [session.status]);

    const fetchData = async () => {
        try {
            const [areasRes, titlesRes] = await Promise.all([
                fetch('/api/settings/areas'),
                fetch('/api/settings/titles')
            ]);

            if (areasRes.ok) setAreas(await areasRes.json());
            if (titlesRes.ok) setTitles(await titlesRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddArea = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/settings/areas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newArea })
            });
            if (res.ok) {
                setNewArea('');
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteArea = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/settings/areas/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddTitle = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/settings/titles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, area: selectedAreaForTitle || undefined })
            });
            if (res.ok) {
                setNewTitle('');
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTitle = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/settings/titles/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    // Edit Title State
    const [editingTitle, setEditingTitle] = useState<Title | null>(null);

    const startEditingTitle = (title: Title) => {
        setEditingTitle(title);
    };

    const cancelEditingTitle = () => {
        setEditingTitle(null);
    };

    const saveEditingTitle = async () => {
        if (!editingTitle) return;
        try {
            const res = await fetch(`/api/settings/titles/${editingTitle._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editingTitle.title, area: editingTitle.area })
            });
            if (res.ok) {
                setEditingTitle(null);
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (session.data?.user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AppHeader title="Settings" />
            <div className="p-8 max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Settings className="w-8 h-8 text-slate-400" />
                        System Settings
                    </h1>
                    <p className="text-slate-500 mt-2">Manage dropdown values for Areas and Titles.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Areas Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                Areas
                            </CardTitle>
                            <CardDescription>Departments or scopes for audits</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleAddArea} className="flex gap-2">
                                <Input
                                    placeholder="New Area Name..."
                                    value={newArea}
                                    onChange={e => setNewArea(e.target.value)}
                                    required
                                />
                                <Button type="submit" size="icon" className="shrink-0 bg-indigo-600">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </form>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {areas.map(area => (
                                    <div key={area._id} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100 group">
                                        <span className="font-medium text-slate-700">{area.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteArea(area._id)}
                                        >
                                            <Trash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {areas.length === 0 && !loading && <div className="text-center text-slate-400 text-sm py-4">No areas defined</div>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Titles Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileType className="w-5 h-5 text-emerald-600" />
                                Observation Titles
                            </CardTitle>
                            <CardDescription>Standard observation titles linked to areas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleAddTitle} className="space-y-3">
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-2">
                                        <select
                                            className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm"
                                            value={selectedAreaForTitle}
                                            onChange={e => setSelectedAreaForTitle(e.target.value)}
                                        >
                                            <option value="">(All Areas)</option>
                                            {areas.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
                                        </select>
                                        <Input
                                            placeholder="New Observation Title..."
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" size="icon" className="mt-auto bg-emerald-600 h-10 w-10 shrink-0">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </form>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {titles.map(title => (
                                    <div key={title._id} className="flex flex-col p-3 bg-slate-50 rounded border border-slate-100 group">
                                        {editingTitle?._id === title._id ? (
                                            <div className="flex flex-col gap-2 w-full">
                                                <select
                                                    className="w-full h-8 px-2 text-xs bg-white border border-slate-300 rounded"
                                                    value={editingTitle.area || ''}
                                                    onChange={e => setEditingTitle({ ...editingTitle, area: e.target.value })}
                                                >
                                                    <option value="">(No Area)</option>
                                                    {areas.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
                                                </select>
                                                <Input
                                                    className="h-8 text-sm"
                                                    value={editingTitle.title}
                                                    onChange={e => setEditingTitle({ ...editingTitle, title: e.target.value })}
                                                />
                                                <div className="flex justify-end gap-2 mt-1">
                                                    <Button size="sm" variant="ghost" onClick={cancelEditingTitle} className="h-7 w-7 p-0 text-slate-500">
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={saveEditingTitle} className="h-7 w-7 p-0 text-green-600 hover:bg-green-50">
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center w-full">
                                                <div>
                                                    <div className="font-medium text-slate-700">{title.title}</div>
                                                    {title.area && <div className="text-xs text-slate-400">{title.area}</div>}
                                                </div>
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                        onClick={() => startEditingTitle(title)}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-700 hover:bg-red-50 ml-1"
                                                        onClick={() => handleDeleteTitle(title._id)}
                                                    >
                                                        <Trash className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {titles.length === 0 && !loading && <div className="text-center text-slate-400 text-sm py-4">No titles defined</div>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
