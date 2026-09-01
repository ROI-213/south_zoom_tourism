import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Search, Wrench, Loader2, Edit2, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/admin/products/services')({
  component: ServicesAdminPage,
});

type Service = {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  icon?: string;
  main_image?: string;
  active: boolean;
  display_order: number;
  created_at: string;
};

const emptyForm = {
  name: '',
  slug: '',
  short_description: '',
  full_description: '',
  icon: '🚕',
  main_image: '',
  active: true,
  display_order: 0,
};

function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchServices() {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('display_order');
    setServices(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchServices();
  }, []);

  const filtered = services.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    if (!form.name) {
      toast.error('Service name is required');
      return;
    }
    setSaving(true);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = {
        name: form.name,
        slug,
        short_description: form.short_description,
        full_description: form.full_description,
        icon: form.icon,
        main_image: form.main_image,
        active: form.active,
        display_order: +form.display_order,
      };

      if (editId) {
        await supabase.from('services').update(payload).eq('id', editId);
        toast.success('Service updated');
      } else {
        await supabase.from('services').insert(payload);
        toast.success('Service added');
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditId(null);
      fetchServices();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Services Management</h1>
          <p className="text-sm text-gray-500">Configure public services (Local Taxis, Outstation, Airport Transfer, Corporate, etc.)</p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setEditId(null);
            setDialogOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          <Plus size={16} /> Add Service
        </Button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search services..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wrench className="mx-auto mb-2 opacity-30" size={32} />
              <p>No services found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-3">Order</th>
                    <th className="text-left px-4 py-3">Service</th>
                    <th className="text-left px-4 py-3">Slug</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Short Description</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.display_order}</td>
                      <td className="px-4 py-3 font-medium">
                        <span className="mr-2">{s.icon || '🚕'}</span>
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">/{s.slug}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell max-w-xs truncate">
                        {s.short_description || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {s.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            className="p-1.5 rounded hover:bg-gray-100"
                            onClick={() => {
                              setEditId(s.id);
                              setForm({
                                name: s.name,
                                slug: s.slug,
                                short_description: s.short_description || '',
                                full_description: s.full_description || '',
                                icon: s.icon || '🚕',
                                main_image: s.main_image || '',
                                active: s.active,
                                display_order: s.display_order,
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                            onClick={() => setDeleteId(s.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Service' : 'Add Service'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Service Name *</Label>
              <Input
                value={form.name}
                placeholder="e.g. Local Taxi, Outstation Cab"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                placeholder="e.g. outstation-cabs"
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Icon / Emoji</Label>
              <Input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Short Description</Label>
              <Input
                value={form.short_description}
                onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Full Description</Label>
              <Textarea
                rows={3}
                value={form.full_description}
                onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: +e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
              <Label>Active on Site</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Saving...</> : 'Save Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await supabase.from('services').delete().eq('id', deleteId!);
                toast.success('Service deleted');
                setDeleteId(null);
                fetchServices();
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
