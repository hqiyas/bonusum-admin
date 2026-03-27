'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Building2, Key, Users, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats,   setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label:'Şirkətlər',     value: stats?.companies  || 0, icon: Building2,   color: 'bg-blue-50   text-blue-600'   },
    { label:'Lisenziyalar',  value: stats?.licenses   || 0, icon: Key,         color: 'bg-purple-50 text-purple-600' },
    { label:'İşçilər',       value: stats?.employees  || 0, icon: Users,       color: 'bg-green-50  text-green-600'  },
    { label:'Aktiv lisenz.', value: stats?.active_lic || 0, icon: TrendingUp,  color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Ümumi statistika</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#1a1a2e]/20 border-t-[#1a1a2e] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(c => (
            <div key={c.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color.split(' ')[0]}`}>
                <c.icon size={20} className={c.color.split(' ')[1]} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{c.value}</p>
              <p className="text-sm text-gray-400 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tezliklə bitəcək lisenziyalar */}
      {stats?.expiring_soon?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">⚠️ Tezliklə bitəcək lisenziyalar</h2>
          <div className="space-y-3">
            {stats.expiring_soon.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{l.company_name}</p>
                  <p className="text-xs text-gray-400">{l.employee_limit} işçi limiti</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-500">{l.days_left} gün</p>
                  <p className="text-xs text-gray-400">
                    {new Date(l.end_date).toLocaleDateString('az-AZ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}