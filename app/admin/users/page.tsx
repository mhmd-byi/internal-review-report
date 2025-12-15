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
        password: '',
        role: 'user',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            setSuccess('User created successfully');
            setFormData({ name: '', email: '', phone: '', password: '', role: 'user' });
            fetchUsers(); // Refresh list
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
                                <CardTitle>Create New User</CardTitle>
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
                                        <label className="text-sm font-medium">Role</label>
                                        <Select name="role" value={formData.role} onChange={handleChange}>
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Password</label>
                                        <Input name="password" type="password" value={formData.password} onChange={handleChange} required />
                                    </div>

                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                    {success && <p className="text-green-500 text-sm">{success}</p>}

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? 'Creating...' : 'Create User'}
                                    </Button>
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="p-4 text-center text-slate-500">No users found</td>
                                                </tr>
                                            ) : (
                                                users.map((user) => (
                                                    <tr key={user._id} className="border-b hover:bg-slate-50">
                                                        <td className="p-3">{user.name}</td>
                                                        <td className="p-3">{user.email}</td>
                                                        <td className="p-3 capitalize">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {user.role}
                                                            </span>
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
