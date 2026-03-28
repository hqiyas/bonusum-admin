'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, X, Key, Copy, Check } from 'lucide-react';

const EMPTY = { company_id:'', employee_limit:'100', hr_limit:'1', start_date:'', end_date:'', price:'', notes:'' };

export default function Licenses() {
  const [licenses,  setLicenses]  = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [newKey,    setNewKey]    = useState('');
  const [copied,    setCopied]    = useState(false);
  const [error,     setError]     = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/licenses/all'),
      api.get('/companies'),
    ]).then(([l, c]) => {
      setLicenses(l.data.licenses || []);
      setCompanies(c.data.companies?.filter((c: any) => c.status === 'active') || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const generate = async (e: any) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const r = await api.post('/licenses/generate', {
        ...form,
        employee_limit: parseInt(form.employee_limit),
        hr_limit:       parseInt(form.hr_limit),
        price:          form.price ? parseFloat(form.price) : null,
      });
      setNewKey(r.data.key);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Xəta baş verdi');
    } finally { setSaving(false); }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revoke = async (id: string) => {
    if (!confirm('Lisenziyanı ləğv etmək istəyirsiniz?')) return;
    await api.put(`/licenses/${id}/revoke`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lisenziyalar</h1>
          <p className="text-gray-500 text-sm">{licenses.length} lisenziya</p>
        </div>
        <button onClick={() => { setShowModal(true); setNewKey(''); setForm(EMPTY); setError(''); }}
          className="btn-primary">
          <Plus size={16} /> Yeni Lisenziya
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#1a1a2e]/20 border-t-[#1a1a2e] rounded-full animate-spin" />
        </div>
      ) : licenses.length === 0 ? (
        <div className="card p-16 text-center">
          <Key size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Hələ lisenziya yoxdur</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {licenses.map((l: any) => (
            <div key={l.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{l.company_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      l.status==='active'    ? 'bg-green-50  text-green-600'  :
                      l.status==='cancelled' ? 'bg-red-50    text-red-500'    :
                      l.status==='expired'   ? 'bg-gray-100  text-gray-500'   :
                                               'bg-yellow-50 text-yellow-600'}`}>
                      {l.status==='active'    ? '✅ Aktiv'  :
                       l.status==='cancelled' ? '❌ Ləğv'   :
                       l.status==='expired'   ? '⏰ Bitib'  : l.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                    <span>👥 {l.employee_limit} işçi limiti</span>
                    <span>👤 {l.hr_limit} HR Admin</span>
                    <span>📅 {new Date(l.start_date).toLocaleDateString('az-AZ')} — {new Date(l.end_date).toLocaleDateString('az-AZ')}</span>
                    {l.price && <span>💰 {l.price} {l.currency}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {l.days_left !== null && l.status === 'active' && (
                    <div className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${
                      l.days_left <= 0  ? 'bg-red-50    text-red-500'    :
                      l.days_left <= 30 ? 'bg-orange-50 text-orange-500' :
                                          'bg-green-50  text-green-600'}`}>
                      {l.days_left <= 0 ? 'Bitib' : `${l.days_left} gün`}
                    </div>
                  )}
                  {l.status === 'active' && (
                    <button onClick={() => revoke(l.id)}
                      className="btn-danger text-xs py-1.5 px-3">
                      Ləğv et
                    </button>
                  )}
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
              <h3 className="font-bold text-gray-900 text-lg">Yeni Lisenziya</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {newKey ? (
              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-semibold mb-1">✅ Lisenziya yaradıldı!</p>
                  <p className="text-green-600 text-sm">Açarı müştəriyə göndərin</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lisenziya açarı</label>
                  <div className="relative">
                    <textarea readOnly className="input-field h-32 resize-none font-mono text-xs pr-12"
                      value={newKey} />
                    <button onClick={copyKey}
                      className="absolute top-3 right-3 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-500" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Kopyaladıqdan sonra bu açarı bir daha görə bilməyəcəksiniz</p>
                </div>
                <button onClick={() => { setShowModal(false); setNewKey(''); }}
                  className="btn-primary w-full justify-center">
                  Bağla
                </button>
              </div>
            ) : (
              <form onSubmit={generate} className="p-6 space-y-4">
                {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Şirkət *</label>
                  <select required className="input-field" value={form.company_id}
                    onChange={e => setForm({...form, company_id: e.target.value})}>
                    <option value="">— Şirkət seç —</option>
                    {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">İşçi limiti *</label>
                    <input required type="number" min="1" className="input-field"
                      value={form.employee_limit}
                      onChange={e => setForm({...form, employee_limit: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">HR Admin limiti</label>
                    <input type="number" min="1" className="input-field"
                      value={form.hr_limit}
                      onChange={e => setForm({...form, hr_limit: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Başlama tarixi</label>
                    <input type="date" className="input-field"
                      value={form.start_date}
                      onChange={e => setForm({...form, start_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bitmə tarixi *</label>
                    <input required type="date" className="input-field"
                      value={form.end_date}
                      onChange={e => setForm({...form, end_date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Qiymət (AZN)</label>
                  <input type="number" min="0" step="0.01" className="input-field" placeholder="1200.00"
                    value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Qeyd</label>
                  <textarea className="input-field h-20 resize-none"
                    value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-sm">Ləğv et</button>
                  <button type="submit" disabled={saving} className="btn-primary text-sm">
                    {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    <Key size={15} /> Yarat və Key Al
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}