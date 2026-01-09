'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { AppHeader } from '@/components/AppHeader';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    // responsibility removed
}

export default function AdminUsersPage() {
    const sessionObj = useSession();
    const session = sessionObj?.data;
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        itsId: '',
        password: '',
        role: 'user',
        // responsibility removed
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.role !== 'admin') {
            // router.push('/'); // Middleware handles this
        } else {
            fetchUsers();
        }
    }, [session]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (user: User & { phone?: string, itsId?: string }) => {
        setEditingId(user._id);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '', // Ensure phone is handled if present in model
            itsId: user.itsId || '',
            role: user.role,
            // responsibility removed
            password: '', // Password intentionally blank
        });
        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', email: '', phone: '', itsId: '', password: '', role: 'user' });
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setSuccess('User deleted successfully');
                fetchUsers();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to delete user');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const url = editingId ? `/api/users/${editingId}` : '/api/auth/register';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Operation failed');
            }

            setSuccess(`User ${editingId ? 'updated' : 'created'} successfully`);

            if (!editingId) {
                setFormData({ name: '', email: '', phone: '', itsId: '', password: '', role: 'user' });
            } else {
                // If editing, maybe clear password field but keep others? Or reset?
                // Typically reset form or keep it. Let's reset to exit edit mode.
                handleCancelEdit();
            }

            fetchUsers();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (session?.user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <AppHeader title="User Management" />
            <div className="p-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>{editingId ? 'Edit User' : 'Create New User'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input name="name" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone</label>
                                        <Input name="phone" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">ITS ID *</label>
                                        <Input
                                            name="itsId"
                                            value={formData.itsId}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 8) {
                                                    setFormData({ ...formData, itsId: value });
                                                }
                                            }}
                                            maxLength={8}
                                            placeholder="12345678"
                                            required
                                        />
                                        <p className="text-xs text-slate-500">8-digit numeric ID</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Role</label>
                                        <Select name="role" value={formData.role} onChange={handleChange}>
                                            <option value="user">User</option>
                                            <option value="management">Management</option>
                                            <option value="admin">Admin</option>
                                        </Select>
                                    </div>
                                    {/* Responsibility Removed */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Password {editingId && '(Leave blank to keep)'}</label>
                                        <Input name="password" type="password" value={formData.password} onChange={handleChange} required={!editingId} placeholder={editingId ? "********" : ""} />
                                    </div>

                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    {success && <p className="text-green-500 text-sm">{success}</p>}

                                    <div className="flex gap-2">
                                        {editingId && (
                                            <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1">
                                                Cancel
                                            </Button>
                                        )}
                                        <Button type="submit" className="flex-1" disabled={loading}>
                                            {loading ? 'Saving...' : (editingId ? 'Update User' : 'Create User')}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3 font-medium text-slate-500">Name</th>
                                                <th className="text-left p-3 font-medium text-slate-500">Email</th>
                                                <th className="text-left p-3 font-medium text-slate-500">Role</th>
                                                {/* Responsibility Header Removed */}
                                                <th className="text-right p-3 font-medium text-slate-500">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-slate-500">No users found</td>
                                                </tr>
                                            ) : (
                                                users.map((user) => (
                                                    <tr key={user._id} className="border-b hover:bg-slate-50">
                                                        <td className="p-3">{user.name}</td>
                                                        <td className="p-3">{user.email}</td>
                                                        <td className="p-3 capitalize">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                                user.role === 'management' ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        {/* Responsibility Cell Removed */}
                                                        <td className="p-3 text-right space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(user as any)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(user._id, user.name)}
                                                                disabled={user._id === session?.user?.id}
                                                                title={user._id === session?.user?.id ? "Cannot delete yourself" : "Delete user"}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
