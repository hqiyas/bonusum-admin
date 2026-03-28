'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, X, Edit2, Trash2, Tag } from 'lucide-react';

const CATEGORIES = [
  { key:'restoran',  label:'🍕 Restoran'  },
  { key:'magaza',    label:'🛒 Mağaza'    },
  { key:'saglamliq', label:'💊 Sağlamlıq' },
  { key:'eylence',   label:'🎭 Əyləncə'  },
  { key:'turizm',    label:'✈️ Turizm'   },
  { key:'idman',     label:'🏋️ İdman'    },
  { key:'tehsil',    label:'📚 Təhsil'   },
  { key:'other',     label:'📦 Digər'    },
];

const EMPTY = {
  vendor_id:'', title:'', description:'', category:'restoran',
  discount_type:'percent', percent:'', amount:'', monthly_limit:'10',
};

export default function Discounts() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [vendors,   setVendors]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<any>(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/discounts'),
      api.get('/vendors'),
    ]).then(([d, v]) => {
      setDiscounts(d.data.discounts || []);
      setVendors(v.data.vendors?.filter((v: any) => v.status === 'active') || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null); setForm(EMPTY); setError(''); setShowModal(true);
  };

  const openEdit = (d: any) => {
    setEditing(d);
    setForm({
      vendor_id:     d.vendor_id,
      title:         d.title,
      description:   d.description || '',
      category:      d.category || 'restoran',
      discount_type: d.discount_type,
      percent:       d.percent || '',
      amount:        d.amount || '',
      monthly_limit: d.monthly_limit || '10',
    });
    setError(''); setShowModal(true);
  };

  const save = async (e: any) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        percent:       form.discount_type === 'percent' ? parseFloat(form.percent) : null,
        amount:        form.discount_type === 'amount'  ? parseFloat(form.amount)  : null,
        monthly_limit: parseInt(form.monthly_limit),
      };
      if (editing) await api.put(`/discounts/${editing.id}`, payload);
      else         await api.post('/discounts', payload);
      setShowModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Xəta baş verdi');
    } finally { setSaving(false); }
  };

  const deactivate = async (id: string) => {
    if (!confirm('Endirimi deaktiv etmək istəyirsiniz? Müştərilərdə də görünməyəcək.')) return;
    await api.delete(`/discounts/${id}`);
    load();
  };

  const catLabel = (key: string) => CATEGORIES.find(c => c.key === key)?.label || key;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Endirimlər</h1>
          <p className="text-gray-500 text-sm">{discounts.length} endirim — bütün müştərilərə göndərilir</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Endirim Əlavə Et
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#1a1a2e]/20 border-t-[#1a1a2e] rounded-full animate-spin" />
        </div>
      ) : discounts.length === 0 ? (
        <div className="card p-16 text-center">
          <Tag size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Hələ endirim yoxdur</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {discounts.map((d: any) => (
            <div key={d.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{d.title}</h3>
                    <span className="text-xs text-gray-400">{catLabel(d.category)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      d.status==='active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {d.status==='active' ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </div>
                  {d.description && <p className="text-sm text-gray-500 mb-2">{d.description}</p>}
                  <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                    <span>🏪 {d.vendor_name}</span>
                    <span>📊 Aylıq limit: {d.monthly_limit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-[#1a1a2e] text-xl">
                      {d.discount_type==='percent' ? `${d.percent}%` : `${d.amount}₼`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {d.discount_type==='percent' ? 'endirim' : 'məbləğ'}
                    </p>
                  </div>
                  <button onClick={() => openEdit(d)}
                    className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deactivate(d.id)}
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">
                {editing ? 'Endirimi Redaktə et' : 'Yeni Endirim'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor *</label>
                <select required className="input-field" value={form.vendor_id}
                  onChange={e => setForm({...form, vendor_id: e.target.value})}>
                  <option value="">— Vendor seç —</option>
                  {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Endirim adı *</label>
                <input required className="input-field" placeholder="Məs: 20% endirim"
                  value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kateqoriya</label>
                <select className="input-field" value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıqlama</label>
                <textarea className="input-field h-20 resize-none"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Endirim növü *</label>
                <div className="flex gap-2">
                  {[{key:'percent',label:'Faiz (%)'},{key:'amount',label:'Məbləğ (₼)'}].map(t => (
                    <button key={t.key} type="button"
                      onClick={() => setForm({...form, discount_type: t.key})}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                        ${form.discount_type===t.key
                          ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {form.discount_type==='percent' ? 'Faiz (%)' : 'Məbləğ (₼)'} *
                </label>
                <input required type="number" min="1" className="input-field"
                  placeholder={form.discount_type==='percent' ? '20' : '10'}
                  value={form.discount_type==='percent' ? form.percent : form.amount}
                  onChange={e => form.discount_type==='percent'
                    ? setForm({...form, percent: e.target.value})
                    : setForm({...form, amount: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Aylıq limit</label>
                <input type="number" min="1" className="input-field"
                  value={form.monthly_limit}
                  onChange={e => setForm({...form, monthly_limit: e.target.value})} />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">Ləğv et</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {editing ? 'Yadda saxla' : 'Əlavə Et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}