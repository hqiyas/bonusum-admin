'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, X, Building2, Mail, Phone, Edit2 } from 'lucide-react';

const EMPTY = { name:'', email:'', phone:'', address:'', contact_name:'', notes:'', plan_id:'' };

const PLAN_STYLES: Record<string, { bg: string; text: string }> = {
  starter: { bg: 'bg-gray-100', text: 'text-gray-600' },
  professional: { bg: 'bg-blue-50', text: 'text-blue-600' },
  advanced: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

export default function Companies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState<any>(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [plans,     setPlans]     = useState<any[]>([]);
  const [error,     setError]     = useState('');

  const load = () => {
    setLoading(true);
    api.get('/companies')
      .then(r => setCompanies(r.data.companies || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get('/plans').then(r => setPlans(r.data.plans || [])).catch(() => {});
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email||'', phone: c.phone||'',
              address: c.address||'', contact_name: c.contact_name||'', notes: c.notes||'', plan_id: c.plan_id||'' });
    setError(''); setShowModal(true);
  };

  const save = async (e: any) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editing) await api.put(`/companies/${editing.id}`, form);
      else         await api.post('/companies', form);
      setShowModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Xəta baş verdi');
    } finally { setSaving(false); }
  };

  const deactivate = async (id: string) => {
    if (!confirm('Şirkəti deaktiv etmək istəyirsiniz?')) return;
    await api.delete(`/companies/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Şirkətlər</h1>
          <p className="text-gray-500 text-sm">{companies.length} şirkət</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Şirkət Əlavə Et
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#1a1a2e]/20 border-t-[#1a1a2e] rounded-full animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="card p-16 text-center">
          <Building2 size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Hələ şirkət yoxdur</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {companies.map((c: any) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#1a1a2e] rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                      {c.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${c.status==='active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {c.status==='active' ? 'Aktiv' : 'Deaktiv'}
                      </span>
                      {c.plan_name && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(PLAN_STYLES[c.plan_name] || PLAN_STYLES.starter).bg} ${(PLAN_STYLES[c.plan_name] || PLAN_STYLES.starter).text}`}>
                          {c.plan_display_name || c.plan_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400 flex-wrap ml-13">
                    {c.contact_name && <span>👤 {c.contact_name}</span>}
                    {c.email && <span className="flex items-center gap-1"><Mail size={10}/> {c.email}</span>}
                    {c.phone && <span className="flex items-center gap-1"><Phone size={10}/> {c.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {c.license_status === 'active' ? (
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Lisenziya</p>
                      <p className={`text-sm font-semibold ${
                        c.days_left <= 30 ? 'text-orange-500' : 'text-green-600'}`}>
                        {c.days_left} gün
                      </p>
                      <p className="text-xs text-gray-400">{c.employee_limit} işçi</p>
                    </div>
                  ) : (
                    <span className="text-xs text-red-400 bg-red-50 px-2 py-1 rounded-lg">Lisenziya yox</span>
                  )}
                  <button onClick={() => openEdit(c)}
                    className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-all">
                    <Edit2 size={16} />
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
                {editing ? 'Şirkəti Redaktə et' : 'Yeni Şirkət'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Şirkət adı *</label>
                <input required className="input-field" placeholder="Avrora MMC"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" className="input-field" placeholder="info@sirket.az"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                  <input className="input-field" placeholder="+994 50 000 00 00"
                    value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Əlaqə şəxsi</label>
                <input className="input-field" placeholder="Ad Soyad"
                  value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ünvan</label>
                <input className="input-field" placeholder="Bakı, Azərbaycan"
                  value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Qeyd</label>
                <textarea className="input-field h-20 resize-none"
                  value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((p: any) => (
                    <button key={p.id} type="button" onClick={() => setForm({...form, plan_id: p.id})}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        form.plan_id === p.id
                          ? 'border-[#1a1a2e] bg-[#1a1a2e]/5'
                          : 'border-gray-200 hover:border-gray-300'}`}>
                      <p className="font-semibold text-sm text-gray-900">{p.display_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">${p.price_per_user}/istifadəçi</p>
                      <p className="text-xs text-gray-300 mt-0.5">{p.modules?.length} modul</p>
                    </button>
                  ))}
                </div>
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