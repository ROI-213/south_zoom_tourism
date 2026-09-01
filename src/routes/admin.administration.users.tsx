import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, Shield, User, Loader2, Edit2, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/admin/administration/users')({
  component: AdminUsersPage,
});

const ROLES = ['Super Admin', 'Operations Manager', 'Content Manager', 'Booking Manager', 'Viewer'];

type AdminUser = {
  id: string;
  email: string;
  name?: string;
  role_id?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
};

const defaultUsers: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'admin@southzoom.com',
    name: 'Super Administrator',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(defaultUsers);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Super Admin', is_active: true });
  const [saving, setSaving] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('admins').select('*').order('created_at');
    if (data && data.length > 0) {
      setUsers(data);
    } else {
      setUsers(defaultUsers);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleSave() {
    if (!form.email) {
      toast.error('Email is required');
      return;
    }
    setSaving(true);
    try {
      const newUser: AdminUser = {
        id: `user-${Date.now()}`,
        name: form.name,
        email: form.email,
        is_active: form.is_active,
        created_at: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      toast.success('Admin user added');
      setDialogOpen(false);
      setForm({ name: '', email: '', role: 'Super Admin', is_active: true });
    } catch (e: any) {
      toast.error(e.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Admin Users & Access Control</h1>
          <p className="text-sm text-gray-500">Manage administrator accounts, roles and system permissions</p>
        </div>
        <Button
          onClick={() => {
            setForm({ name: '', email: '', role: 'Super Admin', is_active: true });
            setDialogOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          <Plus size={16} /> Add Admin User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-3">Administrator</th>
                    <th className="text-left px-4 py-3">Email Address</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                            {u.name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{u.name || 'Admin'}</div>
                            <div className="text-xs text-gray-400">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">{u.email}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                          Super Admin
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.email !== 'admin@southzoom.com' && (
                          <button
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                            onClick={() => setDeleteId(u.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Administrator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                placeholder="e.g. Operations Lead"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Email Address *</Label>
              <Input
                value={form.email}
                placeholder="admin@southzoom.com"
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Adding...</> : 'Add User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Administrator?</AlertDialogTitle>
            <AlertDialogDescription>This user will lose access to the admin system.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setUsers((prev) => prev.filter((u) => u.id !== deleteId));
                toast.success('Admin user removed');
                setDeleteId(null);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
