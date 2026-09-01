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
import { Plus, HelpCircle, Loader2, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Route = createFileRoute('/admin/content/faqs')({
  component: FaqsPage,
});

const CATEGORIES = ['General', 'Pricing', 'Booking', 'Cancellation', 'Fleet', 'Packages', 'Hotels'];
type Faq = { id: string; question: string; answer: string; category?: string; active: boolean; display_order: number; created_at: string; };
const emptyForm = { question: '', answer: '', category: 'General', active: true, display_order: 0 };

function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState('all');

  async function fetch() {
    setLoading(true);
    const { data } = await supabase.from('faqs').select('*').order('display_order').order('created_at');
    setFaqs(data || []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, []);

  const filtered = catFilter === 'all' ? faqs : faqs.filter(f => f.category === catFilter);

  async function handleSave() {
    if (!form.question || !form.answer) { toast.error('Question and answer required'); return; }
    setSaving(true);
    try {
      if (editId) { await supabase.from('faqs').update(form).eq('id', editId); toast.success('FAQ updated'); }
      else {
        const maxOrder = faqs.reduce((max, f) => Math.max(max, f.display_order), 0);
        await supabase.from('faqs').insert({ ...form, display_order: maxOrder + 1 });
        toast.success('FAQ added — will appear on public FAQs page');
      }
      setDialogOpen(false); setForm(emptyForm); setEditId(null); fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function moveOrder(id: string, direction: 'up' | 'down') {
    const idx = faqs.findIndex(f => f.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= faqs.length) return;
    const a = faqs[idx], b = faqs[swapIdx];
    await Promise.all([
      supabase.from('faqs').update({ display_order: b.display_order }).eq('id', a.id),
      supabase.from('faqs').update({ display_order: a.display_order }).eq('id', b.id),
    ]);
    fetch();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">FAQs</h1><p className="text-sm text-gray-500">Manage frequently asked questions on the website</p></div>
        <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus size={16} /> Add FAQ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><HelpCircle size={22} className="text-blue-500"/><div><div className="text-xl font-bold">{faqs.length}</div><div className="text-xs text-gray-500">Total FAQs</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><HelpCircle size={22} className="text-green-500"/><div><div className="text-xl font-bold">{faqs.filter(f => f.active).length}</div><div className="text-xs text-gray-500">Active</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><HelpCircle size={22} className="text-gray-400"/><div><div className="text-xl font-bold">{faqs.filter(f => !f.active).length}</div><div className="text-xs text-gray-500">Hidden</div></div></CardContent></Card>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCatFilter('all')} className={`px-3 py-1 rounded-lg text-sm font-medium ${catFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1 rounded-lg text-sm font-medium ${catFilter === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{c}</button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>
        : filtered.length === 0 ? <div className="text-center py-12 text-gray-400"><HelpCircle className="mx-auto mb-2 opacity-30" size={32}/><p>No FAQs found</p></div>
        : <div className="space-y-2">
          {filtered.map((faq, idx) => (
            <Card key={faq.id} className={!faq.active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-0.5">
                    <button onClick={() => moveOrder(faq.id, 'up')} disabled={idx === 0} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronUp size={14}/></button>
                    <button onClick={() => moveOrder(faq.id, 'down')} disabled={idx === filtered.length - 1} className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronDown size={14}/></button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{faq.question}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {faq.category && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{faq.category}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${faq.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{faq.active ? 'Active' : 'Hidden'}</span>
                        <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => { setEditId(faq.id); setForm({question:faq.question,answer:faq.answer,category:faq.category||'General',active:faq.active,display_order:faq.display_order}); setDialogOpen(true); }}><Edit2 size={13}/></button>
                        <button className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => setDeleteId(faq.id)}><Trash2 size={13}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><Label>Question *</Label><Input value={form.question} onChange={e => setForm(f => ({...f, question: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Answer *</Label><Textarea rows={4} value={form.answer} onChange={e => setForm(f => ({...f, answer: e.target.value}))}/></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-5"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({...f, active: v}))}/><Label>Active</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1"/>Saving...</> : 'Save FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete FAQ?</AlertDialogTitle><AlertDialogDescription>This will remove the FAQ from the public website.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await supabase.from('faqs').delete().eq('id', deleteId!); toast.success('Deleted'); setDeleteId(null); fetch(); }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
