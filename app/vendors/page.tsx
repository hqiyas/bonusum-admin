'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, X, Edit2, Store } from 'lucide-react';

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

const EMPTY = { name:'', category:'restoran', description:'', logo_url:'', website:'' };

export default function Vendors() {
  const [vendors,   setVendors]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<any>(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const load = () => {
    setLoading(true);
    api.get('/vendors')
      .then(r => setVendors(r.data.vendors || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (v: any) => {
    setEditing(v);
    setForm({ name: v.name, category: v.category||'restoran',
              description: v.description||'', logo_url: v.logo_url||'', website: v.website||'' });
    setError(''); setShowModal(true);
  };

  const save = async (e: any) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editing) await api.put(`/vendors/${editing.id}`, form);
      else         await api.post('/vendors', form);
      setShowModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Xəta baş verdi');
    } finally { setSaving(false); }
  };

  const deactivate = async (id: string) => {
    if (!confirm('Vendoru deaktiv etmək istəyirsiniz?')) return;
    await api.delete(`/vendors/${id}`);
    load();
  };

  const catLabel = (key: string) => CATEGORIES.find(c => c.key === key)?.label || key;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendorlar</h1>
          <p className="text-gray-500 text-sm">{vendors.length} vendor</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Vendor Əlavə Et
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#1a1a2e]/20 border-t-[#1a1a2e] rounded-full animate-spin" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="card p-16 text-center">
          <Store size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Hələ vendor yoxdur</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((v: any) => (
            <div key={v.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {v.logo_url
                    ? <img src={v.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                    : '🏪'}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(v)}
                    className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-all">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{v.name}</h3>
              <p className="text-xs text-gray-400 mb-2">{catLabel(v.category)}</p>
              {v.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{v.description}</p>}
              <div className="flex items-center justify-between">
                {v.website && (
                  <a href={v.website} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline truncate max-w-32">
                    {v.website.replace('https://', '')}
                  </a>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto
                  ${v.status==='active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {v.status==='active' ? 'Aktiv' : 'Deaktiv'}
                </span>
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
                {editing ? 'Vendoru Redaktə et' : 'Yeni Vendor'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor adı *</label>
                <input required className="input-field" placeholder="Bravo Supermarket"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
                <input type="url" className="input-field" placeholder="https://..."
                  value={form.logo_url} onChange={e => setForm({...form, logo_url: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vebsayt</label>
                <input type="url" className="input-field" placeholder="https://bravo.az"
                  value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
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